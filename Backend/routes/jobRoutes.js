const express = require('express');
const router = express.Router();

const Job = require('../models/job');

const createJob = async (req, res) => {
    const { company, jobTitle, location, description, status, dateApplied, referenceLink } = req.body;
    try {
        if (!company || !jobTitle) {
            return res.status(400).json({ message: "Company and job title are required" });
        }

        const job = new Job({
            userId: req.user._id,
            company,
            jobTitle,
            location,
            description,
            status,
            dateApplied,
            referenceLink
        });
        await job.save();
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteJob = async (req, res) => {
    const { id } = req.params;
    try {
        const job = await Job.findOneAndDelete({ _id: id, userId: req.user._id });
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
        const job = await Job.findOneAndUpdate({ _id: id, userId: req.user._id }, updates, { new: true });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllJobs = async (req, res) => {

router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

module.exports = router;
