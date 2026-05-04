const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    img: { type: String, default: "" }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shippingAddress: { type: String, required: true, trim: true },
    paymentMethod: { type: String, required: true, trim: true },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending"
    },
    orderStatus: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing"
    },
    totalAmount: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

// Index for fast user-specific order queries
orderSchema.index({ user: 1, createdAt: -1 });
// Index for admin order listing
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
