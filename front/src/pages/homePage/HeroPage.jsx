// src/pages/HeroPage.js (или HomePage.js)
import React from 'react';
import FilterBar from '../../components/common/FilterBar';
import './HeroPage.css'; // Отдельный CSS для Hero

const HeroPage = () => {
  return (
    <div className="hero-container">
      <header className="header">
        <div className="logo">ДОМ ЗАВЬСЬ</div>
        <nav className="nav">
          <ul>
            <li>Каталог</li>
            <li>О компании</li>
            <li>Команда</li>
            <li>Отзывы</li>
            <li>Контакты</li>
            <li>Купить недвижимость</li>
            <li>Личный кабинет</li>
          </ul>
        </nav>
      </header>
      <div className="hero-content">
        <h1>Подбор и продажа недвижимости в вашем городе</h1>
        <button className="hero-button">Посмотреть</button>
      </div>
      <FilterBar />
    </div>
  );
};

export default HeroPage;