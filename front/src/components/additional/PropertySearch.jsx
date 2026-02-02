import { useState } from 'react';
import './PropertySearch.css';

const PropertySearch = () => {
  const [dealType, setDealType] = useState('КУПИТЬ');
  const [propertyType, setPropertyType] = useState('КВАРТИРЫ');
  const [layout, setLayout] = useState('СТУДИЯ');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [areaFrom, setAreaFrom] = useState('');
  const [areaTo, setAreaTo] = useState('');
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ dealType, propertyType, layout, priceFrom, priceTo, areaFrom, areaTo, query });
    // Здесь потом будет axios-запрос на бэкенд
  };

  return (
    <form className="property-search" onSubmit={handleSubmit}>
      <div className="property-search__filters-row">
        <div className="pill-select">
          <select value={dealType} onChange={(e) => setDealType(e.target.value)}>
            <option>КУПИТЬ</option>
            <option>АРЕНДА</option>
          </select>
          <span className="pill-select__arrow">▼</span>
        </div>

        <div className="pill-select">
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
            <option>КВАРТИРЫ</option>
            <option>ДОМА</option>
            <option>КОМНАТЫ</option>
            <option>КОММЕРЧЕСКАЯ</option>
          </select>
          <span className="pill-select__arrow">▼</span>
        </div>

        <div className="pill-select">
          <select value={layout} onChange={(e) => setLayout(e.target.value)}>
            <option>СТУДИЯ</option>
            <option>1-к</option>
            <option>2-к</option>
            <option>3-к+</option>
          </select>
          <span className="pill-select__arrow">▼</span>
        </div>

        <div className="pill-input">
          <input
            type="number"
            placeholder="₽ ОТ"
            value={priceFrom}
            onChange={(e) => setPriceFrom(e.target.value)}
          />
        </div>

        <div className="pill-input">
          <input
            type="number"
            placeholder="₽ ДО"
            value={priceTo}
            onChange={(e) => setPriceTo(e.target.value)}
          />
        </div>

        <div className="pill-input">
          <input
            type="number"
            placeholder="м² ОТ"
            value={areaFrom}
            onChange={(e) => setAreaFrom(e.target.value)}
          />
        </div>

        <div className="pill-input">
          <input
            type="number"
            placeholder="м² ДО"
            value={areaTo}
            onChange={(e) => setAreaTo(e.target.value)}
          />
        </div>
      </div>

      <div className="property-search__main-row">
        <div className="pill-input pill-input--search">
          <input
            type="search"
            placeholder="ПОИСК ПО ГОРОДУ, РАЙОНУ, УЛИЦЕ, ЖК"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <button type="button" className="btn-filters">
          ВСЕ ФИЛЬТРЫ
        </button>

        <button type="button" className="btn-map" aria-label="На карте">
          🗺
        </button>

        <button type="submit" className="btn-submit">
          ПОСМОТРЕТЬ
        </button>
      </div>
    </form>
  );
};

export default PropertySearch;