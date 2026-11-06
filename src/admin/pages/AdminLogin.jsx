import { useState } from "react";
import { supabase } from "../../lib/supabase";
import "./AdminLogin.css";

function AdminLogin({ onLogin }) {
    const [language, setLanguage] = useState("ar");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const isArabic = language === "ar";

    async function handleLogin(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const { data, error: loginError } =
                await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

            if (loginError) throw loginError;

            const { data: admin, error: adminError } = await supabase
                .from("admin_users")
                .select("user_id")
                .eq("user_id", data.user.id)
                .maybeSingle();

            if (adminError) throw adminError;

            if (!admin) {
                await supabase.auth.signOut();

                throw new Error(
                    isArabic
                        ? "هذا الحساب ليس لديه صلاحية الدخول للإدارة."
                        : "This account is not an administrator."
                );
            }

            onLogin();

        } catch (error) {
            console.error("Admin login error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main
            className="admin-login"
            dir={isArabic ? "rtl" : "ltr"}
        >
            <div className="admin-login-card">

                <div className="admin-login-language">
                    <button
                        type="button"
                        onClick={() =>
                            setLanguage(isArabic ? "en" : "ar")
                        }
                    >
                        {isArabic ? "English" : "العربية"}
                    </button>
                </div>

                <div className="admin-login-brand">
                    <div className="admin-login-logo">M</div>

                    <h1>
                        {isArabic ? "مكتبة المسيد" : "Al-Maseed Library"}
                    </h1>

                    <p>
                        {isArabic
                            ? "لوحة تحكم الإدارة"
                            : "Administration Dashboard"}
                    </p>
                </div>

                <h2>
                    {isArabic ? "تسجيل الدخول" : "Admin Login"}
                </h2>

                <form
                    className="admin-login-form"
                    onSubmit={handleLogin}
                >
                    <div className="admin-login-field">
                        <label>
                            {isArabic ? "البريد الإلكتروني" : "Email Address"}
                        </label>

                        <input
                            type="email"
                            placeholder={
                                isArabic
                                    ? "أدخل بريدك الإلكتروني"
                                    : "Enter your email"
                            }
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="admin-login-field">
                        <label>
                            {isArabic ? "كلمة المرور" : "Password"}
                        </label>

                        <input
                            type="password"
                            placeholder={
                                isArabic
                                    ? "أدخل كلمة المرور"
                                    : "Enter your password"
                            }
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                        />
                    </div>

                    {error && (
                        <p className="admin-login-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        className="admin-login-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? isArabic
                                ? "جارٍ تسجيل الدخول..."
                                : "Signing in..."
                            : isArabic
                                ? "دخول"
                                : "Sign In"}
                    </button>
                </form>

                <div className="admin-login-footer">
                    {isArabic
                        ? "© مكتبة المسيد. جميع الحقوق محفوظة."
                        : "© Al-Maseed Library. All rights reserved."}
                </div>

            </div>
        </main>
    );
}

export default AdminLogin;