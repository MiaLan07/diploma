// src/pages/Admin/AdminAddProperty.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const schema = yup.object({
  operationId: yup.number().integer().positive().required('Выберите тип операции'),
  propertyTypeId: yup.number().integer().positive().required('Выберите тип недвижимости'),
  housingTypeId: yup.number().integer().positive().nullable(),
  price: yup.number().positive().required('Укажите цену').min(100000, 'Слишком низкая цена'),
  area: yup.number().positive().nullable(),
  rooms: yup.number().integer().min(0).nullable(),
  floor: yup.number().integer().nullable(),
  address: yup.string().trim().required('Укажите адрес'),
  shortDescription: yup.string().trim().max(500),
  fullDescription: yup.string().trim().max(5000),
  latitude: yup.number().required('Укажите широту').min(-90).max(90).nullable(),
  longitude: yup.number().required('Укажите долготу').min(-180).max(180).nullable(),
}).required();

const AdminAddProperty = () => {
  const navigate = useNavigate();
  const [operations, setOperations] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [housingTypes, setHousingTypes] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [refsError, setRefsError] = useState(null);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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
      address: '',
      shortDescription: '',
      fullDescription: '',
      latitude: 44.95,
      longitude: 34.10,
    },
  });

  // Проверка авторизации и админ-прав
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Загрузка справочников
    const fetchReferences = async () => {
      try {
        const [opsRes, typesRes, housingRes] = await Promise.all([
          axios.get('http://localhost:5000/api/references/operations', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/references/property-types', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/references/housing-types', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setOperations(opsRes.data.data || []);
        setPropertyTypes(typesRes.data.data || []);
        setHousingTypes(housingRes.data.data || []);
      } catch (err) {
        setRefsError('Не удалось загрузить справочники. Попробуйте позже.');
        console.error(err);
      } finally {
        setLoadingRefs(false);
      }
    };

    fetchReferences();
  }, [navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);

    const formData = new FormData();

    // Добавляем все поля формы
    Object.keys(data).forEach((key) => {
      if (key !== 'images' && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });

    // Добавляем файлы
    images.forEach((file) => {
      formData.append('images', file);
    });

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
        alert('Объект успешно добавлен!');
        reset();
        setImages([]);
        // Можно перенаправить на список объектов
        // navigate('/admin/properties');
      }
    } catch (err) {
      console.error('Ошибка добавления:', err);
      setServerError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.message ||
          'Ошибка при добавлении объекта'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  if (loadingRefs) {
    return <div className="loading">Загрузка справочников...</div>;
  }

  if (refsError) {
    return <div className="error-message">{refsError}</div>;
  }

  return (
    <div className="admin-add-property">
      <h1>Добавить объект недвижимости</h1>

      {serverError && <div className="error-message">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Тип операции */}
        <div>
          <label>Тип операции *</label>
          <select {...register('operationId')}>
            <option value="">Выберите...</option>
            {operations.map((op) => (
              <option key={op.id} value={op.id}>
                {op.name}
              </option>
            ))}
          </select>
          {errors.operationId && <span>{errors.operationId.message}</span>}
        </div>

        {/* Тип недвижимости */}
        <div>
          <label>Тип недвижимости *</label>
          <select {...register('propertyTypeId')}>
            <option value="">Выберите...</option>
            {propertyTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {errors.propertyTypeId && <span>{errors.propertyTypeId.message}</span>}
        </div>

        {/* Подтип жилья */}
        <div>
          <label>Подтип жилья</label>
          <select {...register('housingTypeId')}>
            <option value="">Не выбран</option>
            {housingTypes.map((ht) => (
              <option key={ht.id} value={ht.id}>
                {ht.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Цена (₽) *</label>
          <input type="number" {...register('price')} />
          {errors.price && <span>{errors.price.message}</span>}
        </div>

        <div>
          <label>Площадь (м²)</label>
          <input type="number" step="0.01" {...register('area')} />
        </div>

        <div>
          <label>Количество комнат</label>
          <input type="number" {...register('rooms')} />
        </div>

        <div>
          <label>Этаж</label>
          <input type="number" {...register('floor')} />
        </div>

        <div>
          <label>Адрес *</label>
          <input type="text" {...register('address')} />
          {errors.address && <span>{errors.address.message}</span>}
        </div>

        <div>
          <label>Краткое описание</label>
          <textarea {...register('shortDescription')} rows={3} />
        </div>

        <div>
          <label>Полное описание</label>
          <textarea {...register('fullDescription')} rows={6} />
        </div>

        <div>
          <label>Широта (latitude) *</label>
          <input type="number" step="any" {...register('latitude')} disabled/>
          {errors.latitude && <span>{errors.latitude.message}</span>}
        </div>

        <div>
          <label>Долгота (longitude) *</label>
          <input type="number" step="any" {...register('longitude')} disabled/>
          {errors.longitude && <span>{errors.longitude.message}</span>}
        </div>

        <div>
          <label>Фотографии (можно несколько)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
          {images.length > 0 && <p>Выбрано файлов: {images.length}</p>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Добавление...' : 'Добавить объект'}
        </button>
      </form>
    </div>
  );
};

export default AdminAddProperty;