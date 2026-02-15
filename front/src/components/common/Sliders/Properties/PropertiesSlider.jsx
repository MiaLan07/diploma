// src/components/PropertiesSlider.jsx
import React, { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import './PropertiesSlider.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ReactComponent as IconHartLoved } from '../../../../assets/heart-loved.svg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PropertiesSlider = ({
  properties = [],
  title = "Популярные предложения",
  isFavoritesMode = false,
  onFavoriteChange, // колбэк, чтобы родитель мог обновить свой массив после добавления/удаления
}) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    dragFree: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Группируем по 3 карточки на слайд
  const slides = [];
  for (let i = 0; i < properties.length; i += 3) {
    slides.push(properties.slice(i, i + 3));
  }

  // Переключение избранного (добавление / удаление)
  const toggleFavorite = async (propertyId, isCurrentlyFavorite, e) => {
    e.stopPropagation(); // не даём кликнуть по карточке целиком

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      if (isCurrentlyFavorite) {
        // Удаляем
        await axios.delete(`${API_URL}/favorites/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Добавляем
        await axios.post(`${API_URL}/favorites/${propertyId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Уведомляем родителя об изменении (чтобы обновить массив)
      if (onFavoriteChange) {
        onFavoriteChange(propertyId, !isCurrentlyFavorite);
      }
    } catch (err) {
      console.error('Ошибка изменения избранного:', err);
      alert('Не удалось обновить избранное');
    }
  };

  if (properties.length === 0) {
    return (
      <section className="properties-section-wrapper">
        <div className="properties-section">
          <h2 className="section-title">{title}</h2>
          <p className="no-data-message">
            {isFavoritesMode ? 'У вас пока нет избранных объектов' : 'Нет доступных объявлений'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="properties-section-wrapper">
      <div className="properties-section">
        <h2 className="section-title">{title}</h2>

        <div className="properties-embla-viewport" ref={emblaRef}>
          <div className="properties-embla-container">
            {slides.map((slideProperties, slideIndex) => (
              <div className="properties-embla-slide" key={slideIndex}>
                <div className="properties-grid">
                  {slideProperties.map((property) => {
                    // Определяем, находится ли объект уже в избранном
                    const isFavorite = isFavoritesMode || property.isFavorite;

                    return (
                      <article
                        className="property-card"
                        key={property.id}
                        onClick={() => navigate(`/property/${property.id}`)}
                      >
                        <div className="property-image-wrapper">
                          <img
                            src={property.images?.[0]?.url || '/images/fallback-property.jpg'}
                            alt={property.shortDescription || 'Недвижимость'}
                            className="property-image"
                            loading="lazy"
                          />

                          {/* Сердечко в правом верхнем углу */}
                          <button
                            type="button"
                            className={`favorite-heart-btn ${isFavorite ? 'favorite-heart-btn--active' : ''}`}
                            onClick={(e) => toggleFavorite(property.id, isFavorite, e)}
                            title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                          >
                            <IconHartLoved />
                          </button>
                        </div>

                        <div className="property-content">
                          <p className="property-price">
                            {Number(property.price).toLocaleString('ru-RU')} ₽
                          </p>

                          <h3 className="property-title">
                            {property.shortDescription || `${property.rooms || '?'} комн., ${property.area || '?'} м²`}
                          </h3>

                          <div className="property-features">
                            {property.rooms && <span>{property.rooms} комн.</span>}
                            {property.area && <span>{property.area} м²</span>}
                            {property.floor !== undefined && property.totalFloors && (
                              <span>{property.floor}/{property.totalFloors}</span>
                            )}
                          </div>

                          <p className="property-address">
                            {property.address || 'Адрес не указан'}
                          </p>

                          {property.shortDescription && (
                            <p className="property-desc">
                              {property.shortDescription.length > 80
                                ? property.shortDescription.substring(0, 80) + '...'
                                : property.shortDescription}
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {slides.length > 1 && (
          <div className="properties-navigation">
            <button
              className="properties-arrow properties-arrow--prev"
              onClick={scrollPrev}
              disabled={selectedIndex === 0}
              aria-label="Предыдущие объявления"
            >
              ←
            </button>

            <div className="properties-dots">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  className={`properties-dot ${idx === selectedIndex ? 'properties-dot--active' : ''}`}
                  onClick={() => scrollTo(idx)}
                  aria-label={`Перейти к группе ${idx + 1}`}
                />
              ))}
            </div>

            <button
              className="properties-arrow properties-arrow--next"
              onClick={scrollNext}
              disabled={selectedIndex === slides.length - 1}
              aria-label="Следующие объявления"
            >
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertiesSlider;