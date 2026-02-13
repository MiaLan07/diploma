// src/components/ConsultationBlock.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ConsultationBlock.css';
import { ReactComponent as MessageIcon } from '../../assets/message2.svg'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ConsultationBlock = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [status, setStatus] = useState(''); // success / error / idle
  const [bgImage, setBgImage] = useState('/fallback-hero.jpg'); // запасное изображение
    useEffect(() => {
      const loadBackground = async () => {
        try {
          const response = await axios.get(`${API_URL}/images/HugeForm.jpg`, {
            responseType: 'blob',
          });
          const imageUrl = URL.createObjectURL(response.data);
          setBgImage(imageUrl);
        } catch (error) {
          console.error('Не удалось загрузить фоновое изображение:', error);
        }
      };
      loadBackground();
      return () => {
        if (bgImage.startsWith('blob:')) {
          URL.revokeObjectURL(bgImage);
        }
      };
    }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');

    try {
      await axios.post(`${API_URL}/api/requests/consultation`, {
        name: formData.name,
        phone: formData.phone,
        type: 'consultation',
      });

      setStatus('success');
      setFormData({ name: '', phone: '' });
    } catch (err) {
      console.error('Ошибка отправки заявки:', err);
      setStatus('error');
    }
  };

  return (
    <section className="consultation-block">
      <div className="consultation-container" style={{ backgroundImage: `url(${bgImage})` }}>
        {/* Правая часть — форма */}
        <div className="consultation-form-wrapper">
          <div className="consultation-form">
            <h2>
              Проведём <span className="accent">БЕСПЛАТНУЮ</span><br />
              консультацию по подбору<br />
              недвижимости
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Имя</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ваше имя"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Номер телефона</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+7 (___) ___-__-__"
                  required
                />
              </div>

              <button type="submit" className="submit-btn">
                <p>
                  КОНСУЛЬТАЦИЯ
                </p>
                <div className='icon-btn'>
                  <MessageIcon width={35} height={35} />
                </div>
              </button>

              {status === 'success' && (
                <p className="status success">Заявка отправлена! Мы свяжемся с вами в ближайшее время.</p>
              )}
              {status === 'error' && (
                <p className="status error">Произошла ошибка. Попробуйте позже или позвоните нам.</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultationBlock;