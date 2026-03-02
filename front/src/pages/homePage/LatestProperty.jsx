import React, { useState, useEffect} from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const LatestProperty = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestProperties = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/properties/latest`);
        setProperties(response.data.data || response.data || []);
      } catch (err) {
        console.error('Ошибка загрузки лучших предложений:', err);
        setError('Не удалось загрузить лучшие предложения');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProperties();
  }, []);

  // Вспомогательная функция для красивого форматирования цены
  const formatPrice = (price) => {
    return price.toLocaleString('ru-RU') + ' ₽';
  };

  // Вспомогательная функция для сокращения длинного текста
  const truncate = (text, maxLength = 120) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '…' : text;
  };

  if (loading) return <div className="best-today-loading">Загрузка лучших предложений...</div>;
  if (error) return <div className="best-today-error">{error}</div>;

  return (
    <section className="best-today-section">
      <h2 className="best-today-title">ЛУЧШИЕ СЕГОДНЯ</h2>

      <div className="best-today-grid">
        {properties.map((prop) => (
          <div key={prop.id} className="best-today-card">
            <div className="best-today-card-image-placeholder" />

            <div className="best-today-card-content">
              <h3 className="best-today-card-title">
                {prop.roomsCount 
                  ? `${prop.roomsCount}-комнатная ${prop.housingType?.name?.toLowerCase() || 'квартира'}`
                  : prop.title || 'Объект недвижимости'}
              </h3>

              <div className="best-today-card-params">
                <p>
                  {prop.floor && prop.totalFloors 
                    ? `${prop.floor}/${prop.totalFloors} этаж`
                    : prop.floor ? `${prop.floor} этаж` : ''}
                </p>
                <p>{prop.totalArea ? `${prop.totalArea} м²` : ''}</p>
                {prop.kitchenArea && <p>кухня {prop.kitchenArea} м²</p>}
                {prop.bathroom && <p>санузел {prop.bathroom}</p>}
              </div>

              <div className="best-today-card-description">
                {truncate(prop.shortDescription || prop.fullDescription || '')}
              </div>

              <div className="best-today-card-features">
                {prop.buildingType && <span>{prop.buildingType} дом</span>}
                {prop.yearBuilt && <span>{prop.yearBuilt} г.</span>}
                {prop.renovation && <span>ремонт {prop.renovation.toLowerCase()}</span>}
                {prop.hasElevator && <span>лифт</span>}
                {prop.parking && <span>парковка {prop.parking.toLowerCase()}</span>}
              </div>

              <div className="best-today-card-price">
                {formatPrice(prop.price)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="best-today-footer">
        <Link to="/catalog" className="best-today-full-catalog-link">
          ПОЛНЫЙ КАТАЛОГ
        </Link>
      </div>
    </section>
  );
};

export default LatestProperty