// src/components/Header.jsx
import React, { useEffect } from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';
import logoImg from '../../assets/logo.png'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(!!localStorage.getItem('token'));

 const checkAuth = () => {
    setIsLogin(!!localStorage.getItem('token'));
  };

  useEffect(() => {
    // Проверка сразу при монтировании
    checkAuth();
    // Слушаем изменения в localStorage (из других вкладок или после логина/логаута)
    window.addEventListener('storage', checkAuth);

    // Также полезно слушать изменения в текущей вкладке
    // (если логин происходит без перезагрузки страницы)
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [])

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
              <NavLink 
                to="/about" 
                className={({ isActive }) => isActive ? "nav__link nav__link--active" : "nav__link"}
              >
                О КОМПАНИИ
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/team" 
                className={({ isActive }) => isActive ? "nav__link nav__link--active" : "nav__link"}
              >
                КОМАНДА
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/reviews" 
                className={({ isActive }) => isActive ? "nav__link nav__link--active" : "nav__link"}
              >
                ОТЗЫВЫ
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/contacts" 
                className={({ isActive }) => isActive ? "nav__link nav__link--active" : "nav__link"}
              >
                КОНТАКТЫ
              </NavLink>
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
            
            { isLogin ? 
            (<NavLink to="/cabinet" className={({ isActive }) => isActive ? "btn--active btn-under" : "btn-under" }>
              ЛИЧНЫЙ КАБИНЕТ
            </NavLink>) : 
            (<NavLink to="/auth" className={({ isActive }) => isActive ? "btn--active btn-under" : "btn-under"}>
              ВОЙТИ
            </NavLink>) }
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