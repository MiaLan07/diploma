// src/pages/HeroPage.js (или HomePage.js)
import React from 'react';
import { useEffect, useState } from 'react';
import FilterBar from '../../components/common/FilterBar';
import './HeroPage.css'; // Отдельный CSS для Hero
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const HeroPage = () => {
  const [bgImage, setBgImage] = useState('/fallback-hero.jpg'); // запасное изображение
  useEffect(() => {
    const loadBackground = async () => {
      try {
        const response = await axios.get(`${API_URL}/images/mainPage.jpg`, {
          responseType: 'blob',
        });
        const imageUrl = URL.createObjectURL(response.data);
        setBgImage(imageUrl);
      } catch (error) {
        console.error('Не удалось загрузить фоновое изображение:', error);
        // можно оставить fallback или попробовать другой файл
      }
    };
    loadBackground();
    // Очистка (чтобы не было memory leak при смене компонента)
    return () => {
      if (bgImage.startsWith('blob:')) {
        URL.revokeObjectURL(bgImage);
      }
    };
  }, []);
  
  return (
    <div className="hero-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="hero-content">
        <h1>Подбор и продажа&nbsp;<span className='accent'>недвижимости</span> в&nbsp;вашем городе</h1>
        <button className="hero-button">Посмотреть</button>
      </div>
      <FilterBar />
    </div>
  );
};

export default HeroPage;