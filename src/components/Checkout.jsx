
import formatPrice from "../utils/formatPrice";

function Checkout({ cart, language }) {
    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    function handleCheckout(event) {
        event.preventDefault();

        if (cart.length === 0) return;

        const isArabic = language === "ar";
        console.log("Checkout language:", language, "Is Arabic:", isArabic);
        const formData = new FormData(event.currentTarget);

        const customerName = formData.get("name");
        const customerPhone = formData.get("phone");
        const address = formData.get("address");

        const orderItems = cart.map((item) => {
            const productName = isArabic
                ? item.nameAr || item.name
                : item.name;

            return `${productName} × ${item.quantity} = ${formatPrice(
                item.price * item.quantity
            )}`;
        });

        const message = isArabic
            ? `
طلب جديد - مكتبة المسيد

بيانات العميل:
الاسم: ${customerName}
رقم الهاتف: ${customerPhone}
العنوان: ${address}

تفاصيل الطلب:
${orderItems.join("\n")}

الإجمالي: ${formatPrice(total)}

شكراً لطلبكم من مكتبة المسيد.
            `
            : `
New Order - Al-Maseed Library

Customer Details:
Name: ${customerName}
Phone: ${customerPhone}
Address: ${address}

Order Details:
${orderItems.join("\n")}

Total: ${formatPrice(total)}

Thank you for ordering from Al-Maseed Library.
            `;

        const libraryWhatsApp = "249928658885";

        const whatsappURL =
            `https://wa.me/${libraryWhatsApp}?text=${encodeURIComponent(message)}`;

        window.open(whatsappURL, "_blank");
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
                    placeholder={language === "ar" ? "رقم الهاتف" : "Phone Number"}
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

                <button type="submit" disabled={cart.length === 0}>
                    {language === "ar"
                        ? "إرسال الطلب عبر واتساب"
                        : "Send Order via WhatsApp"}
                </button>
            </form>
        </section>
    );
}

export default Checkout;
