const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { restrictTo, isSuperAdmin, isAdminOrLeader } = require("../middleware/roleMiddleware");
const { register, loginAuth, getAllUsers, deleteUser } = require("../controllers/AuthController");

// Login — public
router.post("/login", loginAuth);

// Register:
//   Super Admin can create any role
//   Team Leader can only create Cashiers (enforced in controller)
router.post("/register", protect, isAdminOrLeader, register);

// View all staff — Super Admin and Team Leader
router.get("/users", protect, isAdminOrLeader, getAllUsers);

// Delete staff — Super Admin only
router.delete("/users/:id", protect, isSuperAdmin, deleteUser);

module.exports = router;
