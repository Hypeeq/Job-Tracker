const Job = require("../models/job");
const mongoose = require("mongoose");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const buildJobPayload = (body, userId) => ({
    userId,
    company: body.company,
    jobTitle: body.jobTitle,
    location: body.location,
    description: body.description,
    status: body.status,
    dateApplied: body.dateApplied,
    referenceLink: body.referenceLink,
});

const createJob = async (req, res) => {
    const { company, jobTitle, location, description, status, dateApplied, referenceLink } = req.body;
    try {
        if (!company || !jobTitle) {
            return res.status(400).json({ message: "Company and job title are required" });
        }

        const job = new Job(
            buildJobPayload(req.body, req.user.userId)
        );
        await job.save();
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const adminCreateJob = async (req, res) => {
    const { userId } = req.body;

    if (!isValidObjectId(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
    }

    try {
        const job = new Job(buildJobPayload(req.body, userId));
        await job.save();
        await job.populate("userId", "email firstName lastName isAdmin");
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteJob = async (req, res) => {
    const { id } = req.params;
    try {
        const job = await Job.findOneAndDelete({ _id: id, userId: req.user.userId });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const adminDeleteJob = async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid job id" });
    }

    try {
        const job = await Job.findByIdAndDelete(id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateJob = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const job = await Job.findOneAndUpdate({ _id: id, userId: req.user.userId }, updates, { new: true });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const adminUpdateJob = async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid job id" });
    }

    try {
        const updates = req.body;
        const job = await Job.findByIdAndUpdate(id, updates, { new: true }).populate(
            "userId",
            "email firstName lastName isAdmin"
        );

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getJob = async (req, res) => {
    try {
        const jobs = await Job.find({ userId: req.user.userId });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllJobs = async (_req, res) => {
    try {
        const jobs = await Job.find().populate("userId", "email firstName lastName isAdmin");
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getJobsByUserId = async (req, res) => {
    try {
        const jobs = await Job.find({ userId: req.params.userId });

        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createJob,
    adminCreateJob,
    deleteJob,
    adminDeleteJob,
    updateJob,
    adminUpdateJob,
    getJob,
    getAllJobs,
    getJobsByUserId,
};
