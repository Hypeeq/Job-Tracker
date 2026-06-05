const User = require("../models/users");

const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ message: "Admin access required" });
        }

        req.user.isAdmin = true;
        next();
    } catch (error) {
        console.error("Admin middleware error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = adminMiddleware;