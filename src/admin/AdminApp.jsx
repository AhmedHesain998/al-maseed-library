
import { useEffect, useState } from "react";

import {
    useNavigate,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import { supabase } from "../lib/supabase";

import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";

import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";

import Products from "./pages/Products";
import { AdminLanguageProvider } from "./context/AdminLanguageContext";


function AdminDashboard({ onLogout }) {
    return (
        <Routes>
            <Route
                element={<AdminLayout onLogout={onLogout} />}
            >
                <Route
                    index
                    element={
                        <Navigate to="/admin/dashboard" replace />
                    }
                />

                <Route
                    path="login/*"
                    element={
                        <Navigate to="/admin/dashboard" replace />
                    }
                />

                <Route
                    path="dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="orders"
                    element={<Orders />}
                />

                <Route
                    path="products"
                    element={<Products />}
                />

                <Route
                    path="*"
                    element={
                        <Navigate to="/admin/dashboard" replace />
                    }
                />
            </Route>
        </Routes>
    );
}

function AdminApp() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [checking, setChecking] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        let active = true;

        async function checkAdminSession() {
            try {
                const { data: sessionData, error: sessionError } =
                    await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                const user = sessionData.session?.user;

                if (!user) {
                    if (active) setIsAdmin(false);
                    return;
                }

                const { data: admin, error: adminError } = await supabase
                    .from("admin_users")
                    .select("user_id")
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (adminError) throw adminError;

                if (active) {
                    setIsAdmin(Boolean(admin));
                }
            } catch (error) {
                console.error("Admin verification error:", error);

                if (active) {
                    setError("Unable to verify administrator access.");
                    setIsAdmin(false);
                }
            } finally {
                if (active) {
                    setChecking(false);
                }
            }
        }

        checkAdminSession();

        return () => {
            active = false;
        };
    }, []);

    async function handleLogout() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Logout error:", error);
            return;
        }

        setIsAdmin(false);
        navigate("/admin", { replace: true });
    }

    if (checking) {
    return (
        <div style={{ padding: "30px", color: "black" }}>
            Checking administrator access...
        </div>
    );
}

    if (error) {
        return <p role="alert">{error}</p>;
    }

    if (!isAdmin) {
        return (
            <AdminLogin
                onLogin={() => {
                    setIsAdmin(true);
                    navigate("/admin/dashboard", {
                        replace: true,
                    });
                }}
            />
        );
    }

   return (
    <AdminLanguageProvider>
        <AdminDashboard onLogout={handleLogout} />
    </AdminLanguageProvider>
);
}

export default AdminApp;
