// src/components/YandexMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import { YMaps, Map, Placemark, ZoomControl, TypeSelector } from '@mr-igorinni/react-yandex-maps-fork';

const YandexMap = ({ lat, lng, address = '' }) => {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [ymapsInstance, setYmapsInstance] = useState(null);

  // Получаем текущее местоположение пользователя (один раз при монтировании)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.warn('Не удалось получить геолокацию пользователя:', err);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  const handleApiLoaded = (ymaps) => {
    setYmapsInstance(ymaps);
  };

  const buildRoute = () => {
    if (!ymapsInstance || !mapRef.current || !userLocation) {
      alert('Невозможно построить маршрут: нет геолокации или карта не загружена');
      return;
    }

    const pointA = [userLocation.lng, userLocation.lat]; // от пользователя (lng, lat — порядок важен!)
    const pointB = [lng, lat];                           // до объекта

    const multiRoute = new ymapsInstance.multiRouter.MultiRoute(
      {
        referencePoints: [pointA, pointB],
        params: {
          routingMode: 'auto', // или 'pedestrian', 'masstransit'
          avoidTrafficJams: true,
        },
      },
      {
        boundsAutoApply: true, // автоматически подгоняем масштаб
      }
    );

    // Удаляем старый маршрут, если был
    if (mapRef.current.multiRoute) {
      mapRef.current.geoObjects.remove(mapRef.current.multiRoute);
    }

    // Добавляем новый маршрут
    mapRef.current.geoObjects.add(multiRoute);
    mapRef.current.multiRoute = multiRoute;
  };

  return (
    <YMaps
      query={{
        apikey: process.env.REACT_APP_YANDEX_MAPS_API_KEY,
        lang: 'ru_RU',
      }}
    >
      {/* Обёртка с aspect-ratio */}
      <div className="property-details-page map-section map-aspect-wrapper">
        <Map
          // НЕ передаём width / height пропсы → библиотека отдаёт контроль CSS
          className="property-details-page map-section map-map"
          defaultState={{
            center: [lat, lng],
            zoom: 15,
            controls: [],
          }}
          modules={['multiRouter.MultiRoute']}
          instanceRef={mapRef}
          onLoad={handleApiLoaded}
        >
          {/* Маркер объекта */}
          <Placemark
            geometry={[lat, lng]}
            options={{
              preset: 'islands#redDotIcon',
            }}
            properties={{
              hintContent: address || 'Объект недвижимости',
              balloonContent: `<strong>${address || 'Текущий объект'}</strong><br>Координаты: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            }}
          />

          {/* Контролы */}
          <ZoomControl options={{ float: 'right' }} />
          <TypeSelector options={{ float: 'left' }} />

          {/* Кнопка "Построить маршрут от меня" */}
          {userLocation && ymapsInstance && (
            <div style={{ position: 'absolute', top: 10, left: 50, zIndex: 1000 }}>
              <button
                onClick={buildRoute}
                style={{
                  padding: '10px 16px',
                  background: '#006633',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                }}
              >
                Маршрут от моего местоположения
              </button>
            </div>
          )}
        </Map>
      </div>
    </YMaps>
  );
};

export default YandexMap;