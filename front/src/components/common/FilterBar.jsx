// src/components/FilterBar.jsx
import React, { useState } from 'react';
import './FilterBar.css';

const FilterBar = () => {
  const [filters, setFilters] = useState({
    operation: 'Купить',
    type: 'Квартиры',
    rooms: 'Студия',
    priceFrom: '',
    priceTo: '',
    areaFrom: '',
    areaTo: '',
    query: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    console.log('Поиск с фильтрами:', filters);
    // axios.get('/api/properties', { params: filters }) ...
  };

  return (
    <div className="filter-bar">
      <div className="filter-item">
        <select name="operation" value={filters.operation} onChange={handleChange}>
          <option>Купить</option>
          <option>Арендовать</option>
        </select>
      </div>

      <div className="filter-item">
        <select name="type" value={filters.type} onChange={handleChange}>
          <option>Квартиры</option>
          <option>Дома</option>
          <option>Коммерческая</option>
        </select>
      </div>

      <div className="filter-item">
        <select name="rooms" value={filters.rooms} onChange={handleChange}>
          <option>Студия</option>
          <option>1-к</option>
          <option>2-к</option>
          <option>3-к</option>
          <option>4+</option>
        </select>
      </div>

      <div className="filter-item">
        <input
          type="number"
          name="priceFrom"
          placeholder="₽ от"
          value={filters.priceFrom}
          onChange={handleChange}
        />
      </div>

      <div className="filter-item">
        <input
          type="number"
          name="priceTo"
          placeholder="₽ до"
          value={filters.priceTo}
          onChange={handleChange}
        />
      </div>

      <div className="filter-item">
        <input
          type="number"
          name="areaFrom"
          placeholder="м² от"
          value={filters.areaFrom}
          onChange={handleChange}
        />
      </div>

      <div className="filter-item">
        <input
          type="number"
          name="areaTo"
          placeholder="м² до"
          value={filters.areaTo}
          onChange={handleChange}
        />
      </div>

      <div className="filter-item" style={{ flex: '1 1 240px', minWidth: '240px' }}>
        <input
          type="text"
          name="query"
          placeholder="Город, район, улица, ЖК..."
          value={filters.query}
          onChange={handleChange}
        />
      </div>

      <button className="search-button" onClick={handleSearch}>
        Посмотреть
      </button>
    </div>
  );
};

export default FilterBar;