const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const {createProductSchema, updateProductSchema} = require("../controllers/validation/productValidation");
const productController = require("../controllers/productController");
const protect = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProduct);

router.post("/", protect, isAdmin,validate(createProductSchema) , productController.createProduct);
router.put("/:id", protect, isAdmin,validate(updateProductSchema) , productController.updateProduct);
router.delete("/:id", protect, isAdmin, productController.deleteProduct);

module.exports = router;