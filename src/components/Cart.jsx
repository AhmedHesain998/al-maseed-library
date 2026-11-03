
import formatPrice from "../utils/formatPrice";

function Cart({
    cart,
    language,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart
}) {
    const isArabic = language === "ar";

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const itemCount = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    return (
        <section className="cart-section" id="cart">
            <div className="cart-container">

                <div className="cart-heading">
                    <div>
                        <span className="cart-eyebrow">
                            {isArabic ? "مكتبة المسيد" : "AL-MASEED LIBRARY"}
                        </span>

                        <h2>
                            {isArabic ? "سلة المشتريات" : "Shopping Cart"}
                        </h2>

                        <p>
                            {isArabic
                                ? `${itemCount} قطعة في سلتك`
                                : `${itemCount} items in your cart`}
                        </p>
                    </div>
                </div>

                {cart.length === 0 ? (
                    <div className="empty-cart">
                        <div className="empty-cart-icon">🛒</div>

                        <h3>
                            {isArabic ? "سلتك فارغة!" : "Your cart is empty!"}
                        </h3>

                        <p>
                            {isArabic
                                ? "اكتشف منتجاتنا وأضف ما تحتاجه إلى سلتك."
                                : "Explore our products and add something you need."}
                        </p>
                    </div>
                ) : (
                    <div className="cart-layout">

                        <div className="cart-products">
                            {cart.map((item) => (
                                <article className="cart-product" key={item.id}>
                                    <div className="cart-product-icon">
                                        📚
                                    </div>

                                    <div className="cart-product-details">
                                        <h3>
                                            {isArabic
                                                ? item.nameAr
                                                : item.name}
                                        </h3>

                                        <p className="cart-unit-price">
                                            {formatPrice(item.price)}
                                        </p>

                                        <div className="cart-quantity">
                                            <button
                                                type="button"
                                                onClick={() => decreaseQuantity(item.id)}
                                            >
                                                −
                                            </button>

                                            <span>{item.quantity}</span>

                                            <button
                                                type="button"
                                                onClick={() => increaseQuantity(item.id)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cart-product-end">
                                        <strong>
                                            {formatPrice(item.price * item.quantity)}
                                        </strong>

                                        <button
                                            type="button"
                                            className="remove-product"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            {isArabic ? "حذف" : "Remove"}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <aside className="cart-summary">
                            <h3>
                                {isArabic ? "ملخص الطلب" : "Order Summary"}
                            </h3>

                            <div className="summary-row">
                                <span>
                                    {isArabic ? "عدد القطع" : "Items"}
                                </span>
                                <span>{itemCount}</span>
                            </div>

                            <div className="summary-row">
                                <span>
                                    {isArabic ? "المجموع" : "Subtotal"}
                                </span>
                                <span>{formatPrice(total)}</span>
                            </div>

                            <div className="summary-total">
                                <span>
                                    {isArabic ? "الإجمالي" : "Total"}
                                </span>
                                <strong>
                                    {formatPrice(total)}
                                </strong>
                            </div>

                            <a href="#checkout" className="checkout-link">
                                {isArabic
                                    ? "متابعة إتمام الطلب"
                                    : "Proceed to Checkout"}
                            </a>
                        </aside>

                    </div>
                )}
            </div>
        </section>
    );
}

export default Cart;
