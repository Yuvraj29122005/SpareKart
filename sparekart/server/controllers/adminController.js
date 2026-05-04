const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

exports.getDashboardStats = async (req, res) => {
  try {
    // Use aggregation pipeline and countDocuments instead of loading everything into memory
    const [productCount, userCount, orderStats, lowStock, categoryBreakdown] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ role: "user" }),
      // Single aggregation for all order stats — no more loading all orders into RAM
      Order.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            paidOrders: {
              $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] }
            },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ["$paymentStatus", "Pending"] }, 1, 0] }
            },
            totalRevenue: {
              $sum: {
                $cond: [
                  { $eq: ["$paymentStatus", "Paid"] },
                  "$totalAmount",
                  0
                ]
              }
            }
          }
        }
      ]),
      Product.find({ stock: { $lt: 15 } }).select("name stock category").lean(),
      Product.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { _id: 0, label: "$_id", count: 1 } }
      ])
    ]);

    const stats = orderStats[0] || { total: 0, paidOrders: 0, pendingOrders: 0, totalRevenue: 0 };

    res.json({
      products: productCount,
      users: userCount,
      orders: stats.total,
      paidOrders: stats.paidOrders,
      pendingOrders: stats.pendingOrders,
      totalRevenue: stats.totalRevenue,
      lowStock,
      categoryBreakdown
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // Use aggregation to join users with their order data in a single query
    const users = await User.find({ role: { $nin: ["admin", "Admin"] } }).select("-password").lean();
    
    // Single aggregation to get order counts and totals per user
    const orderStats = await Order.aggregate([
      { $group: {
        _id: "$user",
        orderCount: { $sum: 1 },
        totalSpent: { $sum: "$totalAmount" }
      }}
    ]);

    // Build a lookup map for O(1) access
    const statsMap = {};
    orderStats.forEach((s) => {
      statsMap[s._id.toString()] = s;
    });

    const mapped = users.map((u) => {
      const s = statsMap[u._id.toString()] || { orderCount: 0, totalSpent: 0 };
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone || "N/A",
        orders: s.orderCount,
        totalSpent: s.totalSpent,
        status: u.status || "Active"
      };
    });

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = status;
    await user.save();
    res.json({ message: "User status updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const Cart = require("../models/Cart");

    // Cascade-delete ALL user data permanently
    await Promise.all([
      Order.deleteMany({ user: req.params.id }),   // all orders
      Cart.deleteMany({ user: req.params.id }),     // cart
      User.deleteOne({ _id: req.params.id })        // the user itself
    ]);

    res.json({ message: "User and all associated data removed permanently" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
