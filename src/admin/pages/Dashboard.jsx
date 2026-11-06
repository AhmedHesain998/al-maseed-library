
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAdminLanguage } from "../context/AdminLanguageContext";
import "./Dashboard.css";
import {
    ShoppingCart,
    Clock3,
    CheckCircle,
    Package
} from "lucide-react";

function Dashboard() {
    const { isArabic } = useAdminLanguage();

    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        activeProducts: 0,
    });

    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const statusLabels = {
        pending: isArabic ? "قيد الانتظار" : "Pending",
        confirmed: isArabic ? "تم التأكيد" : "Confirmed",
        processing: isArabic ? "قيد التجهيز" : "Processing",
        completed: isArabic ? "مكتمل" : "Completed",
        cancelled: isArabic ? "ملغي" : "Cancelled",
    };

    const t = {
        loading: isArabic
            ? "جاري تحميل لوحة التحكم..."
            : "Loading dashboard...",

        error: isArabic
            ? "تعذر تحميل بيانات لوحة التحكم. حاول مرة أخرى."
            : "Unable to load dashboard data. Please try again.",

        retry: isArabic ? "حاول مرة أخرى" : "Try Again",

        title: isArabic
    ? "نظرة عامة على لوحة التحكم"
    : "Dashboard Overview",

        subtitle: isArabic
            ? "إليك ملخص ما يحدث في مكتبتك."
            : "Here's what's happening with your library.",

        overview: isArabic ? "ملخص المكتبة" : "Library Overview",

        totalOrders: isArabic ? "إجمالي الطلبات" : "Total Orders",
        pendingOrders: isArabic ? "الطلبات المعلقة" : "Pending Orders",
        completedOrders: isArabic ? "الطلبات المكتملة" : "Completed Orders",
        activeProducts: isArabic ? "المنتجات النشطة" : "Active Products",

        recentOrders: isArabic ? "أحدث الطلبات" : "Recent Orders",

        recentSubtitle: isArabic
            ? "أحدث طلبات العملاء."
            : "The latest customer orders.",

        noOrders: isArabic ? "لا توجد طلبات حتى الآن" : "No orders yet",

        noOrdersDescription: isArabic
            ? "ستظهر طلبات العملاء الجديدة هنا."
            : "New customer orders will appear here.",

        customer: isArabic ? "العميل" : "Customer",
        orderTotal: isArabic ? "إجمالي الطلب" : "Order Total",
        status: isArabic ? "الحالة" : "Status",
        date: isArabic ? "التاريخ" : "Date",
    };

    useEffect(() => {
        let active = true;

        async function loadDashboard() {
            try {
                setLoading(true);
                setError(false);

                const [
                    totalResult,
                    pendingResult,
                    completedResult,
                    productsResult,
                    ordersResult,
                ] = await Promise.all([
                    supabase
                        .from("orders")
                        .select("id", { count: "exact", head: true }),

                    supabase
                        .from("orders")
                        .select("id", { count: "exact", head: true })
                        .eq("status", "pending"),

                    supabase
                        .from("orders")
                        .select("id", { count: "exact", head: true })
                        .eq("status", "completed"),

                    supabase
                        .from("products")
                        .select("id", { count: "exact", head: true })
                        .eq("is_active", true),

                    supabase
                        .from("orders")
                        .select(
                            "id, customer_name, total, status, created_at"
                        )
                        .order("created_at", { ascending: false })
                        .limit(5),
                ]);

                const results = [
                    totalResult,
                    pendingResult,
                    completedResult,
                    productsResult,
                    ordersResult,
                ];

                const failedResult = results.find(
                    (result) => result.error
                );

                if (failedResult) {
                    throw failedResult.error;
                }

                if (!active) return;

                setStats({
                    totalOrders: totalResult.count ?? 0,
                    pendingOrders: pendingResult.count ?? 0,
                    completedOrders: completedResult.count ?? 0,
                    activeProducts: productsResult.count ?? 0,
                });

                setRecentOrders(ordersResult.data ?? []);
            } catch (err) {
                console.error("Dashboard loading error:", err);

                if (active) {
                    setError(true);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadDashboard();

        return () => {
            active = false;
        };
    }, [retryCount]);

    const cards = [
    {
        label: t.totalOrders,
        value: stats.totalOrders,
        icon: ShoppingCart,
        color: "blue",
    },
    {
        label: t.pendingOrders,
        value: stats.pendingOrders,
        icon: Clock3,
        color: "orange",
    },
    {
        label: t.completedOrders,
        value: stats.completedOrders,
        icon: CheckCircle,
        color: "green",
    },
    {
        label: t.activeProducts,
        value: stats.activeProducts,
        icon: Package,
        color: "purple",
    },
];

    function formatNumber(value) {
        return Number(value ?? 0).toLocaleString(
            isArabic ? "ar" : "en-US"
        );
    }

    function formatDate(date) {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleString(
            isArabic ? "ar" : "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    }

    function handleRetry() {
        setRetryCount((previous) => previous + 1);
    }

    if (loading) {
        return (
            <div
                className="dashboard-message"
                dir={isArabic ? "rtl" : "ltr"}
            >
                <div className="dashboard-spinner"></div>
                <p>{t.loading}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="dashboard-error"
                role="alert"
                dir={isArabic ? "rtl" : "ltr"}
            >
                <p>{t.error}</p>

                <button onClick={handleRetry}>
                    {t.retry}
                </button>
            </div>
        );
    }

    return (
        <div
            className="dashboard"
            dir={isArabic ? "rtl" : "ltr"}
        >
            {/* Dashboard Heading */}
            <div className="dashboard-heading">
                <div>
                    <h1>{t.title}</h1>
                    <p>{t.subtitle}</p>
                </div>

                <span className="dashboard-live">
                    <span></span>
                    {t.overview}
                </span>
            </div>

            {/* Statistics Cards */}
            <div className="dashboard-stats">
                {cards.map((card) => (
                    <article
                        className="stat-card"
                        key={card.label}
                    >
                        <div className={`stat-icon ${card.color}`}>
    <card.icon size={24} strokeWidth={2} />
</div>

                        <div className="stat-details">
                            <p>{card.label}</p>

                            <h2>
                                {formatNumber(card.value)}
                            </h2>
                        </div>
                    </article>
                ))}
            </div>

            {/* Recent Orders */}
            <section className="recent-orders">
                <div className="section-heading">
                    <div>
                        <h2>{t.recentOrders}</h2>
                        <p>{t.recentSubtitle}</p>
                    </div>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="empty-orders">
                        <h3>{t.noOrders}</h3>
                        <p>{t.noOrdersDescription}</p>
                    </div>
                ) : (
                    <div className="orders-table-wrapper">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>{t.customer}</th>
                                    <th>{t.orderTotal}</th>
                                    <th>{t.status}</th>
                                    <th>{t.date}</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="customer-name">
                                            {order.customer_name || "—"}
                                        </td>

                                        <td>
                                            {formatNumber(order.total)}
                                        </td>

                                        <td>
                                            <span
                                                className={`order-status ${order.status}`}
                                            >
                                                {statusLabels[order.status] ??
                                                    order.status}
                                            </span>
                                        </td>

                                        <td className="order-date">
                                            {formatDate(order.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Dashboard;
