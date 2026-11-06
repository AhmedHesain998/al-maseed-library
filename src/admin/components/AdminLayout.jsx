
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    LogOut,
} from "lucide-react";

import { useAdminLanguage } from "../context/AdminLanguageContext";
import { AdminToastProvider } from "../context/AdminToastContext";
import "./AdminLayout.css";

function AdminLayout({ onLogout }) {
    const { language, isArabic, changeLanguage } = useAdminLanguage();
    const location = useLocation();

    const navItems = [
        {
            label: isArabic ? "لوحة التحكم" : "Overview",
            path: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: isArabic ? "الطلبات" : "Orders",
            path: "/admin/orders",
            icon: ShoppingBag,
        },
        {
            label: isArabic ? "المنتجات" : "Products",
            path: "/admin/products",
            icon: Package,
        },
    ];

    const pageTitle = location.pathname.includes("/orders")
        ? isArabic ? "الطلبات" : "Orders"
        : location.pathname.includes("/products")
            ? isArabic ? "المنتجات" : "Products"
            : isArabic ? "لوحة التحكم" : "Dashboard";

    return (
        <AdminToastProvider isArabic={isArabic}>
            <div className="admin-layout" dir={isArabic ? "rtl" : "ltr"}>
                <aside className="admin-sidebar">
                    <div className="admin-brand">
                        <h2>AL-MASEED</h2>
                        <span>{isArabic ? "إدارة المكتبة" : "LIBRARY ADMIN"}</span>
                    </div>

                    <nav className="admin-nav">
                        <p className="admin-nav-label">
                            {isArabic ? "القائمة الرئيسية" : "MAIN MENU"}
                        </p>

                        {navItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `admin-nav-link ${isActive ? "active" : ""}`
                                    }
                                >
                                    <span className="admin-nav-icon">
                                        <Icon size={20} strokeWidth={2} />
                                    </span>

                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </nav>

                    <button className="admin-logout" onClick={onLogout}>
                        <LogOut size={19} strokeWidth={2} />
                        {isArabic ? "تسجيل الخروج" : "Logout"}
                    </button>
                </aside>

                <main className="admin-main">
                    <header className="admin-topbar">
                        <div>
                            <span className="admin-breadcrumb">
                                {isArabic ? "المسيد / الإدارة" : "Al-Maseed / Admin"}
                            </span>
                            <h2>{pageTitle}</h2>
                        </div>

                        <div className="admin-profile">
                            <div className="admin-language-switch">
                                <button
                                    className={language === "ar" ? "active" : ""}
                                    onClick={() => changeLanguage("ar")}
                                >
                                    AR
                                </button>

                                <button
                                    className={language === "en" ? "active" : ""}
                                    onClick={() => changeLanguage("en")}
                                >
                                    EN
                                </button>
                            </div>

                            <span className="admin-avatar">A</span>
                            <span>
                                {isArabic ? "المدير" : "Administrator"}
                            </span>
                        </div>
                    </header>

                    <section className="admin-content">
                        <Outlet />
                    </section>
                </main>
            </div>
        </AdminToastProvider>
    );
}

export default AdminLayout;
