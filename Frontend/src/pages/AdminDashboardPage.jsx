import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";

function AdminDashboardPage() {
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [usersResponse, jobsResponse] = await Promise.all([api.get("/auth/all"), api.get("/jobs/all")]);
                setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
                setJobs(Array.isArray(jobsResponse.data) ? jobsResponse.data : []);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const stats = useMemo(() => {
        const adminUsers = users.filter((user) => user?.isAdmin).length;
        return [
            { label: "Users", value: users.length },
            { label: "Admins", value: adminUsers },
            { label: "Jobs", value: jobs.length },
            { label: "Open items", value: jobs.filter((job) => !["Accepted", "Rejected", "Withdrawn"].includes(job?.status)).length },
        ];
    }, [users, jobs]);

    const recentJobs = jobs.slice(0, 4);

    return (
        <AppShell
            title="Admin console"
            subtitle="System-wide control center"
            accent="green"
            navItems={[
                { to: "/admin", label: "Home", description: "Overview", end: true },
                { to: "/admin/users", label: "Users", description: "Access and roles" },
                { to: "/admin/jobs", label: "Jobs", description: "Tracked applications" },
            ]}
        >
            <section className="hero-grid">
                <div className="hero-copy card-soft">
                    <span className="eyebrow">Admin dashboard</span>
                    <h2>Everything linked, accountable, and visible.</h2>
                    <p>
                        Review users, inspect all jobs, and keep ownership clear. This area is built for control rather than just display.
                    </p>
                    <div className="hero-actions">
                        <Link className="primary-link" to="/admin/users">Open users</Link>
                        <Link className="secondary-link" to="/admin/jobs">Open jobs</Link>
                    </div>
                </div>

                <div className="hero-illustration card-soft admin-illustration">
                    <div className="floating-card floating-a">Users</div>
                    <div className="floating-card floating-b">Jobs</div>
                    <div className="floating-card floating-c">Roles</div>
                    <div className="hero-rings" />
                </div>
            </section>

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
                            <span className="eyebrow">Quick actions</span>
                            <h3>Move through admin tasks</h3>
                        </div>
                    </div>
                    <div className="action-stack">
                        <Link className="action-card" to="/admin/users">
                            <strong>User management</strong>
                            <span>Toggle roles and remove accounts</span>
                        </Link>
                        <Link className="action-card" to="/admin/jobs">
                            <strong>All jobs</strong>
                            <span>Inspect linked users and edit any job</span>
                        </Link>
                    </div>
                </div>

                <div className="panel soft-lift">
                    <div className="panel-header">
                        <div>
                            <span className="eyebrow">Recent jobs</span>
                            <h3>Latest tracked items</h3>
                        </div>
                    </div>

                    {recentJobs.length === 0 ? (
                        <p className="empty-state">No jobs yet.</p>
                    ) : (
                        <div className="job-list compact">
                            {recentJobs.map((job) => (
                                <article className="job-card glow-card" key={job._id}>
                                    <div>
                                        <h3>{job.company}</h3>
                                        <p>{job.jobTitle}</p>
                                        <small>{job.userId?.firstName || job.userId?.email || "Unknown user"}</small>
                                    </div>
                                    <span className="pill">{job.status || "Unknown"}</span>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </AppShell>
    );
}

export default AdminDashboardPage;