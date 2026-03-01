import React, { useEffect, useState, useRef } from 'react';
import { YMaps, Map, Clusterer, Placemark } from '@mr-igorinni/react-yandex-maps-fork';
import axios from 'axios';
import './MapPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';


const MapPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/properties/map`);
        console.log('Полный ответ сервера:', res.data);

        if (res.data?.success && Array.isArray(res.data?.data)) {
          const validProps = res.data.data.filter(p => {
            const lat = Number(p.latitude ?? p.lat);
            const lng = Number(p.longitude ?? p.lng);
            return !isNaN(lat) && !isNaN(lng) && lat >= 40 && lat <= 50 && lng >= 30 && lng <= 40; // грубый фильтр по Крыму
          });

          console.log('Валидных объектов с координатами:', validProps.length);
          console.table(validProps.slice(0, 5)); // первые 5 для отладки

          setProperties(validProps);
        } else {
          setError('Данные с сервера некорректны или пустые');
        }
      } catch (err) {
        console.error('Ошибка axios:', err);
        setError('Не удалось загрузить объекты для карты');
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  if (loading) return <div className="map-loading">Загрузка карты...</div>;
  if (error) return <div className="map-error">{error}</div>;

  // Если объектов 0 — показываем подсказку
  if (properties.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>
        <h2>Нет объектов с координатами</h2>
        <p>Проверь консоль и ответ сервера /api/properties/map</p>
      </div>
    );
  }


  const handleClusterClick = (e) => {
    const cluster = e.get('target');
    if (!cluster || !mapRef.current) return;

    const bounds = cluster.geometry.getBounds();
    if (!bounds) return;

    mapRef.current.setBounds(bounds, {
      checkZoomRange: true,
      zoomMargin: 70,
      duration: 450,
    });
  };

  return (
    <div className="map-wrapper">
      <YMaps
        query={{
          apikey: process.env.REACT_APP_YANDEX_MAPS_API_KEY,
          lang: 'ru_RU',
          load: 'package.full',
        }}
      >
        <Map
          defaultState={{
            center: [44.9521, 34.1024], // Симферополь
            zoom: 10,                   // чуть шире, чтобы увидеть кластеры
            controls: ['zoomControl', 'fullscreenControl', 'geolocationControl'],
          }}
          width="100%"
          height="100vh"
          // modules={['geolocation']} // если хочешь геолокацию
        >
          <Clusterer
            options={{
              preset: 'islands#invertedDarkGreenClusterIcons', // попробуй другой пресет
              groupByCoordinates: false,
              clusterDisableClickZoom: false,
              clusterHideIconOnBalloonOpen: false,
              minClusterSize: 2,
              disableClusteringAtZoom: 20,
              gridSize: 128,
              zoomMargin: 250,
            }}
          >
            {properties.map((prop) => {
              const lat = Number(prop.latitude ?? prop.lat);
              const lng = Number(prop.longitude ?? prop.lng);

              if (isNaN(lat) || isNaN(lng)) return null;

              return (
                <Placemark
                  key={prop.id}
                  geometry={[lat, lng]}
                  properties={{
                    hintContent: prop.title || prop.address || 'Объект',
                    balloonContentHeader: `<strong>${prop.title || 'Недвижимость'}</strong>`,
                    balloonContentBody: `
                      ${prop.mainImage ? `<img src="${prop.mainImage}" style="max-width:100%;height:auto;border-radius:6px;margin-bottom:8px;" />` : ''}
                      <p><b>Адрес:</b> 
                        <a href="/property/${prop.slug || prop.id}" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style="color:#2e7d32;text-decoration:underline;">
                          ${prop.address || '—'}
                        </a>
                      </p>
                      <p style="color:#2e7d32;font-weight:bold;">
                        ${prop.price ? prop.price.toLocaleString('ru-RU') + ' ₽' : 'Цена по запросу'}
                      </p>
                      ${prop.rooms ? `<p><b>Комнат:</b> ${prop.rooms}</p>` : ''}
                      <p style="color:#555;">${prop.shortDescription || ''}</p>
                    `,
                  }}
                  options={{
                    preset: 'islands#greenDotIcon',
                  }}
                />
              );
            })}
          </Clusterer>
        </Map>
      </YMaps>
    </div>
  );
};

export default MapPage;