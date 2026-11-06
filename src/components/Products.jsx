import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ProductCard from "./ProductCard";

function Products({ language, addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const isArabic = language === "ar";

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching products:", error);
        setError(isArabic ? "تعذر تحميل المنتجات." : "Failed to load products.");
      } else {
        const formattedProducts = data.map((product) => ({
          ...product,
          nameAr: product.name_ar,
        }));

        setProducts(formattedProducts);
      }

      setLoading(false);
    }

    fetchProducts();
  }, [isArabic]);

  const categories = [
    { id: "All", ar: "الكل", en: "All" },
    { id: "Bags", ar: "الحقائب", en: "Bags" },
    { id: "Stationery", ar: "الأدوات المكتبية", en: "Stationery" },
    { id: "Uniforms", ar: "الزي المدرسي", en: "Uniforms" },
  ];

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
        <h2>{isArabic ? "منتجاتنا" : "Our Products"}</h2>

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

      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={selectedCategory === category.id ? "active" : ""}
            onClick={() => setSelectedCategory(category.id)}
          >
            {isArabic ? category.ar : category.en}
          </button>
        ))}
      </div>

      {loading ? (
        <p>{isArabic ? "جاري تحميل المنتجات..." : "Loading products..."}</p>
      ) : error ? (
        <p>{error}</p>
      ) : filteredProducts.length > 0 ? (
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