import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Header.css';
import logo from '../../assets/logo.png'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="container header__container">
        <Link to="/" className="logo">
          <img src={logo} alt="Логотип" className='logo__icon'/>
          <span className="logo__text">ДОМ ЗДЕСЬ</span>
        </Link>

        <nav className={`nav ${isMobileMenuOpen ? 'nav--active' : ''}`}>
          <ul className="nav__list">
            <li><NavLink to="/catalog" className="nav__link">КАТАЛОГ</NavLink></li>
            <li><NavLink to="/about" className="nav__link">О КОМПАНИИ</NavLink></li>
            <li><NavLink to="/team" className="nav__link">КОМАНДА</NavLink></li>
            <li><NavLink to="/reviews" className="nav__link">ОТЗЫВЫ</NavLink></li>
            <li><NavLink to="/contacts" className="nav__link">КОНТАКТЫ</NavLink></li>
          </ul>

        </nav>

        <div className="header__actions">
            <NavLink to="/buy" className="nav__action-link">КУПИТЬ НЕДВИЖИМОСТЬ</NavLink>
            <NavLink to="/cabinet" className="nav__action-link">ЛИЧНЫЙ КАБИНЕТ</NavLink>
        </div>

        <button 
          className={`burger ${isMobileMenuOpen ? 'burger--active' : ''}`} 
          onClick={toggleMobileMenu}
          aria-label="Открыть меню"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;