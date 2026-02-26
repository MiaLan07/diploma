// src/components/AdminPropertiesList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ReactComponent as ArrowLeftIcon } from '../../assets/arrow-left1.svg'

const AdminPropertiesList = ({ setActiveSection, onToggleSidebar, sidebarCollapsed }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/auth';
      return;
    }

    const fetchProperties = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/properties`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { page: 1, limit: 50 }
          }
        );
        if (res.data.success) {
          setProperties(res.data.data || []);
        } else {
          setError('Не удалось загрузить объекты');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка сервера');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить объект? Это действие нельзя отменить.')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/properties/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Не удалось удалить объект');
    }
  };

  if (loading) return <div className="admin-properties-list-loading-message">Загрузка объектов...</div>;
  if (error) return <div className="admin-properties-list-error-message">{error}</div>;

  return (
    <div className="admin-properties-list-main-wrapper">
      <button className="admin-properties-list-toggle-sidebar" onClick={onToggleSidebar}>
        <ArrowLeftIcon className={sidebarCollapsed ? 'active' : ''}/> <span>{sidebarCollapsed ? 'Развернуть меню' : 'Свернуть меню'}</span>
      </button>
      <div className="admin-properties-list-fixed-header">
        <h1 className="admin-properties-list-page-title">Список объектов недвижимости</h1>
        <button onClick={() => setActiveSection('properties-add')} className="admin-properties-list-add-new-button">
          + Добавить объект
        </button>
      </div>

      <div className="admin-properties-list-table-scroll-wrapper">
        <table className="admin-properties-list-data-table">
          <thead className="admin-properties-list-table-header-sticky">
            <tr className="admin-properties-list-header-row">
              <th className="admin-properties-list-table-header-cell id-column">ID</th>
              <th className="admin-properties-list-table-header-cell title-column">Заголовок</th>           {/* новое */}
              <th className="admin-properties-list-table-header-cell address-column">Адрес</th>
              <th className="admin-properties-list-table-header-cell rooms-column">Комнат</th>
              <th className="admin-properties-list-table-header-cell area-column">Площадь</th>
              <th className="admin-properties-list-table-header-cell price-column">Цена</th>
              <th className="admin-properties-list-table-header-cell status-column">Статус</th>
              <th className="admin-properties-list-table-header-cell operation-column">Операция</th>
              <th className="admin-properties-list-table-header-cell type-column">Тип недв.</th>
              <th className="admin-properties-list-table-header-cell subtype-column">Подтип</th>
              <th className="admin-properties-list-table-header-cell building-type-column">Тип дома</th>    {/* новое */}
              <th className="admin-properties-list-table-header-cell condition-column">Состояние</th>
              <th className="admin-properties-list-table-header-cell renovation-year-column">Ремонт, год</th> {/* новое */}
              <th className="admin-properties-list-table-header-cell parking-column">Парковка</th>
              <th className="admin-properties-list-table-header-cell floor-column">Этаж</th>
              <th className="admin-properties-list-table-header-cell elevator-column">Лифт</th>
              <th className="admin-properties-list-table-header-cell year-column">Год постр.</th>
              <th className="admin-properties-list-table-header-cell maternal-capital-column">Мат.кап.</th>  {/* новое */}
              <th className="admin-properties-list-table-header-cell encumbrance-column">Обременения</th>   {/* новое */}
              <th className="admin-properties-list-table-header-cell ready-to-move-column">Заселение</th>   {/* новое */}
              <th className="admin-properties-list-table-header-cell bargaining-column">Торг</th>            {/* новое */}
              <th className="admin-properties-list-table-header-cell mortgage-column">Ипотека</th>          {/* новое */}
              <th className="admin-properties-list-table-header-cell description-column">Описание</th>
              <th className="admin-properties-list-table-header-cell created-column">Создано</th>
            </tr>
          </thead>

          <tbody className="admin-properties-list-table-body">
            {properties.length === 0 ? (
              <tr>
                <td colSpan={25} className="admin-properties-list-empty-row">
                  Объекты отсутствуют
                </td>
              </tr>
            ) : (
              properties.map(property => (
                <tr key={property.id} className="admin-properties-list-data-row">
                  <td className="admin-properties-list-table-cell id-column">{property.id}</td>

                  <td className="admin-properties-list-table-cell title-column">
                    {property.title || '—'}
                  </td>

                  <td className="admin-properties-list-table-cell address-column">
                    {property.slug ? (
                      <a
                        href={`/property/${property.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-properties-list-table-cell address-column .address-link"
                      >
                        {property.address || '—'}
                      </a>
                    ) : (
                      property.address || '—'
                    )}
                  </td>

                  <td className="admin-properties-list-table-cell rooms-column text-center">{property.roomsCuant ?? '—'}</td>
                  <td className="admin-properties-list-table-cell area-column text-right">
                    {property.totalArea || property.area ? `${property.totalArea || property.area} м²` : '—'}
                  </td>
                  <td className="admin-properties-list-table-cell price-column text-right">
                    {property.price ? property.price.toLocaleString('ru-RU') : '—'}
                  </td>
                  <td className="admin-properties-list-table-cell status-column text-center">{property.status || 'active'}</td>
                  <td className="admin-properties-list-table-cell operation-column">{property.operation?.name || '—'}</td>
                  <td className="admin-properties-list-table-cell type-column">{property.propertyType?.name || '—'}</td>
                  <td className="admin-properties-list-table-cell subtype-column">{property.housingType?.name || '—'}</td>

                  {/* Новые колонки */}
                  <td className="admin-properties-list-table-cell building-type-column">{property.buildingType || '—'}</td>
                  <td className="admin-properties-list-table-cell condition-column">{property.condition || '—'}</td>
                  <td className="admin-properties-list-table-cell renovation-year-column">{property.renovationYear || '—'}</td>
                  <td className="admin-properties-list-table-cell parking-column">{property.parking || '—'}</td>
                  <td className="admin-properties-list-table-cell floor-column text-center">{property.floor ?? '—'}</td>
                  <td className="admin-properties-list-table-cell elevator-column text-center">
                    {property.hasElevator ? '✓' : '—'}
                  </td>
                  <td className="admin-properties-list-table-cell year-column text-center">{property.yearBuilt || '—'}</td>

                  {/* Флаги */}
                  <td className="admin-properties-list-table-cell maternal-capital-column text-center">
                    {property.maternalCapital ? 'да' : '—'}
                  </td>
                  <td className="admin-properties-list-table-cell encumbrance-column text-center">
                    {property.encumbrance ? 'есть' : '—'}
                  </td>
                  <td className="admin-properties-list-table-cell ready-to-move-column text-center">
                    {property.readyToMove ? 'да' : '—'}
                  </td>
                  <td className="admin-properties-list-table-cell bargaining-column text-center">
                    {property.bargaining ? 'да' : '—'}
                  </td>
                  <td className="admin-properties-list-table-cell mortgage-column text-center">
                    {property.mortgagePossible ? 'да' : '—'}
                  </td>

                  <td className="admin-properties-list-table-cell description-column">
                    {property.shortDescription?.slice(0, 60) || '—'}{property.shortDescription?.length > 60 && '...'}
                  </td>
                  <td className="admin-properties-list-table-cell created-column">
                    {new Date(property.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                    <div className="admin-properties-list-actions-group">
                      <Link
                        to={`/admin/properties/edit/${property.id}`}
                        className="admin-properties-list-action-button edit-button"
                      >
                        Изменить
                      </Link>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="admin-properties-list-action-button delete-button"
                      >
                        Удалить
                      </button>
                    </div>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPropertiesList;