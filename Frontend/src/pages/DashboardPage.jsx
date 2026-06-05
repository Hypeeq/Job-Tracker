import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { useSession } from "../components/SessionContext";

const statusSlug = (status) =>
    (status || "unknown")
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

function DashboardPage() {
    const { user } = useSession();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadJobs = async () => {
            try {
                const response = await api.get("/jobs");
                setJobs(Array.isArray(response.data) ? response.data : []);
            } finally {
                setLoading(false);
            }
        };

        loadJobs();
    }, []);

    const safeJobs = Array.isArray(jobs) ? jobs : [];

    const stats = useMemo(() => {
        const applied = safeJobs.filter((job) => job?.status === "Applied").length;
        const interviewing = safeJobs.filter((job) => job?.status === "Interviewing").length;
        const offered = safeJobs.filter((job) => job?.status === "Offered").length;

        return [
            { label: "Total jobs", value: safeJobs.length },
            { label: "Applied", value: applied },
            { label: "Interviewing", value: interviewing },
            { label: "Offers", value: offered },
        ];
    }, [safeJobs]);

    return (
        <AppShell
            title={user?.isAdmin ? "Admin overview" : "Dashboard"}
            subtitle={user?.isAdmin ? "See the whole system at a glance" : "Your job hunt at a glance"}
            accent="green"
            navItems={user?.isAdmin ? [
                { to: "/admin", label: "Admin home", description: "Overview" , end: true },
                { to: "/admin/users", label: "Users", description: "Manage accounts" },
                { to: "/admin/jobs", label: "Jobs", description: "All jobs" },
            ] : [
                { to: "/dashboard", label: "Overview", description: "Snapshot", end: true },
                { to: "/jobs", label: "My jobs", description: "Create and edit" },
            ]}
        >
            <section className="hero-grid">
                <div className="hero-copy card-soft">
                    <span className="eyebrow">{user?.isAdmin ? "Admin mode" : "Personal mode"}</span>
                    <h2>{user?.isAdmin ? "Manage users, jobs, and the system." : "Keep your applications moving."}</h2>
                    <p>
                        {user?.isAdmin
                            ? "Use the admin area to review people, job records, and the entire pipeline with linked users."
                            : "A focused workspace for creating jobs, updating statuses, and staying on top of every opportunity."}
                    </p>
                    <div className="hero-actions">
                        <Link className="primary-link" to={user?.isAdmin ? "/admin/jobs" : "/jobs"}>
                            {user?.isAdmin ? "Open admin jobs" : "Open my jobs"}
                        </Link>
                        <Link className="secondary-link" to={user?.isAdmin ? "/admin/users" : "/dashboard"}>
                            {user?.isAdmin ? "Manage users" : "Refresh overview"}
                        </Link>
                    </div>
                </div>

                <div className="hero-illustration card-soft">
                    <div className="floating-card floating-a">Applied</div>
                    <div className="floating-card floating-b">Interviewing</div>
                    <div className="floating-card floating-c">Offers</div>
                    <div className="hero-rings" />
                </div>
            </section>

            <section className="stats-row animate-stagger">
                {stats.map((item) => (
                    <article className="metric-card soft-lift" key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                    </article>
                ))}
            </section>

            <section className="overview-grid">
                <div className="panel soft-lift">
                    <div className="panel-header">
                        <div>
                            <span className="eyebrow">Recent activity</span>
                            <h3>{user?.isAdmin ? "Latest tracked jobs" : "Your latest jobs"}</h3>
                        </div>
                    </div>

                    {loading ? (
                        <p className="empty-state">Loading your jobs...</p>
                    ) : safeJobs.length === 0 ? (
                        <p className="empty-state">No jobs yet. Go to the jobs page to create your first one.</p>
                    ) : (
                        <div className="job-list compact">
                            {safeJobs.slice(0, 5).map((job) => (
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
                                    <span className={`pill status-${statusSlug(job.status)}`}>
                                        {job.status || "Unknown"}
                                    </span>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                <div className="panel soft-lift">
                    <div className="panel-header">
                        <div>
                            <span className="eyebrow">Quick links</span>
                            <h3>Move fast</h3>
                        </div>
                    </div>
                    <div className="action-stack">
                        <Link className="action-card" to="/jobs">
                            <strong>Jobs</strong>
                            <span>Create, edit, delete</span>
                        </Link>
                        {user?.isAdmin && (
                            <>
                                <Link className="action-card" to="/admin/users">
                                    <strong>Users</strong>
                                    <span>Manage access</span>
                                </Link>
                                <Link className="action-card" to="/admin/jobs">
                                    <strong>Admin jobs</strong>
                                    <span>All jobs with owners</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </AppShell>
    );
}

export default DashboardPage;