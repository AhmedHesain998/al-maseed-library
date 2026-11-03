
import formatPrice from "../utils/formatPrice";

function ProductCard({ product, language, addToCart }) {
    return (
        <article className="product-card">
            <div className="product-image">
    <img
        src={product.image}
        alt={language === "ar" ? product.nameAr : product.name}
        loading="lazy"
    />
</div>

            <div className="product-info">
                <h3>
                    {language === "ar"
                        ? product.nameAr
                        : product.name}
                </h3>

                <p className="product-price">
                    {formatPrice(product.price)}
                </p>

                <button
                    className="add-to-cart"
                    onClick={() => addToCart(product)}
                >
                    {language === "ar" ? "أضف إلى السلة" : "Add to Cart"}
                </button>
            </div>
        </article>
    );
}

export default ProductCard;
