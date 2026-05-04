const express = require("express");
const router = express.Router();
const { getDashboardStats, getAllUsers, updateUserStatus, deleteUser } = require("../controllers/adminController");
const { getAllOrders, getOrderByIdAdmin, deleteAllOrders } = require("../controllers/orderController");

router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);
router.get("/orders", getAllOrders);
router.delete("/orders", deleteAllOrders);
router.get("/orders/:id", getOrderByIdAdmin);

module.exports = router;
