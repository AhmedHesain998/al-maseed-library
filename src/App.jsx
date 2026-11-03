
import { useState, useEffect } from "react";

import Cart from "./components/Cart";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Products from "./components/Products";
import Checkout from "./components/Checkout";
import PrintingServices from "./components/PrintingServices";
import PrintOrder from "./components/PrintOrder";
import storeConfig from "./data/storeConfig";
import Footer from "./components/Footer";

import "./App.css";

function App() {
  const [language, setLanguage] = useState("ar");

  // 🛒 نسترجع المشتريات القديمة بدل ما نبدأ من الصفر!
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart:", error);
      return [];
    }
  });

  // 🔢 نحسب عدد القطع الموجودة في السلة
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // 💾 نحفظ السلة كلما حصل فيها تغيير
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ➕ إضافة منتج للسلة
  function addToCart(product) {
    setCart((previousCart) => {
      const existingProduct = previousCart.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        return previousCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previousCart, { ...product, quantity: 1 }];
    });
  }

  // ⬆️ زيادة الكمية
  function increaseQuantity(productId) {
    setCart((previousCart) =>
      previousCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  // ⬇️ تقليل الكمية
  function decreaseQuantity(productId) {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  // 🗑️ حذف منتج من السلة
  function removeFromCart(productId) {
    setCart((previousCart) =>
      previousCart.filter((item) => item.id !== productId)
    );
  }

  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} lang={language}>
      <Navbar
        language={language}
        setLanguage={setLanguage}
        cartCount={cartCount}
      />

      <main>
        <Hero language={language} />

        <Products
          language={language}
          addToCart={addToCart}
        />

        <Cart
          cart={cart}
          language={language}
          increaseQuantity={increaseQuantity}
          decreaseQuantity={decreaseQuantity}
          removeFromCart={removeFromCart}
        />

        <Checkout
          cart={cart}
          language={language}
        />

        <PrintingServices language={language} />
        <PrintOrder language={language} />

       
<section id="about" className="about-section">
  <div className="about-content">
    <h2>
      {language === "ar"
        ? `عن ${storeConfig.nameAr}`
        : `About ${storeConfig.name}`}
    </h2>

    <p>
      {language === "ar"
        ? storeConfig.descriptionAr
        : storeConfig.description}
    </p>
  </div>
</section>


       
{/* Contact Section */}
<section id="contact" className="contact-section">
  <div className="contact-content">
    <h2>
      {language === "ar" ? "تواصل معنا" : "Contact Us"}
    </h2>

    <p>
      {language === "ar"
        ? "يسعدنا استقبال استفساراتكم وطلباتكم."
        : "We are happy to receive your questions and orders."}
    </p>

    {storeConfig.phone && (
      <p>
        <strong>{language === "ar" ? "الهاتف:" : "Phone:"}</strong>
        <a href={`tel:${storeConfig.phone}`}>
          {storeConfig.phone}
        </a>
      </p>
    )}

   {/* WhatsApp Contact Link */}
{storeConfig.whatsapp && (
  <p>
    <strong>WhatsApp:</strong>
    <a
      href={`https://wa.me/${storeConfig.whatsapp}`}
      target="_blank"
      rel="noreferrer"
    >
      {language === "ar" ? "راسلنا عبر واتساب" : "Message Us"}
    </a>
  </p>
)}
    {(language === "ar" ? storeConfig.addressAr : storeConfig.address) && (
      <p>
        <strong>{language === "ar" ? "العنوان:" : "Address:"}</strong>
        {language === "ar" ? storeConfig.addressAr : storeConfig.address}
      </p>
    )}

    {storeConfig.email && (
      <p>
        <strong>Email:</strong>
        <a href={`mailto:${storeConfig.email}`}>
          {storeConfig.email}
        </a>
      </p>
    )}
    <Footer language={language} />
  </div>
</section>

      </main>
    </div>
  );
}



export default App;
