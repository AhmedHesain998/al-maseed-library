
import { useState } from "react";
import formatPrice from "../utils/formatPrice";
import { supabase } from "../lib/supabase";

function Checkout({ cart, language }) {
    const [submitting, setSubmitting] = useState(false);
    const [phone, setPhone] = useState("");

    // Remove non-numeric characters and convert Arabic digits to English.
    function sanitizePhoneNumber(value) {
        return value
            .replace(/[٠-٩]/g, (digit) =>
                String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))
            )
            .replace(/[۰-۹]/g, (digit) =>
                String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
            )
            .replace(/[^0-9]/g, "")
            .slice(0, 12);
    }

    // Validate and normalize Sudanese mobile numbers.
    function normalizeSudanPhone(value) {
        // Local format: 09XXXXXXXX
        if (/^09\d{8}$/.test(value)) {
            return `249${value.slice(1)}`;
        }

        // International format: 2499XXXXXXXX
        if (/^2499\d{8}$/.test(value)) {
            return value;
        }

        return null;
    }

    // Display estimate only. The server calculates the real total.
    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    async function handleCheckout(event) {
        event.preventDefault();

        if (cart.length === 0 || submitting) return;

        const whatsappWindow = window.open("about:blank", "_blank");

        if (!whatsappWindow) {
            alert(
                language === "ar"
                    ? "يرجى السماح بفتح النوافذ المنبثقة للموقع."
                    : "Please allow pop-ups for this website."
            );
            return;
        }

        setSubmitting(true);

        try {
            const isArabic = language === "ar";
            const formData = new FormData(event.currentTarget);

            const customerName = formData.get("name").trim();
            const customerPhone = normalizeSudanPhone(
                sanitizePhoneNumber(phone)
            );
            const address = formData.get("address").trim();

            if (!customerPhone) {
                throw new Error("INVALID_PHONE");
            }

            const storageKey = "al-maseed-pending-order-key";

            let idempotencyKey = sessionStorage.getItem(storageKey);

            if (!idempotencyKey) {
                idempotencyKey = crypto.randomUUID();
                sessionStorage.setItem(storageKey, idempotencyKey);
            }

            // Send only product IDs and quantities.
            // Prices and names are verified by the Edge Function.
            const { data, error } = await supabase.functions.invoke(
                "create-order",
                {
                    body: {
                        customer_name: customerName,
                        customer_phone: customerPhone,
                        address,
                        language,
                        items: cart.map((item) => ({
                            product_id: item.id,
                            quantity: item.quantity,
                        })),
                        idempotency_key: idempotencyKey,
                    },
                }
            );

            if (error) {
                throw error;
            }

            if (!data?.success || !data?.order) {
                throw new Error("Invalid order response.");
            }

            const order = data.order;

            // Use server-verified order items and total.
            const orderItems = order.items.map((item) => {
                const productName = isArabic
                    ? item.name_ar || item.name
                    : item.name;

                return `${productName} × ${item.quantity} = ${formatPrice(
                    item.price * item.quantity
                )}`;
            });

            const verifiedTotal = Number(order.total);

            const message = isArabic
                ? `
طلب جديد - مكتبة المسيد

رقم الطلب: ${order.id}

بيانات العميل:
الاسم: ${customerName}
رقم الهاتف: ${customerPhone}
العنوان: ${address}

تفاصيل الطلب:
${orderItems.join("\n")}

الإجمالي: ${formatPrice(verifiedTotal)}

شكراً لطلبكم من مكتبة المسيد.
                `
                : `
New Order - Al-Maseed Library

Order ID: ${order.id}

Customer Details:
Name: ${customerName}
Phone: ${customerPhone}
Address: ${address}

Order Details:
${orderItems.join("\n")}

Total: ${formatPrice(verifiedTotal)}

Thank you for ordering from Al-Maseed Library.
                `;

            const libraryWhatsApp = "249928658885";

            const whatsappURL =
                `https://wa.me/${libraryWhatsApp}?text=${encodeURIComponent(message)}`;

            whatsappWindow.location.href = whatsappURL;

            sessionStorage.removeItem(storageKey);

            alert(
                isArabic
                    ? "تم حفظ طلبك بنجاح!"
                    : "Your order has been saved successfully!"
            );

        } catch (error) {
            console.error("Error creating order:", error);

            whatsappWindow.close();

            alert(
                error.message === "INVALID_PHONE"
                    ? language === "ar"
                        ? "يرجى إدخال رقم هاتف سوداني صحيح (09XXXXXXXX أو 2499XXXXXXXX)."
                        : "Please enter a valid Sudanese mobile number."
                    : language === "ar"
                        ? "تعذر حفظ الطلب. حاول مرة أخرى."
                        : "Could not save your order. Please try again."
            );

        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section id="checkout" className="checkout-section">
            <h2>
                {language === "ar"
                    ? "إتمام الطلب"
                    : "Complete Your Order"}
            </h2>

            <form onSubmit={handleCheckout}>
                <input
                    type="text"
                    name="name"
                    placeholder={language === "ar" ? "الاسم" : "Your Name"}
                    required
                />

                <input
                    type="tel"
                    name="phone"
                    placeholder={
                        language === "ar"
                            ? "رقم الهاتف مثال: 0912345678"
                            : "Phone Number e.g. 0912345678"
                    }
                    value={phone}
                    onChange={(event) => {
                        setPhone(
                            sanitizePhoneNumber(event.target.value)
                        );
                    }}
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={12}
                    required
                />

                <textarea
                    name="address"
                    placeholder={
                        language === "ar"
                            ? "العنوان أو ملاحظات الطلب"
                            : "Address or Order Notes"
                    }
                    required
                />

                <h3>
                    {language === "ar" ? "الإجمالي: " : "Total: "}
                    {formatPrice(total)}
                </h3>

                <button
                    type="submit"
                    disabled={cart.length === 0 || submitting}
                >
                    {submitting
                        ? language === "ar"
                            ? "جارٍ إرسال الطلب..."
                            : "Submitting..."
                        : language === "ar"
                            ? "إرسال الطلب عبر واتساب"
                            : "Send Order via WhatsApp"}
                </button>
            </form>
        </section>
    );
}

export default Checkout;
