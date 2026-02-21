// src/components/PropertyDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ReactComponent as IconHartLoved } from '../../assets/heart1.svg';
import './PropertyDetails.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/properties/${id}`);
        setProperty(res.data.data);

        // Проверка избранного (раскомментируй, когда будет готов эндпоинт)
        // const favRes = await axios.get(`${API_URL}/api/favorites/check/${id}`, {
        //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        // });
        // setIsFavorite(favRes.data.isFavorite);
      } catch (err) {
        setError('Не удалось загрузить объявление');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`${API_URL}/api/favorites/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/api/favorites/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Ошибка избранного:', err);
    }
  };

  const handleBuyClick = () => {
    // Здесь можно открыть модалку заявки или перейти на страницу создания заявки
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

      {/* Верхний блок — заголовок, цена, сердце */}
      <div className="property-details-page .hero-section">
        <h1 className="property-details-page .hero-section .property-title">
          {property.shortDescription || `${property.rooms || '?'}–комнатная квартира`}
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
      </div>

      {/* Галерея — коллаж из 4–5 фото */}
      <div className="property-details-page .gallery-collage-wrapper">
        {property.images?.length > 0 ? (
          <>
            {/* Главное фото слева */}
            {mainImage && (
              <div className="property-details-page .gallery-collage-wrapper .main-photo">
                <img
                  src={`${API_URL}${mainImage.url}`}
                  alt="Главное фото квартиры"
                  onError={e => { e.target.src = '/images/fallback-property-large.jpg'; }}
                />
              </div>
            )}

            {/* Правая колонка — 2 фото */}
            <div className="property-details-page .gallery-collage-wrapper .right-column">
              {otherImages.slice(0, 2).map((img, idx) => (
                <div key={img.id} className="property-details-page .gallery-collage-wrapper .right-column .small-photo">
                  <img
                    src={`${API_URL}${img.url}`}
                    alt={`Фото ${idx + 2}`}
                    onError={e => { e.target.src = '/images/fallback-property.jpg'; }}
                  />
                </div>
              ))}
            </div>

            {/* Нижняя строка — ещё 2 фото */}
            <div className="property-details-page .gallery-collage-wrapper .bottom-row">
              {otherImages.slice(2, 4).map((img, idx) => (
                <div key={img.id} className="property-details-page .gallery-collage-wrapper .bottom-row .small-photo">
                  <img
                    src={`${API_URL}${img.url}`}
                    alt={`Фото ${idx + 4}`}
                    onError={e => { e.target.src = '/images/fallback-property.jpg'; }}
                  />
                </div>
              ))}
              {/* Если фото меньше — заполняем заглушкой */}
              {otherImages.length < 4 && Array.from({ length: 4 - otherImages.length }).map((_, i) => (
                <div key={`placeholder-${i}`} className="property-details-page .gallery-collage-wrapper .bottom-row .small-photo">
                  <img src="/images/fallback-property.jpg" alt="Нет фото" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="property-details-page .gallery-collage-wrapper .no-images">
            Фотографии отсутствуют
          </div>
        )}
      </div>

      {/* Ключевые параметры одной строкой */}
      <div className="property-details-page .key-params-bar">
        <div className="property-details-page .key-params-bar .param">
          <strong>{property.area || '?'} м²</strong>
          <span>общая</span>
        </div>
        <div className="property-details-page .key-params-bar .param">
          <strong>{property.rooms || '?'}–комн.</strong>
          <span></span>
        </div>
        <div className="property-details-page .key-params-bar .param">
          <strong>{property.floor || '?'}/{property.totalFloors || '?'}</strong>
          <span>этаж</span>
        </div>
        <div className="property-details-page .key-params-bar .param">
          <strong>{property.yearBuilt || '—'} г.</strong>
          <span>сдача</span>
        </div>
      </div>

      {/* Подробное описание */}
      <div className="property-details-page .detailed-info-section">
        <h2 className="property-details-page .detailed-info-section .section-title">Подробно об объекте</h2>

        <div className="property-details-page .detailed-info-section .features-grid">
          <div>Площадь кухни: <strong>{property.kitchenArea || '—'} м²</strong></div>
          <div>Санузел: <strong>{property.bathroom || '—'}</strong></div>
          <div>Балкон/лоджия: <strong>{property.balcony || 'нет'}</strong></div>
          <div>Ремонт: <strong>{property.renovation || property.condition || '—'}</strong></div>
          <div>Окна: <strong>{property.windows || '—'}</strong></div>
          <div>Вид: <strong>{property.view || '—'}</strong></div>
        </div>

        {property.fullDescription && (
          <div className="property-details-page .detailed-info-section .full-description">
            <h3>Описание</h3>
            <p>{property.fullDescription}</p>
          </div>
        )}

        <ul className="property-details-page .detailed-info-section .extra-features-list">
          <li>Можно заехать сразу: <strong>{property.readyToMove ? 'да' : 'нет'}</strong></li>
          <li>Торг уместен: <strong>{property.bargaining ? 'да' : 'нет'}</strong></li>
          <li>Ипотека: <strong>{property.mortgagePossible ? 'принимается' : 'не принимается'}</strong></li>
          {property.encumbrance && <li>Обременения: <strong>есть</strong></li>}
        </ul>
      </div>

      {/* Место для карты (Yandex Maps, Leaflet и т.д.) */}
      <div className="property-details-page .map-section">
        <h2 className="property-details-page .map-section .section-title">Расположение</h2>
        <div className="property-details-page .map-section .map-placeholder">
          {/* Здесь будет <YandexMap ... lat={property.latitude} lng={property.longitude} /> */}
          <div className="placeholder-text">
            Карта (широта: {property.latitude?.toFixed(5) || '—'}, долгота: {property.longitude?.toFixed(5) || '—'})
          </div>
        </div>
      </div>

      {/* Большая кнопка */}
      <div className="property-details-page .action-bar">
        <button
          className="property-details-page .action-bar .big-buy-button"
          onClick={handleBuyClick}
        >
          КУПИТЬ КВАРТИРУ
        </button>
      </div>
    </div>
  );
};

export default PropertyDetails;