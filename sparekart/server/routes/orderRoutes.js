const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  createRazorpayOrder
} = require("../controllers/orderController");

router.use(protect);
router.post("/", createOrder);
router.post("/razorpay-create", createRazorpayOrder);
router.get("/my", getMyOrders);
router.get("/:id", getOrderById);

module.exports = router;
