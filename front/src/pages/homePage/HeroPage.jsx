// src/pages/HeroPage.js (или HomePage.js)
import React from 'react';
import FilterBar from '../../components/common/FilterBar';
import './HeroPage.css'; // Отдельный CSS для Hero

const HeroPage = () => {
  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1>Подбор и продажа <span className='accent'>недвижимости</span> в&nbsp;вашем городе</h1>
        <button className="hero-button">Посмотреть</button>
      </div>
      <FilterBar />
    </div>
  );
};

export default HeroPage;