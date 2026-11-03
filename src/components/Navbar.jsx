import { useState } from 'react'

function Navbar({ language, setLanguage, cartCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const isArabic = language === 'ar'

  const links = [
    { label: isArabic ? 'الرئيسية' : 'Home', href: '#home' },
    { label: isArabic ? 'المنتجات' : 'Products', href: '#products' },
    { label: isArabic ? 'خدمات الطباعة' : 'Printing', href: '#printing' },
    { label: isArabic ? 'عن المكتبة' : 'About', href: '#about' },
    { label: isArabic ? 'تواصل معنا' : 'Contact', href: '#contact' },
  ]

  const toggleLanguage = () => {
    setLanguage(isArabic ? 'en' : 'ar')
    setMenuOpen(false)
  }

  return (
    <header className="navbar">
      <div className="navbar-container">

        <a href="#home" className="navbar-logo">
          <span className="logo-icon">✎</span>
          <span>
            {isArabic ? 'مكتبة المسيد' : 'Al-Maseed Library'}
          </span>
        </a>

        <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="navbar-actions">
          <button
  className="language-btn"
  onClick={toggleLanguage}
>
  {isArabic ? 'English' : 'العربية'}
</button>
      <a href="#cart" className="cart-btn">
    🛒
    <span>{cartCount}</span>
</a>

          

          <button
            className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

      </div>
    </header>
  )
}

export default Navbar