const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const {createProductSchema, updateProductSchema} = require("../controllers/validation/productValidation");
const productController = require("../controllers/productController");
const protect = require("../middleware/authMiddleware");
const { isAdminOrLeader } = require("../middleware/roleMiddleware");

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProduct);

// Only Super Admin and Team Leader can manage products
router.post("/", protect, isAdminOrLeader, validate(createProductSchema), productController.createProduct);
router.put("/:id", protect, isAdminOrLeader, validate(updateProductSchema), productController.updateProduct);
router.delete("/:id", protect, isAdminOrLeader, productController.deleteProduct);

module.exports = router;