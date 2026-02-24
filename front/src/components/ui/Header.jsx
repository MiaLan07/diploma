// src/components/Header.jsx
import React, { useEffect } from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';
import logoImg from '../../assets/logo.png'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [visibleSections, setVisibleSections] = useState({
    about: false,
    team: false,
    reviews: false,
    contacts: false,
  });

  const sections = [
    { id: 'about-company', key: 'about' },
    { id: 'team', key: 'team' },
    { id: 'reviews', key: 'reviews' },
    { id: 'contacts', key: 'contacts' },
  ];

  // Проверяем токен сразу и при любом изменении localStorage
  const getIsLoggedIn = () => !!localStorage.getItem('token');
  const [isLoggedIn, setIsLoggedIn] = useState(getIsLoggedIn());

  useEffect(() => {
    // Функция обновления
    const updateLoginStatus = () => {
      setIsLoggedIn(getIsLoggedIn());
    };

    // 1. Слушаем изменения в localStorage (работает между вкладками)
    window.addEventListener('storage', updateLoginStatus);

    // 2. Слушаем кастомное событие из AuthPage (для текущей вкладки)
    window.addEventListener('authChange', updateLoginStatus);

    // 3. Проверяем при монтировании
    updateLoginStatus();

    return () => {
      window.removeEventListener('storage', updateLoginStatus);
      window.removeEventListener('authChange', updateLoginStatus);
    };
  }, []);

  useEffect(() => {
    const handleSectionVisible = (e) => {
      const { section, inView } = e.detail;
      setVisibleSections(prev => ({ ...prev, [section]: inView }));
    };
    window.addEventListener('sectionVisible', handleSectionVisible);
    return () => window.removeEventListener('sectionVisible', handleSectionVisible);
  }, []);

  // Вычисляем активную секцию – первую в порядке массива, которая видна
  useEffect(() => {
    const order = ['about', 'team', 'reviews', 'contacts'];
    const active = order.find(key => visibleSections[key]) || null;
    setActiveSection(active);
  }, [visibleSections]);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      window.location.hash = sectionId;
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <header className="site-header">
      <div className="container header-container">
        {/* Логотип + название */}
        <Link to="/" className="logo-wrapper">
          <img src={logoImg} alt='logo Home Here' className='logo-icon'/>
          <span className="logo-text">ДОМ ЗДЕСЬ</span>
        </Link>

        {/* Навигация */}
        <nav className={`nav ${isMobileMenuOpen ? 'nav--active' : ''}`}>
          <ul className="nav__list">
            <li>
              <NavLink 
                to="/catalog" 
                className={({ isActive }) => isActive ? "nav__link nav__link--active" : "nav__link"}
              >
                КАТАЛОГ
              </NavLink>
            </li>
            <li>
              <a
                href="/#about-company"
                className={`nav__link ${activeSection === 'about' ? 'nav__link--active' : ''}`}
                onClick={(e) => scrollToSection(e, 'about-company')}
              >
                О КОМПАНИИ
              </a>
            </li>
            <li>
              <a 
                href="/#team" 
                className={`nav__link ${activeSection === 'team' ? 'nav__link--active' : ''}`}
                onClick={(e) => scrollToSection(e, 'team')}
              >
                КОМАНДА
              </a>
            </li>
            <li>
              <a 
                href="/#reviews" 
                className={`nav__link ${activeSection === 'reviews' ? 'nav__link--active' : ''}`}
                onClick={(e) => scrollToSection(e, 'reviews')}
              >
                ОТЗЫВЫ
              </a>
            </li>
            <li>
              <a 
                href="/#contacts" 
                className={`nav__link ${activeSection === 'contacts' ? 'nav__link--active' : ''}`}
                onClick={(e) => scrollToSection(e, 'contacts')}
              >
                КОНТАКТЫ
              </a>
            </li>
          </ul>

          {/* Правые кнопки */}
          <div className="header__actions">
            <NavLink 
              to="/map" 
              className={({ isActive }) => 
                isActive 
                  ? "btn--active btn-under" : "btn-under"
              }
            >
              КУПИТЬ НЕДВИЖИМОСТЬ
            </NavLink>
            
            {isLoggedIn ? (
              <NavLink 
                to="/cabinet" 
                className={({ isActive }) => isActive ? "btn--active btn-under" : "btn-under"}
              >
                ЛИЧНЫЙ КАБИНЕТ
              </NavLink>
            ) : (
              <NavLink 
                to="/auth" 
                className={({ isActive }) => isActive ? "btn--active btn-under" : "btn-under"}
              >
                ВОЙТИ
              </NavLink>
            )}
          </div>
        </nav>

        {/* Кнопка-гамбургер для мобильных */}
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