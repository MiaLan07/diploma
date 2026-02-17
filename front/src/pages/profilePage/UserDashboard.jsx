// src/components/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserDashboard.css';
import PropertiesSlider from '../../components/common/Sliders/Properties/PropertiesSlider';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function UserDashboard({ user }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Предполагаем, что бэк возвращает массив объектов Property
        setFavorites(res.data.data || res.data || []);
      } catch (err) {
        setError('Не удалось загрузить избранное');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate]);

  if (loading) return <div className="user-dashboard-loading">Загрузка...</div>;
  if (error) return <div className="user-dashboard-error">{error}</div>;

  return (
    <div className="user-dashboard-wrapper">
      <div className="user-dashboard-header">
        <div className="user-dashboard-header-info">
          <h1 className="user-dashboard-header-name">{user.firstName || 'Пользователь'}</h1>
          <span className="user-dashboard-header-contacts">{user.email || '—'}</span>
          <span className="user-dashboard-header-contacts">{user.city || 'Симферополь'}</span>
          <span className="user-dashboard-header-contacts">{user.phone || '+7 (000) 000-00-00'}</span>
        </div>
      </div>

      <div className="user-dashboard-main-content">
        {/* Левая колонка — меню */}
        <aside className="user-dashboard-sidebar">
          <ul className="user-dashboard-sidebar-list">
            <li className="user-dashboard-sidebar-item">
              <a href="#favorites" className="sidebar-link">
                ИЗБРАННОЕ
              </a>
            </li>
            {/* <li className="user-dashboard-sidebar-item">Мои заявки</li> */}
            {/* <li className="user-dashboard-sidebar-item">Настройки</li> */}
            <li
              className="user-dashboard-sidebar-item logout-item"
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/auth');
              }}
            >
              ВЫЙТИ
            </li>
          </ul>
        </aside>

        {/* Правая часть — избранное */}
        <PropertiesSlider 
          id='favorites'
          properties={favorites} 
          title="Избранные объекты" 
          isFavoritesMode={true}
          onFavoriteChange={(propertyId, newFavoriteStatus) => {
            if (!newFavoriteStatus) {
              // Удаляем из массива только если сняли избранное
              setFavorites(prev => prev.filter(p => p.id !== propertyId));
            }
            // Если добавили — можно ничего не делать, т.к. в избранном мы только удаляем
          }}
        />
      </div>
    </div>
  );
}