const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    getUser,
    getAllUsers,
    getCurrentUser,
    resetPassword,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/reset-password", resetPassword);
router.get("/all", authMiddleware, adminMiddleware, getAllUsers);
router.get("/:id", authMiddleware, adminMiddleware, getUser);
router.put("/:id", authMiddleware, adminMiddleware, updateUser);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

module.exports = router;