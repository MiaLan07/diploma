// src/components/PropertyDetails.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ReactComponent as IconHart } from '../../assets/heart1.svg';
import { ReactComponent as IconHartLoved } from '../../assets/heart-loved.svg';
import { ReactComponent as MessageIcon } from '../../assets/message2.svg'
import './PropertyDetails.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PropertyDetails = () => {
  const { slug } = useParams(); // теперь используем slug вместо id
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const [loadedImages, setLoadedImages] = useState([]); // массив blob URL для каждого изображения
  const blobUrlsRef = useRef([]);
  const [imageOrder, setImageOrder] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/properties/${slug}`);
        const propertyData = res.data.data;
        setProperty(propertyData);

        const token = localStorage.getItem('token');
        if (token && propertyData?.id) {
          try {
            const favRes = await axios.get(`${API_URL}/api/favorites/check/${propertyData.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setIsFavorite(favRes.data.isFavorite); // предполагаем, что ответ { isFavorite: boolean }
          } catch (err) {
            console.error('Ошибка проверки избранного:', err);
          }
        }

        // Загружаем изображения как blob
        if (propertyData.images?.length > 0) {
          const loadPromises = propertyData.images.map(async (img) => {
            try {
              const response = await axios.get(`${API_URL}${img.url}`, { responseType: 'blob' });
              const blobUrl = URL.createObjectURL(response.data);
              blobUrlsRef.current.push(blobUrl);
              return blobUrl;
            } catch (err) {
              console.warn(`Ошибка загрузки ${img.url}`, err);
              return '/fallback-property.jpg';
            }
          });

          const urls = await Promise.all(loadPromises);
          setLoadedImages(urls);

          // ─── Инициализация порядка изображений ────────────────────────────────
          let order = Array.from({ length: urls.length }, (_, i) => i);

          // Если есть isMain → ставим его первым
          const mainIdx = propertyData.images.findIndex(img => img.isMain);
          if (mainIdx >= 0) {
            order = [mainIdx, ...order.filter(i => i !== mainIdx)];
          }

          setImageOrder(order);
        }
      } catch (err) {
        setError('Не удалось загрузить объявление');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();

    return () => {
      blobUrlsRef.current.forEach(url => {
        if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      blobUrlsRef.current = [];
    };
  }, [slug]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeFullscreen();
      }
    };

    if (isFullscreen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isFullscreen]);
  const toggleFavorite = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`${API_URL}/api/favorites/${property.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/api/favorites/${property.id}`, {}, {
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

  const handleThumbnailClick = (clickedThumbnailPosition) => {
    setImageOrder(currentOrder => {
      // защита
      if (currentOrder.length < 2) return currentOrder;

      const newOrder = [...currentOrder];

      const currentMain = newOrder[0];

      // позиция кликнутой миниатюры в полном массиве = 1 + clickedThumbnailPosition
      const clickedPosInFullArray = 1 + clickedThumbnailPosition;

      // проверяем, что позиция валидна
      if (clickedPosInFullArray >= newOrder.length) {
        console.warn("Позиция вышла за пределы массива", clickedThumbnailPosition);
        return currentOrder;
      }

      const clickedImageIndex = newOrder[clickedPosInFullArray];

      // если кликнули по тому же изображению, что уже главное — ничего не делаем
      if (clickedImageIndex === currentMain) {
        console.log("Клик по уже выбранному главному — игнорируем");
        return currentOrder;
      }

      console.log(
        `Меняем местами: главное ${currentMain} (индекс 0) ↔ ` +
        `миниатюра с индексом ${clickedImageIndex} (позиция ${clickedThumbnailPosition})`
      );

      // swap
      newOrder[0] = clickedImageIndex;
      newOrder[clickedPosInFullArray] = currentMain;

      console.log("Старый порядок:", currentOrder);
      console.log("Новый порядок:", newOrder);

      return newOrder;
    });
  };

  if (loading) return <div className="property-details-page loading">Загрузка...</div>;
  if (error)   return <div className="property-details-page error">{error}</div>;
  if (!property) return <div className="property-details-page not-found">Объект не найден</div>;

  const openFullscreen = () => {
    setFullscreenIndex(imageOrder[0]); // текущее главное изображение
    setIsFullscreen(true);
    document.body.style.overflow = 'hidden'; // блокируем скролл страницы
  };
  // Закрыть полноэкранный режим
  const closeFullscreen = () => {
    setIsFullscreen(false);
    document.body.style.overflow = ''; // возвращаем скролл
  };

  // Переключение на предыдущее/следующее изображение
  const prevImage = () => {
    setFullscreenIndex(prev => 
      (prev - 1 + imageOrder.length) % imageOrder.length
    );
  };
  const nextImage = () => {
    setFullscreenIndex(prev => 
      (prev + 1) % imageOrder.length
    );
  };
  const formatRooms = (count) => {
    if (!count && count !== 0) return '—';

    const num = Number(count);

    if (num === 0) return 'студия';
    if (num === 1) return '1-комнатная';
    if (num === 2) return '2-комнатная';
    if (num === 3) return '3-комнатная';

    return `${num}-комнатная`;
  };

  return (
    <div className="property-details-page" id='main'>

      {/* Герой-секция: заголовок, цена, сердце */}
      <section className="property-details-page hero-section">
        <h1 className="property-details-page hero-section property-title">
          {property.title || property.shortDescription || 'Объект недвижимости'}
        </h1>
        <div className="property-details-page hero-section price-and-favorite big-price">
          {Number(property.price).toLocaleString('ru-RU')}
        </div>
        <button
          className={`property-details-page hero-section price-and-favorite favorite-btn`}
          onClick={toggleFavorite}
          title={isFavorite ? 'В избранном' : 'Добавить в избранное'}
        >
          {!isFavorite ? <IconHart /> : <IconHartLoved />}
        </button>
      </section>

      {/* Галерея */}
      <section className="property-details-page gallery-section">
        {loadedImages.length > 0 && imageOrder.length === loadedImages.length ? (
          <div className="property-details-page gallery-section collage-wrapper">
            {/* Главное фото */}
            <div 
              className="property-details-page gallery-section main-photo"
              onClick={openFullscreen}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={loadedImages[imageOrder[0]] || '/fallback-property-large.jpg'}
                alt="Главное фото"
                onError={e => { e.target.src = '/fallback-property-large.jpg'; }}
              />
            </div>

            {/* Маленькие фото */}
            <div
              className="property-details-page gallery-section others-photo"
              id={
                (loadedImages.length - 1) < 5 ? 'grid-2' :
                (loadedImages.length - 1) < 10 ? 'grid-3' :
                (loadedImages.length - 1) < 13 ? 'grid-3-4' :
                (loadedImages.length - 1) < 17 ? 'grid-4' :
                'grid-5'
              }
            >
              {imageOrder.slice(1).map((globalIndex, position) => {
                console.log(`Миниатюра ${position}: globalIndex = ${globalIndex}, src = ${loadedImages[globalIndex]}`);
                return (
                <div
                  key={`thumb-${globalIndex}-${position}-${imageOrder.join('-')}`}
                  className="property-details-page gallery-section other-img"
                  onClick={() => {
                    console.log(`Клик по позиции ${position}, globalIndex = ${globalIndex}`);
                    handleThumbnailClick(position);
                  }}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={loadedImages[globalIndex] || '/fallback-property.jpg'}
                    alt={`Дополнительное фото ${position + 1}`}
                    loading="lazy"
                    onError={e => { e.target.src = '/fallback-property.jpg'; }}
                  />
                </div>
              )})}
            </div>
          </div>
        ) : (
          <div className="property-details-page gallery-section no-images">
            Фотографии отсутствуют
          </div>
        )}
      </section>

      {/* Ключевые параметры */}
      <section className="property-details-page key-params-section">
        <div className="property-details-page key-params-section params-grid">
          <div className="property-details-page key-params-section param-item">
            <p>{property.totalArea || property.area || '—'} м²</p>
          </div>
          <div className="property-details-page key-params-section param-item">
            <p>{property.floor || '?'}/{property.totalFloors || '?'} этаж</p>
          </div>
          <div className="property-details-page key-params-section param-item">
            <p>{formatRooms(property.roomsCount)}</p>
          </div>
          <div className="property-details-page key-params-section param-item">
            <button type="submit" className="submit-btn">
              <p>
                купить квартиру
              </p>
              <div className='icon-btn'>
                <MessageIcon width={35} height={35} />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Короткая информация об объекте */}
      <section className='property-details-page short-details-section'>
        <div className='property-details-page short-details-section description-item'>
          <p>{property.shortDescription}</p>
        </div>
        <div className='property-details-page short-details-section description-item'>
          <p className='bolder'>Актуальность объекта и другая информация</p>
          <ul className="property-details-page short-details-section flags-list">
            <li>Готово к заселению: <strong>{property.readyToMove ? 'да' : 'нет'}</strong></li>
            <li>Торг: <strong>{property.bargaining ? 'уместен' : 'не уместен'}</strong></li>
            <li>Ипотека: <strong>{property.mortgagePossible ? 'возможна' : 'нет'}</strong></li>
            <li>Материнский капитал: <strong>{property.maternalCapital ? 'принимается' : 'нет'}</strong></li>
            <li>Обременения: <strong>{property.encumbrance ? 'есть' : 'нет'}</strong></li>
          </ul>
        </div>
      </section>
      {/* Подробное описание */}
      <section className="property-details-page details-section">
        <h2 className="property-details-page details-section section-title">Подробно об объекте</h2>

        <div className="property-details-page details-section features-grid">
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
          <div className="property-details-page details-section full-description">
            <h3>Описание</h3>
            <p>{property.fullDescription}</p>
          </div>
        )}

        <ul className="property-details-page details-section flags-list">
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
        <section className="property-details-page extra-descriptions-section">
          <h2 className="property-details-page extra-descriptions-section section-title">Дополнительно</h2>

          {property.buildingDescription && (
            <div className="property-details-page extra-descriptions-section description-block">
              <h4>О доме / здании</h4>
              <p>{property.buildingDescription}</p>
            </div>
          )}

          {property.yearBuiltDescription && (
            <div className="property-details-page extra-descriptions-section description-block">
              <h4>О годе постройки</h4>
              <p>{property.yearBuiltDescription}</p>
            </div>
          )}

          {property.environment && (
            <div className="property-details-page extra-descriptions-section description-block">
              <h4>Окружение</h4>
              <p>{property.environment}</p>
            </div>
          )}

          {property.infrastructure && (
            <div className="property-details-page extra-descriptions-section description-block">
              <h4>Инфраструктура</h4>
              <p>{property.infrastructure}</p>
            </div>
          )}

          {property.transportAccessibility && (
            <div className="property-details-page extra-descriptions-section description-block">
              <h4>Транспорт</h4>
              <p>{property.transportAccessibility}</p>
            </div>
          )}

          {property.communications && (
            <div className="property-details-page extra-descriptions-section description-block">
              <h4>Коммуникации</h4>
              <p>{property.communications}</p>
            </div>
          )}

          {property.legalPurity && (
            <div className="property-details-page extra-descriptions-section description-block">
              <h4>Юридическая чистота</h4>
              <p>{property.legalPurity}</p>
            </div>
          )}

          {property.mortgageDescription && (
            <div className="property-details-page extra-descriptions-section description-block">
              <h4>Ипотека</h4>
              <p>{property.mortgageDescription}</p>
            </div>
          )}

          {property.livingDescription && (
            <div className="property-details-page extra-descriptions-section description-block">
              <h4>Особенности проживания</h4>
              <p>{property.livingDescription}</p>
            </div>
          )}
        </section>
      )}

      {/* Карта */}
      <section className="property-details-page map-section">
        <h2 className="property-details-page map-section section-title">Расположение</h2>
        <div className="property-details-page map-section map-container">
          {property.latitude && property.longitude ? (
            <div className="property-details-page map-section map-container map-placeholder">
              {/* Здесь будет <YandexMap lat={property.latitude} lng={property.longitude} /> */}
              Координаты: {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
            </div>
          ) : (
            <p>Координаты не определены</p>
          )}
        </div>
      </section>

      {/* Кнопка действия */}
      <div className="property-details-page action-bar">
        <button
          className="property-details-page action-bar big-action-button"
          onClick={handleBuyClick}
        >
          Оставить заявку
        </button>
      </div>

      {isFullscreen && (
        <div 
          className="property-details-page fullscreen-overlay"
          onClick={closeFullscreen} // клик вне изображения — закрыть
        >
          <div 
            className="property-details-page fullscreen-content"
            onClick={e => e.stopPropagation()} // клик по изображению не закрывает
          >
            {/* Кнопка закрытия */}
            <button 
              className="property-details-page fullscreen-close"
              onClick={closeFullscreen}
            >
              ×
            </button>

            {/* Стрелки навигации */}
            <button 
              className="property-details-page fullscreen-nav prev"
              onClick={prevImage}
            >
              ←
            </button>

            <img
              src={loadedImages[fullscreenIndex] || '/fallback-property-large.jpg'}
              alt="Полноэкранное изображение"
              className="property-details-page fullscreen-image"
              onError={e => { e.target.src = '/fallback-property-large.jpg'; }}
            />

            <button 
              className="property-details-page fullscreen-nav next"
              onClick={nextImage}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;