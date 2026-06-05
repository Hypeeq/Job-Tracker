import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const SessionContext = createContext(null);

const readStoredUser = () => {
    const storedUser = localStorage.getItem("jobTrackerUser");

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser);
    } catch {
        return null;
    }
};

export function SessionProvider({ children }) {
    const [user, setUser] = useState(readStoredUser);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        const syncSession = async () => {
            try {
                const response = await api.get("/auth/me");
                setUser(response.data);
                localStorage.setItem("jobTrackerUser", JSON.stringify(response.data));
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("jobTrackerUser");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        syncSession();
    }, []);

    const value = useMemo(() => ({
        user,
        loading,
        setAuth: ({ token, user: nextUser }) => {
            localStorage.setItem("token", token);
            localStorage.setItem("jobTrackerUser", JSON.stringify(nextUser));
            setUser(nextUser);
        },
        clearAuth: () => {
            localStorage.removeItem("token");
            localStorage.removeItem("jobTrackerUser");
            setUser(null);
        },
    }), [user, loading]);

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
    const context = useContext(SessionContext);

    if (!context) {
        throw new Error("useSession must be used within SessionProvider");
    }

    return context;
}