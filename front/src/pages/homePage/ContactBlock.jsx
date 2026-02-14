// src/components/ContactBlock.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import './ContactBlock.css';
import { ReactComponent as IconMessage } from '../../assets/message2.svg'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ContactBlock = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await axios.post(`${API_URL}/api/requests`, {
        name: data.name,
        phone: data.phone,
        comment: data.comment || 'Обратная связь с сайта',
      });

      alert('Спасибо! Мы свяжемся с вами в ближайшее время.');
      reset();
    } catch (err) {
      console.error(err);
      alert('Произошла ошибка. Попробуйте позже или позвоните нам напрямую.');
    }
  };

  return (
    <section className="contact-section">
      <h2 className="section-title">СВЯЖИТЕСЬ С НАМИ</h2>
      <p className="contact-subtitle">Ваша будущая квартира, уютный дом или выгодная продажа &ndash; всё начинается с&nbsp;разговора. Наша команда экспертов по недвижимости готова стать вашим надёжным проводником на&nbsp;каждом этапе.</p>
      <div className="contact-container">
        <div className="contact-info">

          <div className="contact-methods">
            <div className="method-item">
              <h3>Позвоните нам&nbsp;
                <a href="tel:+79784577889" className="phone-link">
                  +7 (978) 457-78-89
                </a>
              </h3>
              <p className="method-desc">
                Живой разговор с экспертом, который поймёт вашу задачу с полуслова.
              </p>
            </div>

            <div className="method-item">
              <h3>Напишите нам&nbsp;
                <a href="mailto:question@homehere.est" className="email-link">
                  question@homehere.est
                </a>
              </h3>
              
              <p className="method-desc">
                Отправьте свой вопрос, и мы ответим подробно и чётко в течение 2-х часов.
              </p>
            </div>

            <div className="method-item">
              <h3>Приходите в гости</h3>
              <p className="address">
                <strong>Адрес: </strong>г. Симферополь, ул. Гаспринского, д. 3
              </p>
              <p className="how-to-get">
                <strong>Как найти: </strong> 10 минут пешком от центрального автовокзала
              </p>
              <p className="schedule">
                <strong className='title'>График работы:</strong><br />
                <strong>Пн–Пт:</strong> 09:00 – 20:00<br />
                <strong>Сб–Вс:</strong> 10:00 – 18:00
              </p>
              <p className="form-hint">
                Не нашли нужный способ связи? Используйте форму обратной связи, и мы сами вам перезвоним
              </p>
            </div>
          </div>
        </div>

        {/* Форма обратной связи */}
        <div className="contact-form-wrapper">
          <h3 className="form-title">Получим ваш номер телефона и свяжемся с вами</h3>

          <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
            <div className="form-group">
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Укажите ваше имя' })}
                placeholder="Имя"
              />
              {errors.name && <span className="error">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <input
                id="phone"
                type="tel"
                {...register('phone', {
                  required: 'Укажите номер телефона',
                  pattern: {
                    value: /^\+?\d{10,15}$/,
                    message: 'Некорректный формат номера',
                  },
                })}
                placeholder="Номер телефона"
              />
              {errors.phone && <span className="error">{errors.phone.message}</span>}
            </div>

            <div className="form-group">
              <textarea
                id="comment"
                {...register('comment')}
                placeholder="Комментарий"
                rows={1}
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              <p>{isSubmitting ? 'Отправка...' : 'ОБРАТНАЯ СВЯЗЬ'}</p>
              <div className='icon-btn'>
                <IconMessage width={35} height={35} />
              </div>
            </button>
          </form>

        </div>
      </div>
    </section>
  );
};

export default ContactBlock;