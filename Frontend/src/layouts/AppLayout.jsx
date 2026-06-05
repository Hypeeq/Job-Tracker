import { Link, NavLink, useNavigate } from "react-router-dom";

function AppLayout({ children }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
    };

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <Link className="brand" to="/dashboard">
                    <span className="brand-mark">JT</span>
                    <span>
                        <strong>Job Tracker</strong>
                        <small>Black / Green control center</small>
                    </span>
                </Link>

                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" end>
                        Overview
                    </NavLink>
                    <NavLink to="/jobs">Jobs</NavLink>
                    <NavLink to="/login" onClick={handleLogout}>
                        Logout
                    </NavLink>
                </nav>

                <div className="sidebar-card">
                    <p>Track openings, status changes, and follow-ups from one place.</p>
                    <span>Fast, dark, and focused.</span>
                </div>
            </aside>

            <main className="app-content">{children}</main>
        </div>
    );
}

export default AppLayout;