import { NavLink, useNavigate } from "react-router-dom";
import { useSession } from "./SessionContext";

function AppShell({ title, subtitle, navItems, children, accent = "green" }) {
    const navigate = useNavigate();
    const { user, clearAuth } = useSession();

    const handleLogout = () => {
        clearAuth();
        navigate("/login", { replace: true });
    };

    return (
        <div className={`workspace-shell workspace-${accent}`}>
            <div className="workspace-orb workspace-orb-a" />
            <div className="workspace-orb workspace-orb-b" />

            <aside className="workspace-rail">
                <div className="workspace-brand">
                    <div className="brand-mark">JT</div>
                    <div>
                        <strong>Job Tracker</strong>
                        <span>{subtitle}</span>
                    </div>
                </div>

                <div className="workspace-usercard">
                    <small>Signed in as</small>
                    <strong>{user?.firstName || user?.email || "User"}</strong>
                    <span>{user?.isAdmin ? "Administrator" : "Job seeker"}</span>
                </div>

                <nav className="workspace-nav">
                    {navItems.map((item) => (
                        <NavLink key={item.to} to={item.to} end={item.end}>
                            <span>{item.label}</span>
                            <small>{item.description}</small>
                        </NavLink>
                    ))}
                </nav>

                <button type="button" className="workspace-logout" onClick={handleLogout}>
                    Logout
                </button>
            </aside>

            <main className="workspace-main">
                <header className="workspace-header">
                    <div>
                        <span className="eyebrow">{title}</span>
                        <h1>{subtitle}</h1>
                    </div>
                    <div className="workspace-chip">{user?.isAdmin ? "Admin mode" : "Personal mode"}</div>
                </header>

                <div className="workspace-content">{children}</div>
            </main>
        </div>
    );
}

export default AppShell;