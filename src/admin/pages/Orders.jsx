
import { Fragment, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAdminLanguage } from "../context/AdminLanguageContext";
import { useAdminToast } from "../context/AdminToastContext";
import {
    Search,
    Eye,
    X,
    Package,
    Phone,
    MapPin,
    MessageCircle,
    Check,
    AlertCircle,
} from "lucide-react";
import "./Orders.css";

const statuses = [
    "pending",
    "confirmed",
    "processing",
    "completed",
    "cancelled",
];

const progressStatuses = [
    "pending",
    "confirmed",
    "processing",
    "completed",
];

function Orders() {
    const { isArabic } = useAdminLanguage();
    const { showToast } = useAdminToast();

    const statusLabels = {
        pending: isArabic ? "قيد الانتظار" : "Pending",
        confirmed: isArabic ? "تم التأكيد" : "Confirmed",
        processing: isArabic ? "قيد التجهيز" : "Processing",
        completed: isArabic ? "مكتمل" : "Completed",
        cancelled: isArabic ? "ملغي" : "Cancelled",
    };

    const t = {
        loading: isArabic ? "جاري تحميل الطلبات..." : "Loading orders...",
        loadError: isArabic
            ? "تعذر تحميل الطلبات. حاول مرة أخرى."
            : "Unable to load orders. Please try again.",

        title: isArabic ? "إدارة الطلبات" : "Orders Management",
        subtitle: isArabic
            ? "عرض وإدارة طلبات العملاء."
            : "View and manage customer orders.",
        total: isArabic ? "إجمالي الطلبات" : "Total Orders",

        search: isArabic
            ? "ابحث باسم العميل أو الهاتف أو رقم الطلب..."
            : "Search by customer, phone or order ID...",

        allStatuses: isArabic ? "كل الحالات" : "All statuses",
        noOrders: isArabic ? "لم يتم العثور على طلبات" : "No orders found",
        noOrdersDescription: isArabic
            ? "ستظهر طلبات العملاء هنا."
            : "Customer orders will appear here.",
        changeSearch: isArabic
            ? "جرّب تغيير البحث أو الفلتر."
            : "Try changing your search or filter.",

        orderId: isArabic ? "رقم الطلب" : "Order ID",
        customer: isArabic ? "العميل" : "Customer",
        totalLabel: isArabic ? "الإجمالي" : "Total",
        date: isArabic ? "التاريخ" : "Date",
        status: isArabic ? "الحالة" : "Status",
        details: isArabic ? "التفاصيل" : "Details",
        view: isArabic ? "عرض التفاصيل" : "View Details",
        close: isArabic ? "إغلاق" : "Close",

        customerDetails: isArabic ? "بيانات العميل" : "Customer Details",
        phone: isArabic ? "الهاتف" : "Phone",
        address: isArabic ? "العنوان" : "Address",
        language: isArabic ? "اللغة" : "Language",
        whatsapp: isArabic ? "تواصل عبر واتساب" : "Contact on WhatsApp",

        orderedProducts: isArabic ? "المنتجات المطلوبة" : "Ordered Products",
        noProductDetails: isArabic
            ? "لا توجد تفاصيل متاحة للمنتجات."
            : "No product details available.",

        progress: isArabic ? "مراحل تنفيذ الطلب" : "Order Progress",
        cancelledMessage: isArabic
            ? "تم إلغاء هذا الطلب."
            : "This order has been cancelled.",

        unitPrice: isArabic ? "سعر الوحدة" : "Unit Price",

        updateSuccess: isArabic
            ? "تم تحديث حالة الطلب إلى"
            : "Order status updated to",
        updateError: isArabic
            ? "تعذر تحديث حالة الطلب."
            : "Could not update order status.",
        tryAgain: isArabic ? "حاول مرة أخرى." : "Please try again.",

        newOrder: isArabic ? "وصل طلب جديد!" : "A new order has arrived!",
        live: isArabic ? "متصل مباشرة" : "Live",
        connecting: isArabic ? "جاري الاتصال..." : "Connecting...",
        disconnected: isArabic ? "غير متصل" : "Disconnected",

        currency: "SDG",
    };

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [updatingOrder, setUpdatingOrder] = useState(null);
    const [realtimeStatus, setRealtimeStatus] = useState("CONNECTING");

    // Keep latest values available inside Realtime callbacks.
    const isArabicRef = useRef(isArabic);
    const showToastRef = useRef(showToast);

    isArabicRef.current = isArabic;
    showToastRef.current = showToast;

    // Load existing orders.
    useEffect(() => {
        let active = true;

        async function loadOrders() {
            try {
                setLoading(true);
                setError("");

                const { data, error } = await supabase
                    .from("orders")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) throw error;

                if (active) {
                    setOrders(data ?? []);
                }
            } catch (error) {
                console.error("Orders loading error:", error);

                if (active) {
                    setError(
                        isArabicRef.current
                            ? "تعذر تحميل الطلبات. حاول مرة أخرى."
                            : "Unable to load orders. Please try again."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadOrders();

        return () => {
            active = false;
        };
    }, []);

    // Supabase Realtime subscription.
    useEffect(() => {
        console.log("Starting orders Realtime subscription...");

        const channel = supabase
            .channel("admin-orders-live")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "orders",
                },
                (payload) => {
                    const newOrder = payload.new;

                    console.log("NEW ORDER REALTIME EVENT:", newOrder);

                    setOrders((currentOrders) => {
                        const alreadyExists = currentOrders.some(
                            (order) => order.id === newOrder.id
                        );

                        if (alreadyExists) {
                            console.log("Order already exists:", newOrder.id);
                            return currentOrders;
                        }

                        return [newOrder, ...currentOrders];
                    });

                    showToastRef.current(
                        "success",
                        isArabicRef.current
                            ? "وصل طلب جديد!"
                            : "A new order has arrived!"
                    );
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "orders",
                },
                (payload) => {
                    console.log("ORDER UPDATE EVENT:", payload.new);

                    const updatedOrder = payload.new;

                    setOrders((currentOrders) => {
                        const exists = currentOrders.some(
                            (order) => order.id === updatedOrder.id
                        );

                        if (!exists) {
                            return [updatedOrder, ...currentOrders];
                        }

                        return currentOrders.map((order) =>
                            order.id === updatedOrder.id
                                ? updatedOrder
                                : order
                        );
                    });
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "orders",
                },
                (payload) => {
                    console.log("ORDER DELETE EVENT:", payload.old);

                    setOrders((currentOrders) =>
                        currentOrders.filter(
                            (order) => order.id !== payload.old.id
                        )
                    );
                }
            )
            .subscribe((status, err) => {
                console.log("Orders Realtime status:", status);

                if (err) {
                    console.error("Orders Realtime error:", err);
                }

                setRealtimeStatus(status);
            });

        return () => {
            console.log("Removing orders Realtime subscription...");
            supabase.removeChannel(channel);
        };
    }, []);

    // Update order status.
    async function handleStatusChange(orderId, newStatus) {
        const oldOrder = orders.find(
            (order) => order.id === orderId
        );

        if (!oldOrder || oldOrder.status === newStatus) return;

        const previousStatus = oldOrder.status;

        setUpdatingOrder(orderId);

        setOrders((currentOrders) =>
            currentOrders.map((order) =>
                order.id === orderId
                    ? { ...order, status: newStatus }
                    : order
            )
        );

        try {
            const { error } = await supabase
                .from("orders")
                .update({ status: newStatus })
                .eq("id", orderId);

            if (error) throw error;

            showToast(
                "success",
                `${t.updateSuccess} ${statusLabels[newStatus]}.`
            );
        } catch (error) {
            console.error("Order status update error:", error);

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === orderId
                        ? { ...order, status: previousStatus }
                        : order
                )
            );

            showToast(
                "error",
                `${t.updateError} ${error.message || t.tryAgain}`
            );
        } finally {
            setUpdatingOrder(null);
        }
    }

    function formatDate(date) {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "—";

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

    function formatNumber(value) {
        const number = Number(value);

        if (!Number.isFinite(number)) return "0";

        return number.toLocaleString(
            isArabic ? "ar" : "en-US"
        );
    }

    function getWhatsAppLink(phone) {
        const cleanPhone = String(phone ?? "").replace(/\D/g, "");

        return cleanPhone
            ? `https://wa.me/${cleanPhone}`
            : null;
    }

    function getProductName(item) {
        return isArabic
            ? item.name_ar || item.name || "منتج"
            : item.name || item.name_ar || "Product";
    }

    function getItemPrice(item) {
        const price = Number(item.price);

        return Number.isFinite(price) ? price : 0;
    }

    function getItemQuantity(item) {
        const quantity = Number(item.quantity);

        return Number.isFinite(quantity) && quantity > 0
            ? quantity
            : 0;
    }

    function renderOrderProgress(order) {
        if (order.status === "cancelled") {
            return (
                <div className="order-cancelled">
                    <AlertCircle size={22} />
                    <strong>{t.cancelledMessage}</strong>
                </div>
            );
        }

        const currentIndex = progressStatuses.indexOf(order.status);

        return (
            <div className="order-progress-steps">
                {progressStatuses.map((status, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                        <Fragment key={status}>
                            <div
                                className={`order-progress-step ${
                                    isCompleted
                                        ? "completed"
                                        : isCurrent
                                            ? "current"
                                            : ""
                                }`}
                            >
                                <span className="progress-marker">
                                    {isCompleted ? (
                                        <Check size={16} strokeWidth={3} />
                                    ) : (
                                        index + 1
                                    )}
                                </span>

                                <span className="progress-label">
                                    {statusLabels[status]}
                                </span>
                            </div>

                            {index !== progressStatuses.length - 1 && (
                                <div
                                    className={`progress-connector ${
                                        index < currentIndex
                                            ? "completed"
                                            : ""
                                    }`}
                                />
                            )}
                        </Fragment>
                    );
                })}
            </div>
        );
    }

    const filteredOrders = orders.filter((order) => {
        const searchValue = search.trim().toLowerCase();

        const matchesSearch =
            !searchValue ||
            order.customer_name?.toLowerCase().includes(searchValue) ||
            order.customer_phone?.toLowerCase().includes(searchValue) ||
            order.id?.toLowerCase().includes(searchValue);

        const matchesStatus =
            statusFilter === "all" || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="orders-message" dir={isArabic ? "rtl" : "ltr"}>
                <div className="orders-spinner"></div>
                <p>{t.loading}</p>
            </div>
        );
    }

    return (
        <div className="orders-page" dir={isArabic ? "rtl" : "ltr"}>
            <div className="orders-heading">
                <div>
                    <h1>{t.title}</h1>
                    <p>{t.subtitle}</p>
                </div>

                <div className="orders-heading-actions">
                    <div
                        className={`orders-live-status ${
                            realtimeStatus === "SUBSCRIBED"
                                ? "connected"
                                : realtimeStatus === "CONNECTING"
                                    ? "connecting"
                                    : "disconnected"
                        }`}
                    >
                        <span className="orders-live-dot"></span>

                        <span>
                            {realtimeStatus === "SUBSCRIBED"
                                ? t.live
                                : realtimeStatus === "CONNECTING"
                                    ? t.connecting
                                    : t.disconnected}
                        </span>
                    </div>

                    <div className="orders-count">
                        {formatNumber(orders.length)} {t.total}
                    </div>
                </div>
            </div>

            {error && (
                <div className="orders-error" role="alert">
                    {error}
                </div>
            )}

            <section className="orders-panel">
                <div className="orders-toolbar">
                    <div className="orders-search">
                        <Search size={19} />

                        <input
                            type="search"
                            placeholder={t.search}
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />
                    </div>

                    <select
                        className="orders-filter"
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >
                        <option value="all">{t.allStatuses}</option>

                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {statusLabels[status]}
                            </option>
                        ))}
                    </select>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="orders-empty">
                        <Package size={35} />
                        <h3>{t.noOrders}</h3>

                        <p>
                            {orders.length === 0
                                ? t.noOrdersDescription
                                : t.changeSearch}
                        </p>
                    </div>
                ) : (
                    <div className="orders-table-wrapper">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>{t.orderId}</th>
                                    <th>{t.customer}</th>
                                    <th>{t.totalLabel}</th>
                                    <th>{t.date}</th>
                                    <th>{t.status}</th>
                                    <th>{t.details}</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredOrders.map((order) => {
                                    const orderItems = Array.isArray(order.items)
                                        ? order.items
                                        : [];

                                    const isExpanded =
                                        expandedOrder === order.id;

                                    return (
                                        <Fragment key={order.id}>
                                            <tr>
                                                <td className="order-id">
                                                    #{String(order.id).slice(0, 8)}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {order.customer_name || "—"}
                                                    </strong>

                                                    <small className="order-phone">
                                                        {order.customer_phone || "—"}
                                                    </small>
                                                </td>

                                                <td className="order-total">
                                                    {formatNumber(order.total)}
                                                    {" "}
                                                    <small>{t.currency}</small>
                                                </td>

                                                <td className="order-date">
                                                    {formatDate(order.created_at)}
                                                </td>

                                                <td>
                                                    <select
                                                        className={`order-status-select ${order.status}`}
                                                        value={order.status}
                                                        disabled={
                                                            updatingOrder === order.id
                                                        }
                                                        onChange={(event) =>
                                                            handleStatusChange(
                                                                order.id,
                                                                event.target.value
                                                            )
                                                        }
                                                    >
                                                        {statuses.map((status) => (
                                                            <option
                                                                key={status}
                                                                value={status}
                                                            >
                                                                {statusLabels[status]}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="order-details-button"
                                                        onClick={() =>
                                                            setExpandedOrder(
                                                                isExpanded
                                                                    ? null
                                                                    : order.id
                                                            )
                                                        }
                                                    >
                                                        {isExpanded ? (
                                                            <X size={15} />
                                                        ) : (
                                                            <Eye size={15} />
                                                        )}

                                                        {isExpanded
                                                            ? t.close
                                                            : t.view}
                                                    </button>
                                                </td>
                                            </tr>

                                            {isExpanded && (
                                                <tr className="order-expanded-row">
                                                    <td colSpan="6">
                                                        <div className="order-expanded">
                                                            <div className="order-progress">
                                                                <h3>{t.progress}</h3>
                                                                {renderOrderProgress(order)}
                                                            </div>

                                                            <div className="order-info">
                                                                <h3>
                                                                    {t.customerDetails}
                                                                </h3>

                                                                <p>
                                                                    <Phone
                                                                        size={15}
                                                                        className="detail-icon"
                                                                    />
                                                                    <strong>{t.phone}:</strong>
                                                                    {" "}
                                                                    {order.customer_phone || "—"}
                                                                </p>

                                                                <p>
                                                                    <MapPin
                                                                        size={15}
                                                                        className="detail-icon"
                                                                    />
                                                                    <strong>{t.address}:</strong>
                                                                    {" "}
                                                                    {order.address || "—"}
                                                                </p>

                                                                <p>
                                                                    <strong>{t.language}:</strong>
                                                                    {" "}
                                                                    {order.language || "—"}
                                                                </p>

                                                                {getWhatsAppLink(
                                                                    order.customer_phone
                                                                ) && (
                                                                    <a
                                                                        className="order-whatsapp"
                                                                        href={getWhatsAppLink(
                                                                            order.customer_phone
                                                                        )}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                    >
                                                                        <MessageCircle size={16} />
                                                                        {t.whatsapp}
                                                                    </a>
                                                                )}
                                                            </div>

                                                            <div className="order-items">
                                                                <h3>
                                                                    {t.orderedProducts}
                                                                </h3>

                                                                {orderItems.length > 0 ? (
                                                                    <>
                                                                        {orderItems.map(
                                                                            (item, index) => {
                                                                                const price =
                                                                                    getItemPrice(item);

                                                                                const quantity =
                                                                                    getItemQuantity(item);

                                                                                return (
                                                                                    <div
                                                                                        className="order-item"
                                                                                        key={
                                                                                            item.product_id ??
                                                                                            index
                                                                                        }
                                                                                    >
                                                                                        <div className="order-item-info">
                                                                                            <strong>
                                                                                                {getProductName(item)}
                                                                                            </strong>

                                                                                            <small>
                                                                                                {t.unitPrice}:{" "}
                                                                                                {formatNumber(price)}{" "}
                                                                                                {t.currency}
                                                                                                {" × "}
                                                                                                {formatNumber(quantity)}
                                                                                            </small>
                                                                                        </div>

                                                                                        <strong className="order-item-total">
                                                                                            {formatNumber(
                                                                                                price * quantity
                                                                                            )}{" "}
                                                                                            {t.currency}
                                                                                        </strong>
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <p>
                                                                        {t.noProductDetails}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Orders;
