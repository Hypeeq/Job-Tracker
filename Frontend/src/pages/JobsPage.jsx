import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { useSession } from "../components/SessionContext";
import api from "../api/axios";

const statusOptions = ["Applied", "Saved", "Phone Screening", "Interviewing", "Offered", "Accepted", "Rejected", "Withdrawn"];

const emptyJob = {
    company: "",
    jobTitle: "",
    city: "",
    provinceOrState: "",
    country: "",
    workType: "Remote",
    description: "",
    status: "Applied",
    dateApplied: new Date().toISOString().slice(0, 10),
    referenceLink: "",
};

const hydrateForm = (job) => ({
    company: job?.company || "",
    jobTitle: job?.jobTitle || "",
    city: job?.location?.city || "",
    provinceOrState: job?.location?.provinceOrState || "",
    country: job?.location?.country || "",
    workType: job?.location?.workType || "Remote",
    description: job?.description || "",
    status: job?.status || "Applied",
    dateApplied: job?.dateApplied ? String(job.dateApplied).slice(0, 10) : new Date().toISOString().slice(0, 10),
    referenceLink: job?.referenceLink || "",
});

function JobsPage() {
    const { user } = useSession();
    const [jobs, setJobs] = useState([]);
    const [form, setForm] = useState(emptyJob);
    const [editingId, setEditingId] = useState("");
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const loadJobs = async () => {
        try {
            const response = await api.get("/jobs");
            setJobs(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to load jobs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

    const safeJobs = Array.isArray(jobs) ? jobs : [];

    const stats = useMemo(() => [
        { label: "Total jobs", value: safeJobs.length },
        { label: "Interviewing", value: safeJobs.filter((job) => job?.status === "Interviewing").length },
        { label: "Offered", value: safeJobs.filter((job) => job?.status === "Offered").length },
        { label: "Accepted", value: safeJobs.filter((job) => job?.status === "Accepted").length },
    ], [safeJobs]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const resetForm = () => {
        setEditingId("");
        setForm(emptyJob);
    };

    const closeEditor = () => {
        setIsEditorOpen(false);
        resetForm();
    };

    const startEdit = (job) => {
        setEditingId(job._id);
        setForm(hydrateForm(job));
        setIsEditorOpen(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setMessage("");

        const payload = {
            company: form.company,
            jobTitle: form.jobTitle,
            location: {
                city: form.city,
                provinceOrState: form.provinceOrState,
                country: form.country,
                workType: form.workType,
            },
            description: form.description,
            status: form.status,
            dateApplied: form.dateApplied,
            referenceLink: form.referenceLink,
        };

        try {
            if (editingId) {
                await api.put(`/jobs/${editingId}`, payload);
                setMessage("Job updated successfully.");
            } else {
                await api.post("/jobs", payload);
                setMessage("Job created successfully.");
            }

            closeEditor();
            await loadJobs();
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to save job.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (jobId) => {
        if (!window.confirm("Delete this job?")) {
            return;
        }

        try {
            await api.delete(`/jobs/${jobId}`);
            setMessage("Job deleted successfully.");
            if (editingId === jobId) {
                closeEditor();
            }
            await loadJobs();
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to delete job.");
        }
    };

    return (
        <AppShell
            title="My jobs"
            subtitle={user?.firstName ? `${user.firstName}, keep the pipeline tight` : "Keep the pipeline tight"}
            accent="green"
            navItems={[
                { to: "/dashboard", label: "Overview", description: "Snapshot", end: true },
                { to: "/jobs", label: "My jobs", description: "Create and edit", end: true },
            ]}
        >
            <section className="stats-row animate-stagger">
                {stats.map((item) => (
                    <article className="metric-card soft-lift" key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                    </article>
                ))}
            </section>

            <section className="overview-grid two-col">
                <div className="panel soft-lift">
                    <div className="panel-header">
                        <div>
                            <span className="eyebrow">New job</span>
                            <h3>Create a new application</h3>
                        </div>
                    </div>

                    <form className="job-form" onSubmit={handleSubmit}>
                        <div className="split-row">
                            <label>
                                Company
                                <input name="company" value={form.company} onChange={handleChange} placeholder="OpenAI" required />
                            </label>
                            <label>
                                Job title
                                <input name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="Frontend Developer" required />
                            </label>
                        </div>

                        <div className="split-row">
                            <label>
                                City
                                <input name="city" value={form.city} onChange={handleChange} placeholder="Toronto" />
                            </label>
                            <label>
                                Country
                                <input name="country" value={form.country} onChange={handleChange} placeholder="Canada" />
                            </label>
                        </div>

                        <div className="split-row">
                            <label>
                                State / Province
                                <input name="provinceOrState" value={form.provinceOrState} onChange={handleChange} placeholder="Ontario" />
                            </label>
                            <label>
                                Work type
                                <select name="workType" value={form.workType} onChange={handleChange}>
                                    <option>Remote</option>
                                    <option>Hybrid</option>
                                    <option>On-Site</option>
                                </select>
                            </label>
                        </div>

                        <div className="split-row">
                            <label>
                                Status
                                <select name="status" value={form.status} onChange={handleChange}>
                                    {statusOptions.map((option) => (
                                        <option key={option}>{option}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Date applied
                                <input type="date" name="dateApplied" value={form.dateApplied} onChange={handleChange} />
                            </label>
                        </div>

                        <label>
                            Reference link
                            <input name="referenceLink" value={form.referenceLink} onChange={handleChange} placeholder="https://company.jobs/posting" />
                        </label>

                        <label>
                            Description
                            <textarea name="description" value={form.description} onChange={handleChange} placeholder="What made this role interesting?" rows="4" />
                        </label>

                        {message && <div className="feedback success">{message}</div>}

                        <button className="submit-btn" type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save job"}
                        </button>
                    </form>
                </div>

                <div className="panel soft-lift">
                    <div className="panel-header">
                        <div>
                            <span className="eyebrow">My pipeline</span>
                            <h3>Applications</h3>
                        </div>
                    </div>

                    {loading ? (
                        <p className="empty-state">Loading jobs...</p>
                    ) : safeJobs.length === 0 ? (
                        <p className="empty-state">No jobs yet. Create the first one.</p>
                    ) : (
                        <div className="job-list">
                            {safeJobs.map((job) => (
                                <article className="job-card glow-card" key={job._id}>
                                    <div>
                                        <h3>{job.company}</h3>
                                        <p>{job.jobTitle}</p>
                                        <small>
                                            {job.location?.city || ""}
                                            {job.location?.city && job.location?.country ? " · " : ""}
                                            {job.location?.country || ""}
                                        </small>
                                    </div>

                                    <div className="job-card-footer">
                                        <span className={`pill status-${String(job.status || "unknown").toLowerCase().replace(/\s+/g, "-")}`}>
                                            {job.status || "Unknown"}
                                        </span>
                                        <div className="inline-actions">
                                            <button type="button" className="text-button" onClick={() => startEdit(job)}>
                                                Edit
                                            </button>
                                            <button type="button" className="text-button danger" onClick={() => handleDelete(job._id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {isEditorOpen && (
                <div className="modal-backdrop" role="presentation" onClick={closeEditor}>
                    <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="job-editor-title" onClick={(event) => event.stopPropagation()}>
                        <div className="panel-header">
                            <div>
                                <span className="eyebrow">Edit job</span>
                                <h3 id="job-editor-title">Update this application</h3>
                            </div>
                            <button type="button" className="ghost-button" onClick={closeEditor}>
                                Close
                            </button>
                        </div>

                        <form className="job-form" onSubmit={handleSubmit}>
                            <div className="split-row">
                                <label>
                                    Company
                                    <input name="company" value={form.company} onChange={handleChange} placeholder="OpenAI" required />
                                </label>
                                <label>
                                    Job title
                                    <input name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="Frontend Developer" required />
                                </label>
                            </div>

                            <div className="split-row">
                                <label>
                                    City
                                    <input name="city" value={form.city} onChange={handleChange} placeholder="Toronto" />
                                </label>
                                <label>
                                    Country
                                    <input name="country" value={form.country} onChange={handleChange} placeholder="Canada" />
                                </label>
                            </div>

                            <div className="split-row">
                                <label>
                                    State / Province
                                    <input name="provinceOrState" value={form.provinceOrState} onChange={handleChange} placeholder="Ontario" />
                                </label>
                                <label>
                                    Work type
                                    <select name="workType" value={form.workType} onChange={handleChange}>
                                        <option>Remote</option>
                                        <option>Hybrid</option>
                                        <option>On-Site</option>
                                    </select>
                                </label>
                            </div>

                            <div className="split-row">
                                <label>
                                    Status
                                    <select name="status" value={form.status} onChange={handleChange}>
                                        {statusOptions.map((option) => (
                                            <option key={option}>{option}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Date applied
                                    <input type="date" name="dateApplied" value={form.dateApplied} onChange={handleChange} />
                                </label>
                            </div>

                            <label>
                                Reference link
                                <input name="referenceLink" value={form.referenceLink} onChange={handleChange} placeholder="https://company.jobs/posting" />
                            </label>

                            <label>
                                Description
                                <textarea name="description" value={form.description} onChange={handleChange} placeholder="What made this role interesting?" rows="4" />
                            </label>

                            {message && <div className="feedback success">{message}</div>}

                            <div className="modal-actions">
                                <button type="button" className="ghost-button" onClick={closeEditor}>
                                    Cancel
                                </button>
                                <button className="submit-btn" type="submit" disabled={saving}>
                                    {saving ? "Saving..." : "Update job"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppShell>
    );
}

export default JobsPage;
