
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import "./AdminToast.css";

const AdminToastContext = createContext(null);

export function AdminToastProvider({ children, isArabic }) {
    const [toast, setToast] = useState(null);
    const toastIdRef = useRef(0);

    const showToast = useCallback((type, message) => {
        toastIdRef.current += 1;

        setToast({
            id: toastIdRef.current,
            type,
            message,
        });
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    useEffect(() => {
        if (!toast) return;

        const timer = setTimeout(() => {
            setToast((currentToast) =>
                currentToast?.id === toast.id ? null : currentToast
            );
        }, 5000);

        return () => clearTimeout(timer);
    }, [toast]);

    return (
        <AdminToastContext.Provider value={{ showToast, hideToast }}>
            {children}

            {toast && (
                <div
                    key={toast.id}
                    className={`admin-toast admin-toast-${toast.type}`}
                    role={toast.type === "error" ? "alert" : "status"}
                    aria-live={toast.type === "error" ? "assertive" : "polite"}
                    dir={isArabic ? "rtl" : "ltr"}
                >
                    <span className="admin-toast-icon">
                        {toast.type === "success" && "✓"}
                        {toast.type === "error" && "!"}
                        {toast.type === "warning" && "⚠"}
                        {toast.type === "info" && "i"}
                    </span>

                    <p>{toast.message}</p>

                    <button
                        type="button"
                        className="admin-toast-close"
                        onClick={hideToast}
                        aria-label={
                            isArabic ? "إغلاق الإشعار" : "Close notification"
                        }
                    >
                        ×
                    </button>
                </div>
            )}
        </AdminToastContext.Provider>
    );
}

export function useAdminToast() {
    const context = useContext(AdminToastContext);

    if (!context) {
        throw new Error(
            "useAdminToast must be used inside AdminToastProvider"
        );
    }

    return context;
}
