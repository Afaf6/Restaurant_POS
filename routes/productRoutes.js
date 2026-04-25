const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate");
const {createProductSchema, updateProductSchema} = require("../controllers/validation/productValidation");
const productController = require("../controllers/productController");
const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/roleMiddleware");

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProduct);

router.post("/", auth, isAdmin,validate(createProductSchema) , productController.createProduct);
router.put("/:id", auth, isAdmin,validate(updateProductSchema) , productController.updateProduct);
router.delete("/:id", auth, isAdmin, productController.deleteProduct);

module.exports = router;