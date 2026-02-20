// src/components/PropertiesSlider.jsx
import React, { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import './PropertiesSlider.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import { ReactComponent as IconHartLoved } from '../../../../assets/heart-loved.svg';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'; // базовый URL сервера без /api
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PropertiesSlider = ({
  properties = [],
  title = "Популярные предложения",
  isFavoritesMode = false,
  onFavoriteChange,
}) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [imageBlobs, setImageBlobs] = useState({}); // { propId: [blobUrl1, blobUrl2, ...] }

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

  // Ленивая загрузка blob-изображений для видимых объектов
  useEffect(() => {
    if (properties.length === 0) return;

    const loadVisibleImages = async () => {
      // Вычисляем видимые слайды (текущий + соседние)
      const visibleSlideIndices = [selectedIndex - 1, selectedIndex, selectedIndex + 1].filter(
        i => i >= 0 && i < Math.ceil(properties.length / 3)
      );

      const visibleProperties = visibleSlideIndices.flatMap(i => properties.slice(i * 3, (i * 3) + 3));

      for (const prop of visibleProperties) {
        const propId = prop.id;
        if (imageBlobs[propId]) continue;

        if (!prop.images || prop.images.length === 0) {
          setImageBlobs(prev => ({ ...prev, [propId]: [] }));
          continue;
        }

        try {
          const blobs = await Promise.all(
            prop.images.map(async (img) => {
              const response = await axios.get(`${SERVER_URL}${img.url}`, {
                responseType: 'blob',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              });
              return URL.createObjectURL(response.data);
            })
          );

          setImageBlobs(prev => ({ ...prev, [propId]: blobs }));
        } catch (err) {
          console.error(`Ошибка загрузки изображений для объекта ${propId}:`, err);
          setImageBlobs(prev => ({ ...prev, [propId]: [] })); // fallback для этого объекта
        }
      }
    };

    loadVisibleImages();
  }, [properties, selectedIndex, token]);

  // Очистка blob-URL при размонтировании
  useEffect(() => {
    return () => {
      Object.values(imageBlobs).flat().forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageBlobs]);

  // Группируем по 3
  const slides = [];
  for (let i = 0; i < properties.length; i += 3) {
    slides.push(properties.slice(i, i + 3));
  }

  // Переключение избранного
  const toggleFavorite = async (propertyId, isCurrentlyFavorite, e) => {
    e.stopPropagation();

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      if (isCurrentlyFavorite) {
        await axios.delete(`${API_URL}/favorites/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/favorites/${propertyId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

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
                    const isFavorite = isFavoritesMode || property.isFavorite;
                    const propBlobs = imageBlobs[property.id] || [];

                    return (
                      <article
                        className="property-card"
                        key={property.id}
                        onClick={() => navigate(`/property/${property.id}`)}
                      >
                        <div className="property-image-wrapper">
                          {propBlobs.length > 0 ? (
                            // Мини-слайдер для нескольких фото
                            <InnerImageSlider blobs={propBlobs} />
                          ) : (
                            <img
                              src="/images/fallback-property.jpg"
                              alt="Загрузка фото..."
                              className="property-image"
                            />
                          )}

                          <button
                            type="button"
                            className={`favorite-heart-btn ${isFavorite ? 'favorite-heart-btn--active' : ''}`}
                            onClick={(e) => toggleFavorite(property.id, isFavorite, e)}
                            title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                          >
                          </button>
                        </div>

                        <div className="property-content">
                          <p className="property-price">
                            {Number(property.price).toLocaleString('ru-RU')} ₽
                          </p>

                          <div className="property-features">
                            {property.rooms && property.area ? (
                              <span>{property.rooms}-комнатная, {property.area} м²</span>
                            ) : (
                              <>
                                {property.rooms && <span>{property.rooms}-комнатная</span>}
                                {property.area && <span>{property.area} м²</span>}
                              </>
                            )}
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

const InnerImageSlider = ({ blobs }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      dragFree: false,
      align: 'center',
    },
    [Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback((e) => {
    e.stopPropagation();
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback((e) => {
    e.stopPropagation();
    emblaApi?.scrollNext();
  }, [emblaApi]);

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

  if (blobs.length <= 1) {
    return (
      <img
        src={blobs[0] || '/images/fallback-property.jpg'}
        alt="Фото объекта"
        className="property-image"
        onError={(e) => { e.target.src = '/images/fallback-property.jpg'; }}
      />
    );
  }

  return (
    <div className="inner-image-embla">
      <div className="inner-image-viewport" ref={emblaRef}>
        <div className="inner-image-container">
          {blobs.map((blobUrl, idx) => (
            <div
              className={`inner-image-slide ${idx === selectedIndex ? 'is-active' : ''}`}
              key={idx}
            >
              <img
                src={blobUrl}
                alt={`Фото ${idx + 1}`}
                className="property-image"
                onError={(e) => { e.target.src = '/images/fallback-property.jpg'; }}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        className="inner-image-arrow inner-image-arrow--prev"
        onClick={scrollPrev}
        aria-label="Предыдущее фото"
      >
        ←
      </button>

      <button
        className="inner-image-arrow inner-image-arrow--next"
        onClick={scrollNext}
        aria-label="Следующее фото"
      >
        →
      </button>

      <div className="inner-image-dots">
        {blobs.map((_, idx) => (
          <button
            key={idx}
            className={`inner-image-dot ${idx === selectedIndex ? 'inner-image-dot--active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              emblaApi?.scrollTo(idx);
            }}
            aria-label={`Перейти к фото ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
export default PropertiesSlider;