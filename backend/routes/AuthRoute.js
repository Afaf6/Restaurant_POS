const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const { 
    register,
    loginAuth,
} = require("../controllers/AuthController");


router.post("/register", register);
// router.use(protect);
router.post("/login", loginAuth);

module.exports = router;