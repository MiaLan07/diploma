// src/pages/Admin/AdminAddProperty.jsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ── Схема валидации с условной логикой
const schema = yup.object({
  operationId: yup.number().integer().positive().required('Выберите тип операции'),
  propertyTypeId: yup.number().integer().positive().required('Выберите тип недвижимости'),
  housingTypeId: yup.number().integer().positive().nullable(),
  
  price: yup.number().positive().required('Укажите цену').min(100000, 'Слишком низкая цена'),
  area: yup.number().positive().nullable().min(10, 'Площадь слишком мала'),
  
  // Условные поля — только для жилой недвижимости (предположим, что id жилой = 1)
  rooms: yup.number().when('propertyTypeId', {
    is: 1, // ← замените на реальный ID "Жилая"
    then: (s) => s.integer().min(0).max(10).required('Укажите количество комнат'),
    otherwise: (s) => s.nullable(),
  }),
  floor: yup.number().when('propertyTypeId', {
    is: 1,
    then: (s) => s.integer().min(-5).max(100).nullable(),
    otherwise: (s) => s.nullable(),
  }),
  condition: yup.string().when('propertyTypeId', {
    is: 1,
    then: (s) => s.oneOf(['Без ремонта', 'Косметический', 'Евроремонт', 'Дизайнерский']).nullable(),
    otherwise: (s) => s.nullable(),
  }),
  parking: yup.string().when('propertyTypeId', {
    is: 1,
    then: (s) => s.oneOf(['Нет', 'Открытая', 'Подземная', 'Гараж']).nullable(),
    otherwise: (s) => s.nullable(),
  }),
  hasElevator: yup.boolean().when('propertyTypeId', {
    is: 1,
    then: (s) => s.nullable(),
    otherwise: (s) => s.nullable(),
  }),
  yearBuilt: yup.number().when('propertyTypeId', {
    is: 1,
    then: (s) => s.integer().min(1900).max(new Date().getFullYear() + 5).nullable(),
    otherwise: (s) => s.nullable(),
  }),

  address: yup.string().trim().required('Укажите адрес'),
  shortDescription: yup.string().trim().max(500),
  fullDescription: yup.string().trim().max(5000),

  // Для карты (опционально)
  latitude: yup.number().nullable(),
  longitude: yup.number().nullable(),
}).required();

