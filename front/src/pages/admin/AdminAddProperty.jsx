// src/pages/Admin/AdminAddProperty.jsx
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import './AdminAddProperty.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ────────────────────────────────────────────────
// Схема валидации (только действительно обязательные поля)
// ────────────────────────────────────────────────
const schema = yup.object({
  title:            yup.string().max(120).required('Укажите заголовок объявления'),
  operationId:      yup.number().integer().positive().required('Выберите тип операции'),
  propertyTypeId:   yup.number().integer().positive().required('Выберите тип недвижимости'),
  housingTypeId:    yup.number().integer().positive().nullable(),

  price:            yup.number().positive().required('Укажите цену').min(100000),
  area:             yup.number().positive().nullable().min(5),

  totalArea:        yup.number().positive().nullable().min(5),
  livingArea:       yup.number().positive().nullable().min(5),
  kitchenArea:      yup.number().positive().nullable().min(3),

  roomsCount:       yup.number().integer().min(0).max(20).nullable(), // общее кол-во комнат (для быстрого фильтра)

  floor:            yup.number().integer().min(-10).max(150).nullable(),
  totalFloors:      yup.number().integer().min(1).max(150).nullable(),

  buildingType:     yup.string().max(100).nullable(),
  condition:        yup.string().max(100).nullable(),
  renovation:       yup.string().max(100).nullable(),
  renovationYear:   yup.number().integer().min(1900).max(2030).nullable(),

  parking:          yup.string().max(50).nullable(),
  balcony:          yup.string().max(100).nullable(),
  bathroom:         yup.string().max(100).nullable(),
  windows:          yup.string().max(100).nullable(),
  view:             yup.string().max(100).nullable(),
  ownership:        yup.string().max(100).nullable(),

  hasElevator:      yup.boolean().nullable(),
  yearBuilt:        yup.number().integer().min(1800).max(2030).nullable(),

  address:          yup.string().trim().max(255).required('Укажите адрес'),
  shortDescription: yup.string().trim().max(500).nullable(),
  fullDescription:  yup.string().trim().max(10000).nullable(),

  buildingDescription:     yup.string().max(2000).nullable(),
  yearBuiltDescription:    yup.string().max(500).nullable(),
  environment:             yup.string().max(1000).nullable(),
  infrastructure:          yup.string().max(1000).nullable(),
  transportAccessibility:  yup.string().max(500).nullable(),
  communications:          yup.string().max(500).nullable(),
  legalPurity:             yup.string().max(500).nullable(),
  mortgageDescription:     yup.string().max(500).nullable(),
  livingDescription:       yup.string().max(1000).nullable(),

  encumbrance:      yup.boolean().nullable(),
  mortgagePossible: yup.boolean().nullable(),
  maternalCapital:  yup.boolean().nullable(),
  readyToMove:      yup.boolean().nullable(),
  bargaining:       yup.boolean().nullable(),

  // Комнаты — массив объектов
  rooms: yup.array().of(
    yup.object({
      type:        yup.string().required('Укажите тип комнаты'),
      area:        yup.number().positive().min(2).required('Укажите площадь комнаты'),
      description: yup.string().max(500).nullable(),
    })
  ).nullable(),
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
    control,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    shouldFocusError: false,
    defaultValues: {
      title: '',
      operationId: '',
      propertyTypeId: '',
      housingTypeId: null,
      price: '',
      area: '',
      totalArea: '',
      livingArea: '',
      kitchenArea: '',
      roomsCount: '',
      floor: '',
      totalFloors: '',
      buildingType: '',
      condition: '',
      renovation: '',
      renovationYear: '',
      parking: '',
      balcony: '',
      bathroom: '',
      windows: '',
      view: '',
      ownership: '',
      hasElevator: false,
      yearBuilt: '',
      address: '',
      shortDescription: '',
      fullDescription: '',
      buildingDescription: '',
      yearBuiltDescription: '',
      environment: '',
      infrastructure: '',
      transportAccessibility: '',
      communications: '',
      legalPurity: '',
      mortgageDescription: '',
      livingDescription: '',
      encumbrance: false,
      mortgagePossible: false,
      maternalCapital: false,
      readyToMove: false,
      bargaining: true,
      rooms: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rooms',
  });

  const selectedPropertyType = watch('propertyTypeId');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/auth');

    const fetchData = async () => {
      try {
        const [ops, ptypes, htypes] = await Promise.all([
          axios.get(`${API_URL}/api/references/operations`,     { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/references/property-types`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/references/housing-types`,  { headers: { Authorization: `Bearer ${token}` } }),
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

  useEffect(() => {
    if (!selectedPropertyType) {
      setFilteredHousingTypes([]);
      return;
    }
    // Приводим оба значения к числу для надёжного сравнения
    const filtered = housingTypes.filter(ht => 
      ht.propertyTypeId && Number(ht.propertyTypeId) === Number(selectedPropertyType)
    );
    setFilteredHousingTypes(filtered);
  }, [selectedPropertyType, housingTypes]);

  const onSubmit = async (formValues) => {
    setLoading(true);
    setServerError(null);

    const formData = new FormData();

    // Числовые поля
    [
      'operationId', 'propertyTypeId', 'housingTypeId', 'price', 'area',
      'totalArea', 'livingArea', 'kitchenArea', 'roomsCount', 'floor', 'totalFloors',
      'yearBuilt', 'renovationYear'
    ].forEach(field => {
      const val = formValues[field];
      if (val !== '' && val !== null && val !== undefined) {
        formData.append(field, Number(val));
      }
    });

    // Булевы поля
    [
      'hasElevator', 'encumbrance', 'mortgagePossible', 'maternalCapital',
      'readyToMove', 'bargaining'
    ].forEach(field => {
      formData.append(field, formValues[field] ? 'true' : 'false');
    });

    // Строки
    [
      'title', 'address', 'shortDescription', 'fullDescription',
      'buildingType', 'condition', 'renovation', 'parking', 'balcony',
      'bathroom', 'windows', 'view', 'ownership',
      'buildingDescription', 'yearBuiltDescription', 'environment',
      'infrastructure', 'transportAccessibility', 'communications',
      'legalPurity', 'mortgageDescription', 'livingDescription'
    ].forEach(field => {
      const val = formValues[field]?.trim();
      if (val) formData.append(field, val);
    });

    // Комнаты (массив)
    formValues.rooms?.forEach((room, index) => {
      formData.append(`rooms[${index}][type]`,        room.type);
      formData.append(`rooms[${index}][area]`,        Number(room.area));
      if (room.description?.trim()) {
        formData.append(`rooms[${index}][description]`, room.description.trim());
      }
    });

    // Изображения
    images.forEach(file => formData.append('images', file));

    try {
      const res = await axios.post(
        `${API_URL}/api/properties`,
        formData,
        {
          headers: {
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
      console.error('Ошибка создания объекта:', err);
      console.log('Ответ сервера:', err.response?.data);

      setServerError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        err.message ||
        'Ошибка сервера'
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
    return () => newPreviews.forEach(URL.revokeObjectURL);
  };

  if (loadingRefs) return <div className="admin-loading">Загрузка справочников...</div>;
  if (refsError) return <div className="admin-error">{refsError}</div>;

  return (
    <div className="admin-add-property-page">
      <div className="admin-header">
        <h1>Добавить объект недвижимости</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="property-create-form">

        {/* ── Основная информация ── */}
        <fieldset className="form-section">
          <legend>Основная информация</legend>

          <div className="form-group full-width">
            <label>Заголовок объявления *</label>
            <input
              type="text"
              placeholder="Например: 2-комн. квартира с ремонтом, 15 мин до центра"
              {...register('title')}
            />
            {errors.title && <span className="field-error">{errors.title.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Тип операции *</label>
              <select {...register('operationId', { valueAsNumber: true })}>
                <option value="">— выберите —</option>
                {operations.map(op => (
                  <option key={op.id} value={op.id}>{op.name}</option>
                ))}
              </select>
              {errors.operationId && <span className="field-error">{errors.operationId.message}</span>}
            </div>

            <div className="form-group">
              <label>Тип недвижимости *</label>
              <select {...register('propertyTypeId', { valueAsNumber: true })}>
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
              <select {...register('housingTypeId', { valueAsNumber: true })}>
                <option value="">— не выбран —</option>
                {filteredHousingTypes.map(ht => (
                  <option key={ht.id} value={ht.id}>{ht.name}</option>
                ))}
              </select>
            </div>
          )}
        </fieldset>

        {/* ── Цена и площади ── */}
        <fieldset className="form-section">
          <legend>Цена и площади</legend>

          <div className="form-row">
            <div className="form-group">
              <label>Цена (₽) *</label>
              <input type="number" {...register('price', { valueAsNumber: true })} />
              {errors.price && <span className="field-error">{errors.price.message}</span>}
            </div>

            <div className="form-group">
              <label>Общая площадь (м²)</label>
              <input type="number" step="0.1" {...register('totalArea', { valueAsNumber: true })} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Жилая площадь (м²)</label>
              <input type="number" step="0.1" {...register('livingArea', { valueAsNumber: true })} />
            </div>

            <div className="form-group">
              <label>Площадь кухни (м²)</label>
              <input type="number" step="0.1" {...register('kitchenArea', { valueAsNumber: true })} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Площадь по документам (м²)</label>
              <input type="number" step="0.1" {...register('area', { valueAsNumber: true })} />
            </div>

            <div className="form-group">
              <label>Количество комнат (общее)</label>
              <input type="number" min="0" {...register('roomsCount', { valueAsNumber: true })} />
            </div>
          </div>
        </fieldset>

        {/* ── Комнаты (динамический блок) ── */}
        <fieldset className="form-section">
          <legend>Комнаты</legend>

          {fields.map((field, index) => (
            <div key={field.id} className="room-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Тип комнаты *</label>
                  <select {...register(`rooms.${index}.type`)}>
                    <option value="">— выберите —</option>
                    <option value="kitchen">Кухня</option>
                    <option value="living_room">Гостиная</option>
                    <option value="bedroom">Спальня</option>
                    <option value="child_room">Детская</option>
                    <option value="office">Кабинет</option>
                    <option value="bathroom">Санузел</option>
                    <option value="balcony">Балкон/лоджия</option>
                    <option value="hallway">Прихожая</option>
                    <option value="storage">Кладовая</option>
                    <option value="other">Другое</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Площадь (м²) *</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register(`rooms.${index}.area`, { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Описание комнаты</label>
                <textarea {...register(`rooms.${index}.description`)} rows={2} />
              </div>

              <button
                type="button"
                className="btn-remove-room"
                onClick={() => remove(index)}
              >
                Удалить комнату
              </button>
            </div>
          ))}

          <button
            type="button"
            className="btn-add-room"
            onClick={() => append({ type: '', area: '', description: '' })}
          >
            + Добавить комнату
          </button>
        </fieldset>

        {/* ── Параметры дома и объекта ── */}
        <fieldset className="form-section">
          <legend>Параметры дома и объекта</legend>

          <div className="form-row">
            <div className="form-group">
              <label>Тип дома</label>
              <select {...register('buildingType')}>
                <option value="">— не указано —</option>
                <option value="Кирпичный">Кирпичный</option>
                <option value="Монолитный">Монолитный</option>
                <option value="Панельный">Панельный</option>
                <option value="Блочный">Блочный</option>
                <option value="Деревянный">Деревянный</option>
                <option value="Каркасный">Каркасный</option>
              </select>
            </div>

            <div className="form-group">
              <label>Этаж / всего этажей</label>
              <div className="inline-fields">
                <input type="number" placeholder="Этаж" {...register('floor', { valueAsNumber: true })} />
                <span>/</span>
                <input type="number" placeholder="Всего" {...register('totalFloors', { valueAsNumber: true })} />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Год постройки</label>
              <input type="number" {...register('yearBuilt', { valueAsNumber: true })} />
            </div>

            <div className="form-group">
              <label>Год последнего ремонта</label>
              <input type="number" {...register('renovationYear', { valueAsNumber: true })} />
            </div>
          </div>

          <div className="form-row checkbox-row">
            <label><input type="checkbox" {...register('hasElevator')} /> Есть лифт</label>
            <label><input type="checkbox" {...register('readyToMove')}    /> Можно заехать сразу</label>
            <label><input type="checkbox" {...register('mortgagePossible')} /> Возможна ипотека</label>
            <label><input type="checkbox" {...register('maternalCapital')}  /> Мат. капитал</label>
            <label><input type="checkbox" {...register('bargaining')}       /> Торг уместен</label>
          </div>
        </fieldset>

        {/* ── Адрес и описание ── */}
        <fieldset className="form-section">
          <legend>Адрес и описание</legend>

          <div className="form-group full-width">
            <label>Адрес *</label>
            <input type="text" {...register('address')} />
            {errors.address && <span className="field-error">{errors.address.message}</span>}
            <small>Координаты определятся автоматически</small>
          </div>

          <div className="form-group">
            <label>Краткое описание</label>
            <textarea {...register('shortDescription')} rows={3} maxLength={500} />
          </div>

          <div className="form-group">
            <label>Полное описание</label>
            <textarea {...register('fullDescription')} rows={10} />
          </div>
        </fieldset>

        {/* ── Дополнительные описания ── */}
        <fieldset className="form-section">
          <legend>Дополнительные характеристики</legend>

          <div className="form-group">
            <label>Описание дома / здания</label>
            <textarea {...register('buildingDescription')} rows={4} />
          </div>

          <div className="form-group">
            <label>Окружение</label>
            <textarea {...register('environment')} rows={3} />
          </div>

          <div className="form-group">
            <label>Инфраструктура</label>
            <textarea {...register('infrastructure')} rows={3} />
          </div>

          <div className="form-group">
            <label>Транспортная доступность</label>
            <textarea {...register('transportAccessibility')} rows={2} />
          </div>

          <div className="form-group">
            <label>Коммуникации</label>
            <textarea {...register('communications')} rows={2} />
          </div>

          <div className="form-group">
            <label>Юридическая чистота</label>
            <textarea {...register('legalPurity')} rows={2} />
          </div>

          <div className="form-group">
            <label>Описание ипотеки</label>
            <textarea {...register('mortgageDescription')} rows={2} />
          </div>

          <div className="form-group">
            <label>Особенности проживания</label>
            <textarea {...register('livingDescription')} rows={3} />
          </div>
        </fieldset>

        {/* ── Фотографии ── */}
        <fieldset className="form-section">
          <legend>Фотографии</legend>
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
        </fieldset>

        {/* ── Кнопка ── */}
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Сохранение...' : 'Создать объект'}
          </button>
        </div>
      </form>

      {Object.keys(errors).length > 0 && (
        <div className="form-errors-block">
          <p>Заполните обязательные поля:</p>
          <ul>
            {Object.entries(errors).map(([key, err]) => (
              <li key={key}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}

      {serverError && <div className="server-error-message">{serverError}</div>}
    </div>
  );
};

export default AdminAddProperty;