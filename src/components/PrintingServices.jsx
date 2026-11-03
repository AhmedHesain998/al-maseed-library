
const services = [
  {
    id: 1,
    icon: "📄",
    name: "تصوير مستندات",
    nameEn: "Document Photocopying",
    description: "تصوير المستندات والأوراق بسرعة وجودة.",
    descriptionEn: "Fast and clear document photocopying.",
  },
  {
    id: 2,
    icon: "🖨️",
    name: "طباعة أبيض وأسود",
    nameEn: "Black & White Printing",
    description: "طباعة المحاضرات والملفات والمستندات.",
    descriptionEn: "Print lectures, files and documents.",
  },
  {
    id: 3,
    icon: "🎨",
    name: "طباعة ملونة",
    nameEn: "Color Printing",
    description: "طباعة الصور والمستندات الملونة.",
    descriptionEn: "High-quality color printing.",
  },
  {
    id: 4,
    icon: "📚",
    name: "طباعة وتجليد البحوث",
    nameEn: "Research Printing & Binding",
    description: "طباعة وتجهيز البحوث والملازم الدراسية.",
    descriptionEn: "Printing and binding research and study notes.",
  },
];

function PrintingServices({ language }) {
  const whatsappNumber = "249928658885";

  function orderService(service) {
    const message =
      language === "ar"
        ? `السلام عليكم، أرغب في طلب خدمة ${service.name}`
        : `Hello, I would like to request ${service.nameEn}`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  }

  return (
    <section className="printing-section" id="printing">
      <div className="printing-container">
        <div className="printing-heading">
          <span>
            {language === "ar" ? "خدماتنا" : "What We Offer"}
          </span>

          <h2>
            {language === "ar"
              ? "خدمات الطباعة والتصوير"
              : "Printing & Photocopying"}
          </h2>

          <p>
            {language === "ar"
              ? "كل خدماتك المكتبية في مكان واحد."
              : "All your printing needs in one place."}
          </p>
        </div>

        <div className="printing-grid">
          {services.map((service) => (
            <div className="printing-card" key={service.id}>
              <div className="printing-icon">{service.icon}</div>

              <h3>
                {language === "ar" ? service.name : service.nameEn}
              </h3>

              <p>
                {language === "ar"
                  ? service.description
                  : service.descriptionEn}
              </p>

              <button onClick={() => orderService(service)}>
                {language === "ar" ? "اطلب الخدمة" : "Order Service"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PrintingServices;
