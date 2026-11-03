
import { useState } from "react";
import products from "../data/products";
import ProductCard from "./ProductCard";

function Products({ language, addToCart }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const isArabic = language === "ar";

  const categories = [
    { id: "All", ar: "الكل", en: "All" },
    { id: "Bags", ar: "الحقائب", en: "Bags" },
    { id: "Stationery", ar: "الأدوات المكتبية", en: "Stationery" },
    { id: "Uniforms", ar: "الزي المدرسي", en: "Uniforms" },
  ];

  // البحث والتصفية — نخلي المنتج يلقى طريقه للزبون 😄
  const filteredProducts = products.filter((product) => {
   const matchesSearch =
    (product.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.nameAr || "").includes(searchTerm);

    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="products-section" id="products">
      <div className="products-heading">
        <h2>
          {isArabic ? "منتجاتنا" : "Our Products"}
        </h2>

        <p>
          {isArabic
            ? "اكتشف منتجاتنا المدرسية والمكتبية"
            : "Explore our school and stationery products"}
        </p>
      </div>

      {/* البحث — المنتج ما ح يستخبى منك */}
      <div className="products-search">
        <input
          type="search"
          placeholder={
            isArabic ? "ابحث عن منتج..." : "Search for a product..."
          }
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {/* تصفية المنتجات حسب التصنيف */}
      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={
              selectedCategory === category.id ? "active" : ""
            }
            onClick={() => setSelectedCategory(category.id)}
          >
            {isArabic ? category.ar : category.en}
          </button>
        ))}
      </div>

      {/* عرض النتائج */}
      {filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              language={language}
              addToCart={addToCart}
            />
          ))}
        </div>
      ) : (
        <div className="no-products">
          <span>🔍</span>
          <p>
            {isArabic
              ? "عذراً، لم نجد أي منتج مطابق."
              : "Sorry, no matching products found."}
          </p>
        </div>
      )}
    </section>
  );
}

export default Products;
