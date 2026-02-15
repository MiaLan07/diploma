// src/components/AdminDashboard.jsx
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminAddProperty from '../admin/AdminAddProperty'; // или ваш путь
// Другие компоненты: AdminPropertiesList, AdminRequests и т.д.

export default function AdminDashboard({ user }) {
  const location = useLocation();

  return (
    <div className="admin-dashboard">
      <h2>Админ-панель — {user.firstName} {user.lastName}</h2>

      <nav className="admin-nav">
        <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
          Обзор
        </Link>
        <Link to="/admin/properties" className={location.pathname.startsWith('/admin/properties') ? 'active' : ''}>
          Объекты
        </Link>
        <Link to="/admin/requests">Заявки</Link>
        <Link to="/admin/users">Пользователи</Link>
      </nav>

      <div className="admin-content">
        <Routes>
          <Route path="/" element={<div>Добро пожаловать в админку</div>} />
          <Route path="/properties" element={<div>Список объектов (реализуйте таблицу)</div>} />
          <Route path="/properties/add" element={<AdminAddProperty />} />
          {/* Другие маршруты */}
        </Routes>
      </div>
    </div>
  );
}