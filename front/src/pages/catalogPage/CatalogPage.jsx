// src/pages/CatalogPage.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
// import '../styles/CatalogPage.css'; // Подключаем CSS файл для страницы каталога

// Схема валидации для формы фильтров (основана на примере с экрана)
const filterSchema = yup.object().shape({
  propertyType: yup.string().oneOf(['Жилая', 'Коммерческая', 'Земельные участки', 'Гаражи']).nullable(),
  housingType: yup.string().oneOf(['Квартира', 'Дом', 'Таунхаус', 'Апартаменты']).nullable(),
  roomsCount: yup.string().oneOf(['Студия', '1', '2', '3', '4', '5+']).nullable(),
  areaMin: yup.number().min(0).nullable(),
  areaMax: yup.number().min(0).nullable(),
  priceMin: yup.number().min(0).nullable(),
  priceMax: yup.number().min(0).nullable(),
  condition: yup.string().oneOf(['С ремонтом', 'Без ремонта', 'Черновая отделка']).nullable(),
  parking: yup.string().oneOf(['Есть', 'Нет', 'Подземная', 'Наземная']).nullable(),
  hasElevator: yup.boolean().nullable(),
  yearBuiltMin: yup.number().min(1900).nullable(),
  yearBuiltMax: yup.number().min(1900).nullable(),
  searchQuery: yup.string().nullable(), // Поиск по городу, адресу, району, ЖК
});

