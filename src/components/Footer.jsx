
import storeConfig from "../data/storeConfig";

function Footer({ language }) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <h3>
                        {language === "ar"
                            ? storeConfig.nameAr
                            : storeConfig.name}
                    </h3>

                    <p>
                        {language === "ar"
                            ? storeConfig.descriptionAr
                            : storeConfig.description}
                    </p>
                </div>

                <div className="footer-links">
                    <h4>{language === "ar" ? "روابط سريعة" : "Quick Links"}</h4>

                    <a href="#home">{language === "ar" ? "الرئيسية" : "Home"}</a>
                    <a href="#products">{language === "ar" ? "المنتجات" : "Products"}</a>
                    <a href="#printing">{language === "ar" ? "خدمات الطباعة" : "Printing Services"}</a>
                    <a href="#contact">{language === "ar" ? "تواصل معنا" : "Contact Us"}</a>
                </div>
            </div>

            <div className="footer-bottom">
                <p>
                    © {currentYear} {language === "ar" ? storeConfig.nameAr : storeConfig.name}.
                    {language === "ar" ? " جميع الحقوق محفوظة." : " All rights reserved."}
                </p>
            </div>
        </footer>
    );
}

export default Footer;
