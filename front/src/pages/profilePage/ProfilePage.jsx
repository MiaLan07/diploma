// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfilePage.css'; // Создайте соответствующий CSS файл для стилей личного кабинета

// Импортируйте необходимые компоненты для пользовательского и админского дашборда
// Эти компоненты вы можете создать отдельно, на основе дизайна и swagger
import UserDashboard from './UserDashboard'; // Компонент для обычного пользователя (избранное, заявки, профиль)
import AdminDashboard from './AdminDashboard'; // Компонент для админа (управление объектами, заявками, пользователями)
import Footer from '../../components/ui/Footer'; // Футер, если нужен

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth'); // Редирект на авторизацию, если нет токена
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка загрузки профиля');
        localStorage.removeItem('token'); // Удаляем токен при ошибке (например, истек)
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <>
      <div className="profile-container">
        {user.isAdmin ? (
          <AdminDashboard user={user} /> // Рендерим админский дашборд
        ) : (
          <UserDashboard user={user} /> // Рендерим пользовательский дашборд
        )}
      </div>

      <Footer backForm={true}/> {/* Футер, если требуется */}
    </>
  );
}