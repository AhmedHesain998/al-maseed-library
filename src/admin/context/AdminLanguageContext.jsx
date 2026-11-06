import { createContext, useContext, useState } from "react";

const AdminLanguageContext = createContext();

export function AdminLanguageProvider({ children }) {
    const [language, setLanguage] = useState(
        () => localStorage.getItem("adminLanguage") || "ar"
    );

    function changeLanguage(newLanguage) {
        setLanguage(newLanguage);
        localStorage.setItem("adminLanguage", newLanguage);
    }

    return (
        <AdminLanguageContext.Provider
            value={{
                language,
                isArabic: language === "ar",
                changeLanguage,
            }}
        >
            {children}
        </AdminLanguageContext.Provider>
    );
}

export function useAdminLanguage() {
    return useContext(AdminLanguageContext);
}