const AdminAddProperty = () => {
  const navigate = useNavigate();
  const [operations, setOperations] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [housingTypes, setHousingTypes] = useState([]);
  const [filteredHousingTypes, setFilteredHousingTypes] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [refsError, setRefsError] = useState(null);

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
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
    defaultValues: {
      operationId: '',
      propertyTypeId: '',
      housingTypeId: '',
      price: '',
      area: '',
      rooms: '',
      floor: '',
      condition: '',
      parking: '',
      hasElevator: false,
      yearBuilt: '',
      address: '',
      shortDescription: '',
      fullDescription: '',
      latitude: '',
      longitude: '',
    },
  });

  const selectedPropertyType = watch('propertyTypeId');

  // Загрузка справочников + авторизация
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth'); // или ваш маршрут авторизации
      return;
    }

    const fetchReferences = async () => {
      try {
        const [opsRes, typesRes, housingRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/references/operations`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/references/property-types`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/references/housing-types`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setOperations(opsRes.data.data || []);
        setPropertyTypes(typesRes.data.data || []);
        setHousingTypes(housingRes.data.data || []);
      } catch (err) {
        setRefsError('Не удалось загрузить справочники');
        console.error(err);
      } finally {
        setLoadingRefs(false);
      }
    };

    fetchReferences();
  }, [navigate]);

  // Фильтрация подтипов жилья по выбранному типу недвижимости
  useEffect(() => {
    if (selectedPropertyType) {
      // Предполагаем, что у HousingType есть связь с PropertyType
      // Если бэкенд не фильтрует — фильтруем здесь (но лучше на бэкенде)
      const filtered = housingTypes.filter(ht => 
        // Если есть поле propertyTypeId в housingTypes — используйте его
        // Иначе придётся добавить логику на бэкенде
        true // ← пока все, доработайте по реальной структуре
      );
      setFilteredHousingTypes(filtered);
    } else {
      setFilteredHousingTypes([]);
    }
  }, [selectedPropertyType, housingTypes]);

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    images.forEach(file => formData.append('images', file));

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/properties`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (res.data.success) {
        alert('Объект добавлен!');
        reset();
        setImages([]);
        setImagePreviews([]);
        navigate('/admin/properties'); // ← список объектов
      }
    } catch (err) {
      console.error(err);
      setServerError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Ошибка сервера'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // Превью
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);

    // Очистка при размонтировании
    return () => previews.forEach(URL.revokeObjectURL);
  };

  if (loadingRefs) return <div className="loading">Загрузка...</div>;
  if (refsError) return <div className="error">{refsError}</div>;

  const isResidential = selectedPropertyType === 1; // ← подставьте реальный ID "Жилая"

  return (
    <div className="admin-add-property">
      <h1>Добавить объект недвижимости</h1>

      {serverError && <div className="error-message server-error">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="property-form">

        {/* Тип операции */}
        <div className="form-group">
          <label>Тип операции *</label>
          <select {...register('operationId')}>
            <option value="">Выберите...</option>
            {operations.map(op => (
              <option key={op.id} value={op.id}>{op.name}</option>
            ))}
          </select>
          {errors.operationId && <span className="error">{errors.operationId.message}</span>}
        </div>

        {/* Тип недвижимости */}
        <div className="form-group">
          <label>Тип недвижимости *</label>
          <select {...register('propertyTypeId')}>
            <option value="">Выберите...</option>
            {propertyTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          {errors.propertyTypeId && <span className="error">{errors.propertyTypeId.message}</span>}
        </div>

        {/* Подтип жилья — только если выбран жилой тип */}
        {isResidential && (
          <div className="form-group">
            <label>Подтип жилья</label>
            <select {...register('housingTypeId')}>
              <option value="">Не выбран</option>
              {filteredHousingTypes.map(ht => (
                <option key={ht.id} value={ht.id}>{ht.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Основные поля */}
        <div className="form-group">
          <label>Цена (₽) *</label>
          <input type="number" {...register('price')} />
          {errors.price && <span className="error">{errors.price.message}</span>}
        </div>

        <div className="form-group">
          <label>Площадь (м²)</label>
          <input type="number" step="0.01" {...register('area')} />
        </div>

        {isResidential && (
          <>
            <div className="form-group">
              <label>Количество комнат *</label>
              <input type="number" {...register('rooms')} />
              {errors.rooms && <span className="error">{errors.rooms.message}</span>}
            </div>

            <div className="form-group">
              <label>Этаж</label>
              <input type="number" {...register('floor')} />
            </div>

            <div className="form-group">
              <label>Состояние</label>
              <select {...register('condition')}>
                <option value="">Не указано</option>
                <option value="Без ремонта">Без ремонта</option>
                <option value="Косметический">Косметический</option>
                <option value="Евроремонт">Евроремонт</option>
                <option value="Дизайнерский">Дизайнерский</option>
              </select>
            </div>

            <div className="form-group">
              <label>Парковка</label>
              <select {...register('parking')}>
                <option value="">Не указано</option>
                <option value="Нет">Нет</option>
                <option value="Открытая">Открытая</option>
                <option value="Подземная">Подземная</option>
                <option value="Гараж">Гараж</option>
              </select>
            </div>

            <div className="form-group checkbox">
              <label>
                <input type="checkbox" {...register('hasElevator')} />
                Есть лифт
              </label>
            </div>

            <div className="form-group">
              <label>Год постройки</label>
              <input type="number" {...register('yearBuilt')} />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Адрес *</label>
          <input type="text" {...register('address')} />
          {errors.address && <span className="error">{errors.address.message}</span>}
        </div>

        {/* Координаты (можно интегрировать с Яндекс.Картами позже) */}
        <div className="form-row">
          <div className="form-group half">
            <label>Широта (latitude)</label>
            <input type="number" step="any" {...register('latitude')} />
          </div>
          <div className="form-group half">
            <label>Долгота (longitude)</label>
            <input type="number" step="any" {...register('longitude')} />
          </div>
        </div>

        <div className="form-group">
          <label>Краткое описание</label>
          <textarea {...register('shortDescription')} rows={3} />
        </div>

        <div className="form-group">
          <label>Полное описание</label>
          <textarea {...register('fullDescription')} rows={8} />
        </div>

        <div className="form-group">
          <label>Фотографии (несколько)</label>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
          />
          {imagePreviews.length > 0 && (
            <div className="image-previews">
              {imagePreviews.map((src, idx) => (
                <img key={idx} src={src} alt={`preview-${idx}`} width={120} />
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Сохранение...' : 'Добавить объект'}
        </button>
      </form>
    </div>
  );
};

export default AdminAddProperty;