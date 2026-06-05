import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import api from "../api/axios";

const statusOptions = ["Applied", "Saved", "Phone Screening", "Interviewing", "Offered", "Accepted", "Rejected", "Withdrawn"];

const emptyJob = {
    userId: "",
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
    userId: job?.userId?._id || job?.userId || "",
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

function AdminJobsPage() {
    const [jobs, setJobs] = useState([]);
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(emptyJob);
    const [editingId, setEditingId] = useState("");
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const loadData = async () => {
        try {
            const [jobsResponse, usersResponse] = await Promise.all([api.get("/jobs/all"), api.get("/auth/all")]);
            setJobs(Array.isArray(jobsResponse.data) ? jobsResponse.data : []);
            setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to load admin jobs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const safeJobs = Array.isArray(jobs) ? jobs : [];
    const safeUsers = Array.isArray(users) ? users : [];

    const stats = useMemo(() => {
        return [
            { label: "Jobs", value: safeJobs.length },
            { label: "Owners", value: safeJobs.filter((job) => job?.userId).length },
            { label: "Interviewing", value: safeJobs.filter((job) => job?.status === "Interviewing").length },
            { label: "Accepted", value: safeJobs.filter((job) => job?.status === "Accepted").length },
        ];
    }, [safeJobs]);

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

    const handleEdit = (job) => {
        setEditingId(job._id);
        setForm(hydrateForm(job));
        setIsEditorOpen(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setMessage("");

        const payload = {
            userId: form.userId,
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
                await api.put(`/jobs/admin/${editingId}`, payload);
                setMessage("Job updated successfully.");
            } else {
                await api.post("/jobs/admin", payload);
                setMessage("Job created successfully.");
            }

            closeEditor();
            await loadData();
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
            await api.delete(`/jobs/admin/${jobId}`);
            setMessage("Job deleted successfully.");
            if (editingId === jobId) {
                closeEditor();
            }
            await loadData();
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to delete job.");
        }
    };

    return (
        <AppShell
            title="All jobs"
            subtitle="Track every job and its linked user"
            accent="green"
            navItems={[
                { to: "/admin", label: "Home", description: "Overview", end: true },
                { to: "/admin/users", label: "Users", description: "Access and roles" },
                { to: "/admin/jobs", label: "Jobs", description: "Tracked applications", end: true },
            ]}
        >
            <section className="stats-row animate-stagger">
                {stats.map((item) => (
                    <article className="metric-card soft-lift" key={item.label}>
                        <span>{item.label}</span>
                        <strong>{loading ? "…" : item.value}</strong>
                    </article>
                ))}
            </section>

            <section className="overview-grid two-col">
                <div className="panel soft-lift">
                    <div className="panel-header">
                        <div>
                            <span className="eyebrow">Create admin job</span>
                            <h3>Add a job for any user</h3>
                        </div>
                    </div>

                    <form className="job-form" onSubmit={handleSubmit}>
                        <label>
                            User
                            <select name="userId" value={form.userId} onChange={handleChange} required>
                                <option value="">Select a user</option>
                                {safeUsers.map((user) => (
                                    <option key={user._id} value={user._id}>
                                        {user.firstName} {user.lastName} - {user.email}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="split-row">
                            <label>
                                Company
                                <input name="company" value={form.company} onChange={handleChange} required />
                            </label>
                            <label>
                                Job title
                                <input name="jobTitle" value={form.jobTitle} onChange={handleChange} required />
                            </label>
                        </div>

                        <div className="split-row">
                            <label>
                                City
                                <input name="city" value={form.city} onChange={handleChange} />
                            </label>
                            <label>
                                Country
                                <input name="country" value={form.country} onChange={handleChange} />
                            </label>
                        </div>

                        <div className="split-row">
                            <label>
                                State / Province
                                <input name="provinceOrState" value={form.provinceOrState} onChange={handleChange} />
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
                            <input name="referenceLink" value={form.referenceLink} onChange={handleChange} />
                        </label>

                        <label>
                            Description
                            <textarea name="description" value={form.description} onChange={handleChange} rows="4" />
                        </label>

                        {message && <div className="feedback success">{message}</div>}

                        <button className="submit-btn" type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Create job"}
                        </button>
                    </form>
                </div>

                <div className="panel soft-lift">
                    <div className="panel-header">
                        <div>
                            <span className="eyebrow">All jobs</span>
                            <h3>With linked users</h3>
                        </div>
                    </div>

                    {loading ? (
                        <p className="empty-state">Loading jobs...</p>
                    ) : safeJobs.length === 0 ? (
                        <p className="empty-state">No jobs found.</p>
                    ) : (
                        <div className="job-list">
                            {safeJobs.map((job) => (
                                <article className="job-card glow-card" key={job._id}>
                                    <div>
                                        <h3>{job.company}</h3>
                                        <p>{job.jobTitle}</p>
                                        <small>
                                            Owner: {job.userId?.firstName || job.userId?.email || "Unknown user"}
                                        </small>
                                    </div>

                                    <div className="job-card-footer">
                                        <span className={`pill status-${String(job.status || "unknown").toLowerCase().replace(/\s+/g, "-")}`}>
                                            {job.status || "Unknown"}
                                        </span>
                                        <div className="inline-actions">
                                            <button type="button" className="text-button" onClick={() => handleEdit(job)}>
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
                    <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="admin-job-editor-title" onClick={(event) => event.stopPropagation()}>
                        <div className="panel-header">
                            <div>
                                <span className="eyebrow">Edit admin job</span>
                                <h3 id="admin-job-editor-title">Update any job</h3>
                            </div>
                            <button type="button" className="ghost-button" onClick={closeEditor}>
                                Close
                            </button>
                        </div>

                        <form className="job-form" onSubmit={handleSubmit}>
                            <label>
                                User
                                <select name="userId" value={form.userId} onChange={handleChange} required>
                                    <option value="">Select a user</option>
                                    {safeUsers.map((user) => (
                                        <option key={user._id} value={user._id}>
                                            {user.firstName} {user.lastName} - {user.email}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="split-row">
                                <label>
                                    Company
                                    <input name="company" value={form.company} onChange={handleChange} required />
                                </label>
                                <label>
                                    Job title
                                    <input name="jobTitle" value={form.jobTitle} onChange={handleChange} required />
                                </label>
                            </div>

                            <div className="split-row">
                                <label>
                                    City
                                    <input name="city" value={form.city} onChange={handleChange} />
                                </label>
                                <label>
                                    Country
                                    <input name="country" value={form.country} onChange={handleChange} />
                                </label>
                            </div>

                            <div className="split-row">
                                <label>
                                    State / Province
                                    <input name="provinceOrState" value={form.provinceOrState} onChange={handleChange} />
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
                                <input name="referenceLink" value={form.referenceLink} onChange={handleChange} />
                            </label>

                            <label>
                                Description
                                <textarea name="description" value={form.description} onChange={handleChange} rows="4" />
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

export default AdminJobsPage;