import React, { useEffect, useState } from 'react';
import { YMaps, Map, Placemark, Clusterer } from '@mr-igorinni/react-yandex-maps-fork';
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
        const response = await axios.get(`${API_URL}/api/properties/map`) // ← ваш backend порт
        if (response.data.success) {
          setProperties(response.data.data);
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

  if (loading) {
    return <div className="map-loading">Загрузка карты недвижимости...</div>;
  }

  if (error) {
    return <div className="map-error">{error}</div>;
  }

  return (
    <div className="map-wrapper">
      <YMaps
        query={{
          apikey: process.env.REACT_APP_YANDEX_MAPS_API_KEY || 'ВАШ_КЛЮЧ_ЗДЕСЬ',
          lang: 'ru_RU',
        }}
      >
        <Map
          defaultState={{
            center: [44.9521, 34.1024], // центр Симферополя
            zoom: 11,
            controls: ['zoomControl', 'fullscreenControl'],
          }}
          width="100%"
          height="100vh"
          modules={['clusterer']}
        >
          <Clusterer
            options={{
              preset: 'islands#invertedVioletClusterIcons',
              groupByCoordinates: false,
              clusterDisableClickZoom: true,
              clusterHideIconOnBalloonOpen: false,
            }}
          >
            {properties.map((prop) => (
              <Placemark
                key={prop.id}
                geometry={[prop.lat, prop.lng]}
                properties={{
                  hintContent: prop.title || 'Недвижимость',
                  balloonContentHeader: `<div style="font-weight:bold;">${prop.title || 'Объект'}</div>`,
                  balloonContentBody: `
                    ${prop.mainImage ? `<img src="${prop.mainImage}" alt="Фото" style="width:100%; max-height:160px; object-fit:cover; border-radius:6px; margin-bottom:8px;" />` : ''}
                    <p style="margin:6px 0;"><strong>Адрес:</strong> ${prop.address || '—'}</p>
                    <p style="margin:6px 0; color:#2e7d32; font-weight:bold;">
                      ${prop.price.toLocaleString('ru-RU')} ₽
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
            ))}
          </Clusterer>
        </Map>
      </YMaps>
    </div>
  );
};

export default MapPage;