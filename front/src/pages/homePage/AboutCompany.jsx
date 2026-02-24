// src/components/AboutCompany.jsx
import React, {useState, useEffect} from 'react';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import './AboutCompany.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AboutCompany = () => {
  const [bgImage, setBgImage] = useState('/fallback-hero.jpg'); // запасное изображение
  useEffect(() => {
      const loadBackground = async () => {
        try {
          const response = await axios.get(`${API_URL}/images/about.jpg`, {
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

  const { ref } = useInView({
    threshold: 0.5,
    onChange: (inView) => {
      window.dispatchEvent(new CustomEvent('sectionVisible', {
        detail: { section: 'about', inView }
      }));
    },
  });

  return (
    <section ref={ref} className="about-company" id='about-company'>
      <div className="container">
        <h2 className="section-title">О КОМПАНИИ</h2>

        <div className="intro-text">
          <p>
            Мы хотим сделать процесс покупки и продажи недвижимости простым, быстрым и безопасным<br />
            за счёт технологий и экспертизы <br/>
            Клиент получает результат, а не процесс
          </p>
        </div>

        <div className="content-grid">
          {/* Левая часть — статистика */}
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">8 лет</div>
              <div className="stat-label">на рынке. Доступ к&nbsp;закрытым базам, не&nbsp;размещённым в&nbsp;открытом доступе
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-value">12 пунктов проверки</div>
              <div className="stat-label">
                каждого объекта
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-value">98%</div>
              <div className="stat-label">
                клиентов рекомендуют сервис
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-value">5 юристов</div>
              <div className="stat-label">
                проверяют каждый договор
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-value">358 успешных сделок</div>
              <div className="stat-label">
                 за последние 5&nbsp;лет
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-value">200+</div>
              <div className="stat-label">
                объектов в&nbsp;базе
              </div>
            </div>
          </div>

          {/* Правая часть — изображение */}
          <div className="office-image-wrapper">
            <img
                src={bgImage}
                alt="Офис компании"
                className="office-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCompany;