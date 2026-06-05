const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
    createJob,
    adminCreateJob,
    deleteJob,
    adminDeleteJob,
    updateJob,
    adminUpdateJob,
    getJob,
    getAllJobs,
    getJobsByUserId,
} = require("../controllers/jobController");

router.use(authMiddleware);

router.post("/", createJob);
router.post("/admin", adminMiddleware, adminCreateJob);
router.put("/:id", updateJob);
router.put("/admin/:id", adminMiddleware, adminUpdateJob);
router.delete("/:id", deleteJob);
router.delete("/admin/:id", adminMiddleware, adminDeleteJob);
router.get("/user/:userId", getJobsByUserId);
router.get("/", getJob);
router.get("/all", adminMiddleware, getAllJobs);

module.exports = router;
