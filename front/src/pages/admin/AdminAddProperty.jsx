// src/pages/Admin/AdminAddProperty.jsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import './AdminAddProperty.css'; // предполагаем, что стили будут в отдельном файле

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const schema = yup.object({
  operationId: yup.number().integer().positive().required('Выберите тип операции'),
  propertyTypeId: yup.number().integer().positive().required('Выберите тип недвижимости'),
  housingTypeId: yup.number().integer().positive().nullable(),

  price: yup.number().positive().required('Укажите цену').min(100_000, 'Слишком низкая цена'),
  area: yup.number().positive().nullable().min(5, 'Площадь слишком мала'),

  totalArea: yup.number().positive().nullable().min(5),
  livingArea: yup.number().positive().nullable().min(5),
  kitchenArea: yup.number().positive().nullable().min(3),

  rooms: yup.number().integer().min(0).max(20).nullable(),
  floor: yup.number().integer().min(-10).max(150).nullable(),
  totalFloors: yup.number().integer().min(1).max(150).nullable(),

  // Строковые необязательные — разрешаем пустую строку
  condition: yup.string().max(100).nullable(),
  renovation: yup.string().max(100).nullable(),
  parking: yup.string().max(50).nullable(),
  balcony: yup.string().max(100).nullable(),
  bathroom: yup.string().max(100).nullable(),
  windows: yup.string().max(100).nullable(),
  view: yup.string().max(100).nullable(),
  ownership: yup.string().max(100).nullable(),

  // Текстовые описания — тоже разрешаем пустые
  shortDescription: yup.string().trim().max(500).nullable(),
  fullDescription: yup.string().trim().max(10000).nullable(),

  address: yup.string().trim().max(255).required('Укажите адрес'),

  hasElevator: yup.boolean().nullable(),
  renovationYear: yup.number().integer().min(1900).max(new Date().getFullYear() + 5).nullable(),

  encumbrance: yup.boolean().nullable(),
  mortgagePossible: yup.boolean().nullable(),
  readyToMove: yup.boolean().nullable(),
  bargaining: yup.boolean().nullable(),
}).required();

