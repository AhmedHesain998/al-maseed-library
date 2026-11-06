
import { Routes, Route, Navigate } from "react-router-dom";

import StoreFront from "./StoreFront";
import AdminApp from "./admin/AdminApp";

const STORE_MODE = import.meta.env.VITE_STORE_MODE || "admin_only";

function App() {
    const adminOnly = STORE_MODE === "admin_only";

    return (
        <Routes>
            <Route
                path="/"
                element={
                    adminOnly
                        ? <Navigate to="/admin/login" replace />
                        : <StoreFront />
                }
            />

            <Route path="/admin/*" element={<AdminApp />} />

            <Route
                path="*"
                element={
                    <Navigate
                        to={adminOnly ? "/admin/login" : "/"}
                        replace
                    />
                }
            />
        </Routes>
    );
}

export default App;
