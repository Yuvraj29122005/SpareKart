const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await cart.populate("items.product");
  }
  return cart;
};

exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, qty = 1 } = req.body || {};
    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (qty < 1) {
      return res.status(400).json({ message: "qty must be at least 1" });
    }

    const cart = await getOrCreateCart(req.user._id);
    const idx = cart.items.findIndex(
      (i) => i.product && i.product._id.toString() === productId
    );

    if (idx >= 0) {
      cart.items[idx].qty += Number(qty);
    } else {
      cart.items.push({ product: productId, qty: Number(qty) });
    }

    await cart.save();
    const populated = await cart.populate("items.product");
    res.status(200).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCartItemQty = async (req, res) => {
  try {
    const { productId, qty } = req.body || {};
    if (!productId || qty == null) {
      return res.status(400).json({ message: "productId and qty are required" });
    }

    const cart = await getOrCreateCart(req.user._id);
    const idx = cart.items.findIndex(
      (i) => i.product && i.product._id.toString() === productId
    );

    if (idx < 0) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (Number(qty) <= 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].qty = Number(qty);
    }

    await cart.save();
    const populated = await cart.populate("items.product");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter(
      (i) => i.product && i.product._id.toString() !== productId
    );
    await cart.save();
    const populated = await cart.populate("items.product");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
