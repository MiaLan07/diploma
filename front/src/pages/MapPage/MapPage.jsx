import React, { useEffect, useState } from 'react';
import { YMaps, Map, Clusterer, Placemark } from '@mr-igorinni/react-yandex-maps-fork';
import axios from 'axios';
import './MapPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MapPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/properties/map`);
        console.log('Ответ от сервера:', response.data);
        if (response.data.success) {
          const data = response.data.data;
          console.log('Данные для карты:', data); // ← смотри сюда!
          setProperties(data);
        } else {
          setError('Не удалось загрузить объекты');
        }
      } catch (err) {
        setError('Ошибка загрузки данных для карты');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  if (loading) return <div className="map-loading">Загрузка карты...</div>;
  if (error) return <div className="map-error">{error}</div>;

  // Для отладки — покажем количество объектов прямо на экране
  console.log('Текущее состояние properties:', properties.length, properties);

  return (
    <div className="map-wrapper">
      {/* Отладочная панель */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'white',
        padding: '10px',
        zIndex: 1000,
        border: '1px solid #ccc',
        borderRadius: '4px'
      }}>
        Объектов загружено: {properties.length}
        {properties.length > 0 && (
          <div>Первый: {JSON.stringify(properties[0], null, 2)}</div>
        )}
      </div>

      <YMaps
        query={{
          apikey: process.env.REACT_APP_YANDEX_MAPS_API_KEY,
          lang: 'ru_RU',
          load: 'package.full'  // оставляем, раз карта появилась
        }}
      >
        <Map
          defaultState={{
            center: [44.9521, 34.1024], 
            zoom: 12,  // чуть увеличили зум для лучшей видимости меток
            controls: ['zoomControl', 'fullscreenControl'],
          }}
          width="100%"
          height="100vh"
        >
          <Clusterer
            options={{
              preset: 'islands#invertedVioletClusterIcons',
              groupByCoordinates: false,
              clusterDisableClickZoom: false,
              clusterHideIconOnBalloonOpen: false,
              minClusterSize: 2,
              disableClusteringAtZoom: 15,   // ← ключевое! При зуме 15+ все метки показываются отдельно
            }}
          >
            {properties.map((prop) => {
              const lat = Number(prop.lat || prop.latitude);
              const lng = Number(prop.lng || prop.longitude);

              // Пропускаем, если координаты некорректны
              if (isNaN(lat) || isNaN(lng)) {
                console.warn(`Некорректные координаты для объекта ${prop.id}`);
                return null;
              }

              return (
                <Placemark
                  key={prop.id}
                  geometry={[lat, lng]}  // ← ВАЖНО: [lng, lat]
                  properties={{
                    hintContent: prop.title || 'Недвижимость',
                    balloonContentHeader: `<div style="font-weight:bold;">${prop.title || 'Объект'}</div>`,
                    balloonContentBody: `
                      ${prop.mainImage ? `<img src="${prop.mainImage}" alt="Фото" style="width:100%; max-height:160px; object-fit:cover; border-radius:6px; margin-bottom:8px;" />` : ''}
                      <p style="margin:6px 0;"><strong>Адрес:</strong> ${prop.address || '—'}</p>
                      <p style="margin:6px 0; color:#2e7d32; font-weight:bold;">
                        ${prop.price ? prop.price.toLocaleString('ru-RU') : 'Цена не указана'} ₽
                      </p>
                      ${prop.rooms ? `<p><strong>Комнат:</strong> ${prop.rooms}</p>` : ''}
                      <p style="font-size:0.95em; color:#555;">
                        ${prop.shortDescription?.substring(0, 100) || 'Описание отсутствует'}
                        ${prop.shortDescription?.length > 100 ? '...' : ''}
                      </p>
                    `,
                    balloonContentFooter: `<small>ID: ${prop.id} • ${new Date().toLocaleDateString('ru-RU')}</small>`,
                  }}
                  options={{
                    preset: 'islands#greenDotIcon',
                    hideIconOnBalloonOpen: false,
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