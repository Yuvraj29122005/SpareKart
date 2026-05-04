const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  seedProducts,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

router.get("/", getProducts);
router.post("/seed/default", seedProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/:id", getProductById);

module.exports = router;
