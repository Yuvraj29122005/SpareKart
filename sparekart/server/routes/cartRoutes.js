const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getCart,
  addToCart,
  updateCartItemQty,
  removeFromCart,
  clearCart
} = require("../controllers/cartController");

router.use(protect);
router.get("/", getCart);
router.post("/", addToCart);
router.patch("/", updateCartItemQty);
router.delete("/:productId", removeFromCart);
router.delete("/", clearCart);

module.exports = router;
