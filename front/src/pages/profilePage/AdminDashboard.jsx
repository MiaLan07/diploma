// src/components/AdminDashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPropertiesList from '../admin/AdminPropertiesList'; // Новый компонент для списка
import AdminAddProperty from '../admin/AdminAddProperty'; // Ваш существующий компонент
// Другие компоненты: AdminRequestsList, AdminUsersList, AdminSettings и т.д. (добавьте по мере необходимости)
import './AdminDashboard.css'

import { ReactComponent as AddPropertyIcon } from '../../assets/plus-add1.svg'
import { ReactComponent as ViewPropertiesIcon } from '../../assets/table1.svg'
import { ReactComponent as LogoutIcon } from '../../assets/logout1.svg'

export default function AdminDashboard({ user }) {
  const [activeSection, setActiveSection] = useState('properties-list');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('authChange'));
    navigate('/auth');
  };

  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="admin-content-placeholder">
            <h2>Добро пожаловать в админ-панель</h2>
            <p>Выберите раздел в левом меню</p>
          </div>
        );

      case 'properties-list':
        return <AdminPropertiesList setActiveSection={setActiveSection} onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />

      case 'properties-add':
        return <AdminAddProperty onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />;

      // case 'requests':
      //   return <AdminRequestsList />;

      case 'settings':
        return (
          <div>
            <h2>Настройки системы</h2>
            <p>(пока пусто — можно добавить позже)</p>
          </div>
        );

      default:
        return <div>Раздел в разработке</div>;
    }
  };

  return (
    <div className="admin-dashboard-wrapper">
      {/* Шапка */}
      <header className="admin-dashboard-header">
        <div className="admin-dashboard-header-info">
          <h1 className="admin-dashboard-header-name">
            {user.firstName} {user.lastName}
          </h1>
          <div className="admin-dashboard-header-role">Администратор</div>
          <span className="admin-dashboard-header-contact">{user.email}</span>
          <span className="admin-dashboard-header-contact">
            {user.phone || '—'}
          </span>
        </div>
      </header>

      {/* Основная область */}
      <div className={`admin-dashboard-main-content ${sidebarCollapsed ? 'small' : ''}`}>
        {/* Левая колонка — меню */}
          <aside className="admin-dashboard-sidebar">
            <ul className="admin-dashboard-sidebar-list">
              {/* Родительский пункт "Объекты" */}
              <li className="admin-dashboard-sidebar-item admin-dashboard-sidebar-parent">
                <span className='textinli'>Объекты</span>
              </li>
              <ul className="admin-dashboard-sidebar-sublist">
                <li
                  className={`admin-dashboard-sidebar-subitem ${
                    activeSection === 'properties-list' ? 'active' : ''
                  }`}
                  onClick={() => setActiveSection('properties-list')}
                >
                  <ViewPropertiesIcon /> <span className='textinli'>Список объектов</span>
                </li>
                <li
                  className={`admin-dashboard-sidebar-subitem ${
                    activeSection === 'properties-add' ? 'active' : ''
                  }`}
                  onClick={() => setActiveSection('properties-add')}
                >
                  <AddPropertyIcon /> <span className='textinli'>Добавить объект</span>
                </li>
              </ul>

              {/* Пункт выхода */}
              <li
                className="admin-dashboard-sidebar-item logout-item"
                onClick={handleLogout}
              >
                <LogoutIcon /> <span className='textinli'>Выйти</span>
              </li>
            </ul>
          </aside>

        {/* Правая часть — контент выбранного раздела */}
        <main className='admin-dashboard-content-area'>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}