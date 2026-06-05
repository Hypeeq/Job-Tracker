import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import api from "../api/axios";

function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [message, setMessage] = useState("");

    const loadUsers = async () => {
        try {
            const response = await api.get("/auth/all");
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const search = query.trim().toLowerCase();
            if (!search) {
                return true;
            }

            return [user.firstName, user.lastName, user.email]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(search);
        });
    }, [users, query]);

    const toggleAdmin = async (user) => {
        try {
            await api.put(`/auth/${user._id}`, { isAdmin: !user.isAdmin });
            setMessage(`${user.email} updated.`);
            await loadUsers();
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to update user.");
        }
    };

    const deleteUser = async (user) => {
        if (!window.confirm(`Delete ${user.email}?`)) {
            return;
        }

        try {
            await api.delete(`/auth/${user._id}`);
            setMessage(`${user.email} removed.`);
            await loadUsers();
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to delete user.");
        }
    };

    return (
        <AppShell
            title="Users"
            subtitle="Manage access and admin roles"
            accent="green"
            navItems={[
                { to: "/admin", label: "Home", description: "Overview", end: true },
                { to: "/admin/users", label: "Users", description: "Access and roles", end: true },
                { to: "/admin/jobs", label: "Jobs", description: "Tracked applications" },
            ]}
        >
            <section className="panel soft-lift">
                <div className="panel-header">
                    <div>
                        <span className="eyebrow">User directory</span>
                        <h3>Review all accounts</h3>
                    </div>
                    <input
                        className="search-input"
                        placeholder="Search users"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </div>

                {message && <div className="feedback success">{message}</div>}

                {loading ? (
                    <p className="empty-state">Loading users...</p>
                ) : filteredUsers.length === 0 ? (
                    <p className="empty-state">No users found.</p>
                ) : (
                    <div className="user-grid">
                        {filteredUsers.map((user) => (
                            <article className="user-card glow-card" key={user._id}>
                                <div>
                                    <h3>{user.firstName} {user.lastName}</h3>
                                    <p>{user.email}</p>
                                    <small>{user.isAdmin ? "Administrator" : "Standard user"}</small>
                                </div>

                                <div className="user-card-actions">
                                    <button type="button" className="pill-button" onClick={() => toggleAdmin(user)}>
                                        {user.isAdmin ? "Remove admin" : "Make admin"}
                                    </button>
                                    <button type="button" className="pill-button danger" onClick={() => deleteUser(user)}>
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </AppShell>
    );
}

export default AdminUsersPage;