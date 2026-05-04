const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    desc: { type: String, required: true, trim: true },
    img: { type: String, default: "" }
  },
  { timestamps: true }
);

// Indexes for fast product queries
productSchema.index({ category: 1 });
productSchema.index({ name: "text" });
productSchema.index({ stock: 1 });

module.exports = mongoose.model("Product", productSchema);
