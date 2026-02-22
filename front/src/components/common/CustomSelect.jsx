import { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';
import { ReactComponent as IconArrowDown } from '../../assets/arrow-down1.svg'
import { ReactComponent as IconArrowUp } from '../../assets/arrow-down2.svg'

const CustomSelect = ({
  name,
  value,
  onChange,
  options,           // массив строк или объектов {value: string, label: string}
  placeholder = 'Выберите…',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Закрываем при клике вне
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = () => setIsOpen(prev => !prev);

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } }); // имитируем событие как у нативного select
    setIsOpen(false);
  };

  // Если options — массив строк — преобразуем в объекты
  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div
      className={`filter-item custom-select-wrapper ${className} ${isOpen ? 'open' : ''}`}
      ref={containerRef}
    >
      <div className="custom-select-trigger" onClick={toggle}>
        <span className="selected-text">{displayText}</span>
        <span className="custom-arrow">{isOpen ? <IconArrowUp /> : <IconArrowDown />}</span>
      </div>

      {isOpen && (
        <ul className="custom-options-list">
          {normalizedOptions.map((opt) => (
            <li
              key={opt.value}
              className={`custom-option ${opt.value === value ? 'selected' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;