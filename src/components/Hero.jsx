import translations from '../data/translations'

function Hero({ language }) {
  const content = translations[language]

  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <span className="hero-label">
          {language === 'ar'
            ? 'مرحباً بكم في مكتبة المسيد'
            : 'Welcome to Al-Maseed Library'}
        </span>

        <h1>{content.heroTitle}</h1>

        <p>{content.heroDescription}</p>

        <div className="hero-buttons">
          <a href="#products" className="btn btn-primary">
            {content.shopNow}
          </a>

          <a href="#printing" className="btn btn-outline">
            {content.learnMore}
          </a>
        </div>
      </div>

      <div className="hero-image">
        <img
          src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900"
          alt="Stationery and school supplies"
        />
      </div>
    </section>
  )
}

export default Hero