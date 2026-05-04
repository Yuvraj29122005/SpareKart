const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Razorpay = require("razorpay");
const crypto = require("crypto");

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, directItems, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body || {};
    if (!shippingAddress || !paymentMethod) {
      return res
        .status(400)
        .json({ message: "shippingAddress and paymentMethod are required" });
    }

    if (paymentMethod === "Online Payment") {
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
             return res.status(400).json({ message: "Payment details missing" });
        }
        
        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest("hex");
        if (generated_signature !== razorpay_signature) {
             return res.status(400).json({ message: "Payment verification failed" });
        }
    }

    let items = [];
    let cart = null;

    if (directItems && directItems.length > 0) {
      items = directItems.map(item => ({
        product: item._id || item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        img: item.img || ""
      }));
    } else {
      cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      items = cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        qty: item.qty,
        img: item.product.img || ""
      }));
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      paymentStatus: paymentMethod === "Online Payment" ? "Paid" : "Pending"
    });

    // Decrease the product stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(0, product.stock - item.qty);
        await product.save();
      }
    }

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createRazorpayOrder = async (req, res) => {
   try {
    const { directItems } = req.body || {};
    let items = [];
    if (directItems && directItems.length > 0) {
      items = directItems;
    } else {
      const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      items = cart.items.map((item) => ({
        price: item.product.price,
        qty: item.qty,
      }));
    }
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: totalAmount * 100, // paise
      currency: "INR",
      receipt: "receipt_order_" + Date.now()
    };
    
    const order = await instance.orders.create(options);
    res.json({ id: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID });
   } catch (err) {
     res.status(500).json({ message: err.message });
   }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderByIdAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email").lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAllOrders = async (req, res) => {
  try {
    await Order.deleteMany({});
    res.json({ message: "All orders cleared successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
