// src/components/PropertyDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ReactComponent as IconHartLoved } from '../../assets/heart1.svg';
import './PropertyDetails.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PropertyDetails = () => {
  const { slug } = useParams(); // теперь используем slug вместо id
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/properties/${slug}`);
        setProperty(res.data.data);

        // Проверка избранного (если будет эндпоинт)
        // const favRes = await axios.get(`${API_URL}/api/favorites/check/${slug}`, { ... });
      } catch (err) {
        setError('Не удалось загрузить объявление');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [slug]);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`${API_URL}/api/favorites/${slug}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/api/favorites/${slug}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Ошибка избранного:', err);
    }
  };

  const handleBuyClick = () => {
    alert('Заявка на просмотр / покупку отправлена (заглушка)');
    // navigate('/requests/new', { state: { propertyId: id } });
  };

  if (loading) return <div className="property-details-page loading">Загрузка...</div>;
  if (error)   return <div className="property-details-page error">{error}</div>;
  if (!property) return <div className="property-details-page not-found">Объект не найден</div>;

  const mainImage = property.images?.find(img => img.isMain) || property.images?.[0];
  const otherImages = property.images?.filter(img => !img.isMain) || [];

  return (
    <div className="property-details-page">

      {/* Герой-секция: заголовок, цена, сердце */}
      <section className="property-details-page .hero-section">
        <h1 className="property-details-page .hero-section .property-title">
          {property.title || property.shortDescription || 'Объект недвижимости'}
        </h1>

        <div className="property-details-page .hero-section .price-and-favorite">
          <div className="property-details-page .hero-section .price-and-favorite .big-price">
            {Number(property.price).toLocaleString('ru-RU')} ₽
          </div>
          <button
            className={`property-details-page .hero-section .price-and-favorite .favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
            title={isFavorite ? 'В избранном' : 'Добавить в избранное'}
          >
            <IconHartLoved />
          </button>
        </div>

        <div className="property-details-page .hero-section .address-line">
          {property.address || 'Адрес не указан'}, Симферополь
        </div>
      </section>

      {/* Галерея */}
      <section className="property-details-page .gallery-section">
        {property.images?.length > 0 ? (
          <div className="property-details-page .gallery-section .collage-wrapper">
            {mainImage && (
              <div className="property-details-page .gallery-section .collage-wrapper .main-photo">
                <img
                  src={`${API_URL}${mainImage.url}`}
                  alt="Главное фото"
                  onError={e => { e.target.src = '/images/fallback-property-large.jpg'; }}
                />
              </div>
            )}

            <div className="property-details-page .gallery-section .collage-wrapper .right-column">
              {otherImages.slice(0, 2).map(img => (
                <div key={img.id} className="property-details-page .gallery-section .collage-wrapper .right-column .small-photo">
                  <img
                    src={`${API_URL}${img.url}`}
                    alt="Дополнительное фото"
                    onError={e => { e.target.src = '/images/fallback-property.jpg'; }}
                  />
                </div>
              ))}
            </div>

            <div className="property-details-page .gallery-section .collage-wrapper .bottom-row">
              {otherImages.slice(2, 5).map(img => (
                <div key={img.id} className="property-details-page .gallery-section .collage-wrapper .bottom-row .small-photo">
                  <img
                    src={`${API_URL}${img.url}`}
                    alt="Дополнительное фото"
                    onError={e => { e.target.src = '/images/fallback-property.jpg'; }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="property-details-page .gallery-section .no-images">
            Фотографии отсутствуют
          </div>
        )}
      </section>

      {/* Ключевые параметры */}
      <section className="property-details-page .key-params-section">
        <div className="property-details-page .key-params-section .params-grid">
          <div className="property-details-page .key-params-section .params-grid .param-item">
            <strong>{property.totalArea || property.area || '—'} м²</strong>
            <span>общая площадь</span>
          </div>
          <div className="property-details-page .key-params-section .params-grid .param-item">
            <strong>{property.livingArea || '—'} м²</strong>
            <span>жилая</span>
          </div>
          <div className="property-details-page .key-params-section .params-grid .param-item">
            <strong>{property.kitchenArea || '—'} м²</strong>
            <span>кухня</span>
          </div>
          <div className="property-details-page .key-params-section .params-grid .param-item">
            <strong>{property.roomsCuant || '—'}</strong>
            <span>комнат</span>
          </div>
          <div className="property-details-page .key-params-section .params-grid .param-item">
            <strong>{property.floor || '?'} / {property.totalFloors || '?'}</strong>
            <span>этаж</span>
          </div>
          <div className="property-details-page .key-params-section .params-grid .param-item">
            <strong>{property.yearBuilt || '—'} г.</strong>
            <span>год постройки</span>
          </div>
        </div>
      </section>

      {/* Подробное описание */}
      <section className="property-details-page .details-section">
        <h2 className="property-details-page .details-section .section-title">Подробно об объекте</h2>

        <div className="property-details-page .details-section .features-grid">
          <div>Состояние: <strong>{property.condition || '—'}</strong></div>
          <div>Отделка: <strong>{property.renovation || '—'}</strong></div>
          <div>Год ремонта: <strong>{property.renovationYear || '—'}</strong></div>
          <div>Тип дома: <strong>{property.buildingType || '—'}</strong></div>
          <div>Санузел: <strong>{property.bathroom || '—'}</strong></div>
          <div>Балкон/лоджия: <strong>{property.balcony || 'нет'}</strong></div>
          <div>Окна: <strong>{property.windows || '—'}</strong></div>
          <div>Вид из окна: <strong>{property.view || '—'}</strong></div>
          <div>Лифт: <strong>{property.hasElevator ? 'есть' : 'нет'}</strong></div>
        </div>

        {property.fullDescription && (
          <div className="property-details-page .details-section .full-description">
            <h3>Описание</h3>
            <p>{property.fullDescription}</p>
          </div>
        )}

        <ul className="property-details-page .details-section .flags-list">
          <li>Готово к заселению: <strong>{property.readyToMove ? 'да' : 'нет'}</strong></li>
          <li>Торг: <strong>{property.bargaining ? 'уместен' : 'не уместен'}</strong></li>
          <li>Ипотека: <strong>{property.mortgagePossible ? 'возможна' : 'нет'}</strong></li>
          <li>Материнский капитал: <strong>{property.maternalCapital ? 'принимается' : 'нет'}</strong></li>
          <li>Обременения: <strong>{property.encumbrance ? 'есть' : 'нет'}</strong></li>
        </ul>
      </section>

      {/* Дополнительные описания (если заполнены) */}
      {(property.buildingDescription || property.yearBuiltDescription || property.environment ||
        property.infrastructure || property.transportAccessibility || property.communications ||
        property.legalPurity || property.mortgageDescription || property.livingDescription) && (
        <section className="property-details-page .extra-descriptions-section">
          <h2 className="property-details-page .extra-descriptions-section .section-title">Дополнительно</h2>

          {property.buildingDescription && (
            <div className="property-details-page .extra-descriptions-section .description-block">
              <h4>О доме / здании</h4>
              <p>{property.buildingDescription}</p>
            </div>
          )}

          {property.yearBuiltDescription && (
            <div className="property-details-page .extra-descriptions-section .description-block">
              <h4>О годе постройки</h4>
              <p>{property.yearBuiltDescription}</p>
            </div>
          )}

          {property.environment && (
            <div className="property-details-page .extra-descriptions-section .description-block">
              <h4>Окружение</h4>
              <p>{property.environment}</p>
            </div>
          )}

          {property.infrastructure && (
            <div className="property-details-page .extra-descriptions-section .description-block">
              <h4>Инфраструктура</h4>
              <p>{property.infrastructure}</p>
            </div>
          )}

          {property.transportAccessibility && (
            <div className="property-details-page .extra-descriptions-section .description-block">
              <h4>Транспорт</h4>
              <p>{property.transportAccessibility}</p>
            </div>
          )}

          {property.communications && (
            <div className="property-details-page .extra-descriptions-section .description-block">
              <h4>Коммуникации</h4>
              <p>{property.communications}</p>
            </div>
          )}

          {property.legalPurity && (
            <div className="property-details-page .extra-descriptions-section .description-block">
              <h4>Юридическая чистота</h4>
              <p>{property.legalPurity}</p>
            </div>
          )}

          {property.mortgageDescription && (
            <div className="property-details-page .extra-descriptions-section .description-block">
              <h4>Ипотека</h4>
              <p>{property.mortgageDescription}</p>
            </div>
          )}

          {property.livingDescription && (
            <div className="property-details-page .extra-descriptions-section .description-block">
              <h4>Особенности проживания</h4>
              <p>{property.livingDescription}</p>
            </div>
          )}
        </section>
      )}

      {/* Карта */}
      <section className="property-details-page .map-section">
        <h2 className="property-details-page .map-section .section-title">Расположение</h2>
        <div className="property-details-page .map-section .map-container">
          {property.latitude && property.longitude ? (
            <div className="property-details-page .map-section .map-container .map-placeholder">
              {/* Здесь будет <YandexMap lat={property.latitude} lng={property.longitude} /> */}
              Координаты: {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
            </div>
          ) : (
            <p>Координаты не определены</p>
          )}
        </div>
      </section>

      {/* Кнопка действия */}
      <div className="property-details-page .action-bar">
        <button
          className="property-details-page .action-bar .big-action-button"
          onClick={handleBuyClick}
        >
          Оставить заявку
        </button>
      </div>
    </div>
  );
};

export default PropertyDetails;