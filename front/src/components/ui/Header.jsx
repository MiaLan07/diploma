// src/components/Header.jsx
import React, { useEffect } from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';
import logoImg from '../../assets/logo.png'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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