const CatalogPage = () => {
  const [properties, setProperties] = useState([]); // Состояние для списка объектов недвижимости
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [error, setError] = useState(null); // Состояние ошибки

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(filterSchema),
  });

  // Функция для загрузки объектов (с фильтрами)
  const fetchProperties = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/properties', { params: filters });
      setProperties(response.data.data || []);
    } catch (err) {
      setError('Ошибка загрузки объектов недвижимости');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка объектов при монтировании компонента
  useEffect(() => {
    fetchProperties();
  }, []);

  // Обработчик отправки формы фильтров
  const onSubmit = (data) => {
    // Формируем параметры запроса на основе формы (игнорируем null/undefined)
    const filters = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    );
    fetchProperties(filters);
  };

  return (
    <div className="catalog-page-container">
      {/* Шапка с фильтрами */}
      <header className="catalog-page-header">
        <form onSubmit={handleSubmit(onSubmit)} className="catalog-page-filter-form">
          <div className="catalog-page-filter-group">
            <label className="catalog-page-filter-label" htmlFor="propertyType">Тип недвижимости</label>
            <select id="propertyType" {...register('propertyType')} className="catalog-page-filter-select">
              <option value="">Любой</option>
              <option value="Жилая">Жилая</option>
              <option value="Коммерческая">Коммерческая</option>
              <option value="Земельные участки">Земельные участки</option>
              <option value="Гаражи">Гаражи</option>
            </select>
            {errors.propertyType && <span className="catalog-page-filter-error">{errors.propertyType.message}</span>}
          </div>

          <div className="catalog-page-filter-group">
            <label className="catalog-page-filter-label" htmlFor="housingType">Концепция комнат</label>
            <select id="housingType" {...register('housingType')} className="catalog-page-filter-select">
              <option value="">Любая</option>
              <option value="Квартира">Квартира</option>
              <option value="Дом">Дом</option>
              <option value="Таунхаус">Таунхаус</option>
              <option value="Апартаменты">Апартаменты</option>
            </select>
            {errors.housingType && <span className="catalog-page-filter-error">{errors.housingType.message}</span>}
          </div>

          <div className="catalog-page-filter-group">
            <label className="catalog-page-filter-label" htmlFor="roomsCount">Количество комнат</label>
            <select id="roomsCount" {...register('roomsCount')} className="catalog-page-filter-select">
              <option value="">Любое</option>
              <option value="Студия">Студия</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5+">5+</option>
            </select>
            {errors.roomsCount && <span className="catalog-page-filter-error">{errors.roomsCount.message}</span>}
          </div>

          <div className="catalog-page-filter-group catalog-page-filter-range-group">
            <label className="catalog-page-filter-label">Площадь</label>
            <input type="number" placeholder="От м²" {...register('areaMin')} className="catalog-page-filter-input" />
            <input type="number" placeholder="До м²" {...register('areaMax')} className="catalog-page-filter-input" />
            {(errors.areaMin || errors.areaMax) && <span className="catalog-page-filter-error">Некорректный диапазон площади</span>}
          </div>

          <div className="catalog-page-filter-group catalog-page-filter-range-group">
            <label className="catalog-page-filter-label">Цена</label>
            <input type="number" placeholder="От ₽" {...register('priceMin')} className="catalog-page-filter-input" />
            <input type="number" placeholder="До ₽" {...register('priceMax')} className="catalog-page-filter-input" />
            {(errors.priceMin || errors.priceMax) && <span className="catalog-page-filter-error">Некорректный диапазон цены</span>}
          </div>

          <div className="catalog-page-filter-group">
            <label className="catalog-page-filter-label" htmlFor="condition">Состояние</label>
            <select id="condition" {...register('condition')} className="catalog-page-filter-select">
              <option value="">Любое</option>
              <option value="С ремонтом">С ремонтом</option>
              <option value="Без ремонта">Без ремонта</option>
              <option value="Черновая отделка">Черновая отделка</option>
            </select>
            {errors.condition && <span className="catalog-page-filter-error">{errors.condition.message}</span>}
          </div>

          <div className="catalog-page-filter-group">
            <label className="catalog-page-filter-label" htmlFor="parking">Парковка</label>
            <select id="parking" {...register('parking')} className="catalog-page-filter-select">
              <option value="">Любая</option>
              <option value="Есть">Есть</option>
              <option value="Нет">Нет</option>
              <option value="Подземная">Подземная</option>
              <option value="Наземная">Наземная</option>
            </select>
            {errors.parking && <span className="catalog-page-filter-error">{errors.parking.message}</span>}
          </div>

          <div className="catalog-page-filter-group">
            <label className="catalog-page-filter-label" htmlFor="hasElevator">Наличие лифта</label>
            <select id="hasElevator" {...register('hasElevator')} className="catalog-page-filter-select">
              <option value="">Любой</option>
              <option value="true">Есть</option>
              <option value="false">Нет</option>
            </select>
            {errors.hasElevator && <span className="catalog-page-filter-error">{errors.hasElevator.message}</span>}
          </div>

          <div className="catalog-page-filter-group catalog-page-filter-range-group">
            <label className="catalog-page-filter-label">Год постройки</label>
            <input type="number" placeholder="От" {...register('yearBuiltMin')} className="catalog-page-filter-input" />
            <input type="number" placeholder="До" {...register('yearBuiltMax')} className="catalog-page-filter-input" />
            {(errors.yearBuiltMin || errors.yearBuiltMax) && <span className="catalog-page-filter-error">Некорректный диапазон года</span>}
          </div>

          <div className="catalog-page-filter-group catalog-page-search-group">
            <input type="text" placeholder="Город, поиск, адрес, район, ЖК" {...register('searchQuery')} className="catalog-page-filter-input catalog-page-search-input" />
            {errors.searchQuery && <span className="catalog-page-filter-error">{errors.searchQuery.message}</span>}
          </div>

          <button type="submit" className="catalog-page-filter-submit-button">Поиск</button>
        </form>
      </header>

      {/* Основной контент: сетка карточек */}
      <main className="catalog-page-main">
        {loading && <p className="catalog-page-loading">Загрузка...</p>}
        {error && <p className="catalog-page-error">{error}</p>}
        <div className="catalog-page-property-grid">
          {properties.map((property) => (
            <div key={property.id} className="catalog-page-property-card">
              <div className="catalog-page-property-card-image-placeholder">
                {/* Здесь можно добавить <img src={property.images[0]?.url || 'placeholder.jpg'} /> */}
              </div>
              <div className="catalog-page-property-card-content">
                <h3 className="catalog-page-property-card-title">{property.title || `${property.roomsCount}-комнатная квартира`}</h3>
                <p className="catalog-page-property-card-price">{property.price.toLocaleString('ru-RU')} ₽</p>
                <p className="catalog-page-property-card-description">{property.shortDescription || 'Краткое описание'}</p>
                <p className="catalog-page-property-card-address">{property.address || 'Адрес'}</p>
                <p className="catalog-page-property-card-details">
                  {property.area} м², {property.floor}/{property.totalFloors} эт.
                </p>
              </div>
              <button className="catalog-page-property-card-favorite-button">❤️</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CatalogPage;