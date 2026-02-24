// src/components/FilterBar.jsx
import React, { useState } from 'react';
import './FilterBar.css';
import { ReactComponent as MapIcon } from '../../assets/map1.svg'
import CustomSelect from './CustomSelect'

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
      <div className='container'>
        <div className="filter-item">
          <CustomSelect
            name="operation"
            value={filters.operation}
            onChange={handleChange}
            options={["Купить", "Арендовать"]}
          />
        </div>

        <div className="filter-item">
          <CustomSelect
            name="type"
            value={filters.type}
            onChange={handleChange}
            options={["Квартиры", "Дома", "Коммерческая"]}
          />
        </div>

        <div className="filter-item">
          <CustomSelect
            name="rooms"
            value={filters.rooms}
            onChange={handleChange}
            options={["Студия", "1-к", "2-к", "3-к", "4+"]}
          />
        </div>

        {/* <div className='filter-item container'> */}
          <div className="filter-item inner">
            <input
              type="number"
              name="priceFrom"
              placeholder="₽ от"
              value={filters.priceFrom}
              onChange={handleChange}
            />
          </div>

          <div className="filter-item inner">
            <input
              type="number"
              name="priceTo"
              placeholder="₽ до"
              value={filters.priceTo}
              onChange={handleChange}
            />
          </div>
        {/* </div> */}

        {/* <div className='filter-item container'> */}
          <div className="filter-item inner">
            <input
              type="number"
              name="areaFrom"
              placeholder="м² от"
              value={filters.areaFrom}
              onChange={handleChange}
            />
          </div>

          <div className="filter-item inner">
            <input
              type="number"
              name="areaTo"
              placeholder="м² до"
              value={filters.areaTo}
              onChange={handleChange}
            />
          </div>
        {/* </div> */}
      </div>
      <div className='container'>
        <div className="filter-item long-input">
          <input
            type="text"
            name="query"
            placeholder="Город, район, улица, ЖК..."
            value={filters.query}
            onChange={handleChange}
            className="filter-item"
          />
        </div>

        <div className='link-item catalog'>
          <a href='/catalog'>Все фильтры</a>
        </div>

        <div className='link-item map'>
          <a href='/map'>
            <MapIcon width="30" height="30" className='map-icon' strokeWidth={15} />
          </a>
        </div>

        <button className="search-button" onClick={handleSearch}>
          Посмотреть
        </button>
      </div>
    </div>
  );
};

export default FilterBar;