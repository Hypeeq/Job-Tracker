import { Navigate } from "react-router-dom";
import { useSession } from "./SessionContext";

function ProtectedRoute({ children, roles }) {
    const { user, loading } = useSession();

    if (loading) {
        return <div className="route-loader">Loading your workspace...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (Array.isArray(roles) && roles.length > 0 && !roles.includes(user.isAdmin ? "admin" : "user")) {
        return <Navigate to={user.isAdmin ? "/admin" : "/dashboard"} replace />;
    }

    return children;
}

export default ProtectedRoute;