const AdminAddProperty = () => {
  const navigate = useNavigate();
  const [operations, setOperations] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [housingTypes, setHousingTypes] = useState([]);
  const [filteredHousingTypes, setFilteredHousingTypes] = useState([]);

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [loadingRefs, setLoadingRefs] = useState(true);
  const [refsError, setRefsError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',                 // ← полезно для моментальной обратной связи
    shouldFocusError: false,
    defaultValues: {
      operationId: '',
      propertyTypeId: '',
      housingTypeId: null,
      price: '',
      area: '',
      totalArea: '',
      livingArea: '',
      kitchenArea: '',
      rooms: '',
      floor: '',
      totalFloors: '',
      condition: '',
      renovation: '',
      renovationYear: '',
      parking: '',
      balcony: '',
      bathroom: '',
      windows: '',
      view: '',
      hasElevator: false,
      address: '',
      shortDescription: '',
      fullDescription: '',
      encumbrance: false,
      mortgagePossible: false,
      readyToMove: false,
      bargaining: true,
      ownership: '',
    },
  });

  const selectedPropertyType = watch('propertyTypeId');
  const isResidential = selectedPropertyType === '1'; // ← замените на реальный ID "Жилая"

  // Загрузка справочников
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    const fetchData = async () => {
      try {
        const [ops, ptypes, htypes] = await Promise.all([
          axios.get(`${API_URL}/api/references/operations`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/references/property-types`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/references/housing-types`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setOperations(ops.data.data || []);
        setPropertyTypes(ptypes.data.data || []);
        setHousingTypes(htypes.data.data || []);
      } catch (err) {
        setRefsError('Не удалось загрузить справочники');
        console.error(err);
      } finally {
        setLoadingRefs(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Фильтрация housingTypes по выбранному propertyType (если бэкенд этого не делает)
  useEffect(() => {
    if (selectedPropertyType) {
      // Если у housingTypes есть поле propertyTypeId — фильтруем
      const filtered = housingTypes.filter(
        ht => !ht.propertyTypeId || String(ht.propertyTypeId) === selectedPropertyType
      );
      setFilteredHousingTypes(filtered);
    } else {
      setFilteredHousingTypes([]);
    }
  }, [selectedPropertyType, housingTypes]);

  const onSubmit = async (formData) => {
    console.log("Данные из формы (сырые):", formData);
    setLoading(true);
    setServerError(null);

    const data = new FormData();

    // Явно приводим типы к тому, что ожидает сервер
    const preparedData = {
      ...formData,
      operationId:       formData.operationId       ? Number(formData.operationId)       : undefined,
      propertyTypeId:    formData.propertyTypeId    ? Number(formData.propertyTypeId)    : undefined,
      housingTypeId:     formData.housingTypeId     ? Number(formData.housingTypeId)     : undefined,
      price:             formData.price             ? Number(formData.price)             : undefined,
      area:              formData.area              ? Number(formData.area)              : undefined,
      totalArea:         formData.totalArea         ? Number(formData.totalArea)         : undefined,
      livingArea:        formData.livingArea        ? Number(formData.livingArea)        : undefined,
      kitchenArea:       formData.kitchenArea       ? Number(formData.kitchenArea)       : undefined,
      rooms:             formData.rooms             ? Number(formData.rooms)             : undefined,
      floor:             formData.floor             ? Number(formData.floor)             : undefined,
      totalFloors:       formData.totalFloors       ? Number(formData.totalFloors)       : undefined,
      renovationYear:    formData.renovationYear    ? Number(formData.renovationYear)    : undefined,

      hasElevator:       formData.hasElevator       === true,
      encumbrance:       formData.encumbrance       === true,
      mortgagePossible:  formData.mortgagePossible  === true,
      readyToMove:       formData.readyToMove       === true,
      bargaining:        formData.bargaining        === true,
    };

    // Добавляем подготовленные данные
    Object.entries(preparedData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        data.append(key, value);
      }
    });

    // Файлы
    images.forEach(file => {
      data.append('images', file);
    });

    try {
      const res = await axios.post(
        `${API_URL}/api/properties`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (res.data.success) {
        alert('Объект успешно добавлен');
        reset();
        setImages([]);
        setImagePreviews([]);
        navigate('/admin/properties');
      }
    } catch (err) {
      console.error("Ошибка при создании объекта:", err);
      console.log("Ответ сервера:", err.response?.data);

      setServerError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        err.message ||
        'Ошибка при сохранении объекта'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);

    // cleanup
    return () => {
      newPreviews.forEach(URL.revokeObjectURL);
    };
  };

  if (loadingRefs) return <div className="admin-loading">Загрузка справочников...</div>;
  if (refsError) return <div className="admin-error">{refsError}</div>;

  return (
    <div className="admin-add-property-page">
      {Object.keys(errors).length > 0 && (
        <div className="form-errors-block">
          <p>Проверьте обязательные поля:</p>
          <ul>
            {Object.entries(errors).map(([key, err]) => (
              <li key={key}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="admin-header">
        <h1>Добавить новый объект недвижимости</h1>
      </div>

      {serverError && (
        <div className="server-error-message">{serverError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="property-create-form">

        {/* Блок 1 — Основная классификация */}
        <fieldset className="form-section">
          <legend>Классификация объекта</legend>

          <div className="form-row">
            <div className="form-group">
              <label>Тип операции *</label>
              <select {...register('operationId')}>
                <option value="">— выберите —</option>
                {operations.map(op => (
                  <option key={op.id} value={op.id}>{op.name}</option>
                ))}
              </select>
              {errors.operationId && <span className="field-error">{errors.operationId.message}</span>}
            </div>

            <div className="form-group">
              <label>Тип недвижимости *</label>
              <select {...register('propertyTypeId')}>
                <option value="">— выберите —</option>
                {propertyTypes.map(pt => (
                  <option key={pt.id} value={pt.id}>{pt.name}</option>
                ))}
              </select>
              {errors.propertyTypeId && <span className="field-error">{errors.propertyTypeId.message}</span>}
            </div>
          </div>

          {filteredHousingTypes.length > 0 && (
            <div className="form-group">
              <label>Тип жилья</label>
              <select {...register('housingTypeId')}>
                <option value="">— не выбран —</option>
                {filteredHousingTypes.map(ht => (
                  <option key={ht.id} value={ht.id}>{ht.name}</option>
                ))}
              </select>
            </div>
          )}
        </fieldset>

        {/* Блок 2 — Цена и площади */}
        <fieldset className="form-section">
          <legend>Цена и площади</legend>

          <div className="form-row">
            <div className="form-group">
              <label>Цена (₽) *</label>
              <input type="number" {...register('price')} />
              {errors.price && <span className="field-error">{errors.price.message}</span>}
            </div>

            <div className="form-group">
              <label>Общая площадь (м²)</label>
              <input type="number" step="0.1" {...register('totalArea')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Жилая площадь (м²)</label>
              <input type="number" step="0.1" {...register('livingArea')} />
            </div>

            <div className="form-group">
              <label>Площадь кухни (м²)</label>
              <input type="number" step="0.1" {...register('kitchenArea')} />
            </div>
          </div>

          <div className="form-group">
            <label>Площадь по документам / указанная (м²)</label>
            <input type="number" step="0.1" {...register('area')} />
          </div>
        </fieldset>

        {/* Блок 3 — Параметры квартиры (условно жилые) */}
        {isResidential && (
          <fieldset className="form-section">
            <legend>Параметры квартиры / дома</legend>

            <div className="form-row">
              <div className="form-group">
                <label>Комнат</label>
                <input type="number" min="0" {...register('rooms')} />
              </div>

              <div className="form-group">
                <label>Этаж / всего этажей</label>
                <div className="inline-fields">
                  <input type="number" placeholder="Этаж" {...register('floor')} />
                  <span>/</span>
                  <input type="number" placeholder="Всего" {...register('totalFloors')} />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Состояние</label>
                <select {...register('condition')}>
                  <option value="">— не указано —</option>
                  <option value="Без ремонта">Без ремонта</option>
                  <option value="Требует ремонта">Требует ремонта</option>
                  <option value="Косметический">Косметический</option>
                  <option value="С ремонтом">С ремонтом</option>
                  <option value="Евроремонт">Евроремонт</option>
                  <option value="Дизайнерский">Дизайнерский</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ремонт / год</label>
                <div className="inline-fields">
                  <select {...register('renovation')}>
                    <option value="">—</option>
                    <option value="Без ремонта">Без ремонта</option>
                    <option value="Косметический">Косметический</option>
                    <option value="Евроремонт">Евроремонт</option>
                    <option value="Дизайнерский">Дизайнерский</option>
                  </select>
                  <input type="number" placeholder="Год" {...register('renovationYear')} />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Санузел</label>
                <select {...register('bathroom')}>
                  <option value="">—</option>
                  <option value="Совмещённый">Совмещённый</option>
                  <option value="Раздельный">Раздельный</option>
                  <option value="2 санузла">2 санузла</option>
                  <option value="3+ санузла">3+ санузла</option>
                </select>
              </div>

              <div className="form-group">
                <label>Балкон / лоджия</label>
                <select {...register('balcony')}>
                  <option value="">—</option>
                  <option value="Нет">Нет</option>
                  <option value="Балкон">Балкон</option>
                  <option value="Лоджия">Лоджия</option>
                  <option value="Два балкона">Два балкона</option>
                  <option value="Две лоджии">Две лоджии</option>
                </select>
              </div>
            </div>

            <div className="form-row checkbox-row">
              <label className="checkbox-label">
                <input type="checkbox" {...register('hasElevator')} />
                Есть лифт
              </label>

              <label className="checkbox-label">
                <input type="checkbox" {...register('readyToMove')} />
                Готово к заселению
              </label>
            </div>

            <div className="form-row checkbox-row">
              <label className="checkbox-label">
                <input type="checkbox" {...register('mortgagePossible')} />
                Возможна ипотека
              </label>

              <label className="checkbox-label">
                <input type="checkbox" {...register('bargaining')} />
                Торг уместен
              </label>
            </div>
          </fieldset>
        )}

        {/* Блок 4 — Адрес, координаты, описание */}
        <fieldset className="form-section">
          <legend>Местоположение и описание</legend>

          <div className="form-group full-width">
            <label>Адрес *</label>
            <input
              type="text"
              placeholder="Например: г. Симферополь, ул. Киевская, 12"
              {...register('address')}
            />
            {errors.address && <span className="field-error">{errors.address.message}</span>}
            <small className="form-hint">
              Координаты будут определены автоматически
            </small>
          </div>

          <div className="form-group">
            <label>Краткое описание (до 500 символов)</label>
            <textarea {...register('shortDescription')} rows={3} maxLength={500} />
          </div>

          <div className="form-group">
            <label>Полное описание</label>
            <textarea {...register('fullDescription')} rows={10} />
          </div>
        </fieldset>

        {/* Блок 5 — Фотографии */}
        <fieldset className="form-section">
          <legend>Фотографии</legend>
          <div className="form-group">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
            />
            {imagePreviews.length > 0 && (
              <div className="image-preview-container">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="preview-item">
                    <img src={src} alt={`preview ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </fieldset>

        {/* Кнопка отправки */}
        <div className="form-actions">
          <button
            type="submit"                    // ← возвращаем submit
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Сохранение...' : 'Создать объект'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddProperty;