// src/components/FooterContact.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { ReactComponent as MessageIcon } from '../../assets/message2.svg';
import { ReactComponent as LogoIcon } from '../../assets/logo_white1.svg';
import { YMaps, Map, Placemark, ZoomControl } from '@mr-igorinni/react-yandex-maps-fork';
import './Footer.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_YANDEX_MAP = process.env.REACT_APP_YANDEX_MAPS_API_KEY;
const OFFICE_COORDINATES = [44.949532, 34.116685];

const Footer = ({ backForm = false }) => {
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
        comment: data.comment || 'Сообщение из футера',
        type: 'footer_contact',
      });

      alert('Спасибо! Мы свяжемся с вами в ближайшее время.');
      reset();
    } catch (err) {
      console.error(err);
      alert('Ошибка отправки. Попробуйте позже или позвоните нам.');
    }
  };

  return (
    <footer className="footer-contact">
      <div className="footer-contact-container" style={{
      gridTemplateColumns: backForm 
        ? "minmax(380px, 1fr) 1fr minmax(320px, 420px)"
        : "minmax(380px, 1fr) 1fr"
        }}>
        <div className="footer-map-column">
          <div className="map-wrapper">
            <YMaps query={{ lang: 'ru_RU', apikey: API_YANDEX_MAP }}>
              <Map
                className="footer-map"
                defaultState={{
                  center: OFFICE_COORDINATES,
                  zoom: 15,
                  controls: [],
                }}
                modules={['geoObject.addon.balloon']}
              >
                <Placemark
                  geometry={OFFICE_COORDINATES}
                  options={{
                    preset: 'islands#darkGreenDotIcon',
                  }}
                  properties={{
                    balloonContent: `
                      <div style="font-weight: bold; margin-bottom: 8px;">
                        Дом Здесь — Агентство недвижимости
                      </div>
                      <div>г. Симферополь, ул. Гаспринского, д. 3</div>
                      <div>10 мин пешком от автовокзала</div>
                    `,
                  }}
                />

                {/* Управление масштабом */}
                <ZoomControl options={{ position: { right: 16, top: 16 } }} />
              </Map>
            </YMaps>
          </div>
        </div>

        <div className="footer-info-column">
          <div className="contact-info-block">
            <a className="logo-overlay" href='/'>
              <LogoIcon width={70} height={70} />
              <span>ДОМ ЗДЕСЬ</span>
            </a>
            <div className="contact-item">
              <span className="label">Телефон</span>
              <a href="tel:+79784577889" className="value phone">
                +7 (978) 457-78-89
              </a>
            </div>

            <div className="contact-item">
              <span className="label">Почта</span>
              <a href="mailto:question@homehere.est" className="value email">
                question@homehere.est
              </a>
            </div>

            <div className="contact-item">
              <span className="label">Адрес</span>
              <div className="value">
                г. Симферополь, ул. Гаспринского, д. 3<br />
                <span className="small">
                  10 минут пешком от центрального автовокзала
                </span>
              </div>
            </div>

            <div className="contact-item">
              <span className="label">График</span>
              <div className="value schedule">
                Пн–Пт: 09:00 – 20:00<br />
                Сб–Вс: 10:00 – 18:00
              </div>
            </div>
          </div>

          {/* Копирайт и разработчик */}
          <div className="footer-meta">
            <p className="copyright">© Все права защищены, 2026</p>
            <p className="developer">
              Разработчик веб-сайта Ландарь Мария
            </p>
          </div>

          <div className="footer-links-row">
            <a href="/catalog">КАТАЛОГ</a>
            <a href="/about">О КОМПАНИИ</a>
            <a href="/team">КОМАНДА</a>
            <a href="/reviews">ОТЗЫВЫ</a>
            <a href="/contacts">КОНТАКТЫ</a>
            <a href="/privacy">Политика конфиденциальности</a>
          </div>
        </div>

        {/* 3. Форма обратной связи справа (только если backForm=true) */}
        {backForm && (
          <div className="footer-form-column">
            <div className="form-wrapper">
              <h3 className="form-title">
                Получим ваш номер<br />
                и свяжемся с вами
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="footer-form">
                <div className="form-group">
                  <input
                    placeholder="Имя"
                    {...register('name', { required: 'Укажите имя' })}
                  />
                  {errors.name && (
                    <span className="form-error">{errors.name.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <input
                    placeholder="Номер телефона"
                    {...register('phone', {
                      required: 'Укажите телефон',
                      pattern: {
                        value: /^\+?\d{10,15}$/,
                        message: 'Неверный формат',
                      },
                    })}
                  />
                  {errors.phone && (
                    <span className="form-error">{errors.phone.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <textarea
                    placeholder="Комментарий"
                    rows={1}
                    {...register('comment')}
                  />
                </div>

                <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                >
                    <p>{isSubmitting ? 'Отправка...' : 'ОБРАТНАЯ СВЯЗЬ'}</p>
                    <div className='icon-btn'>
                        <MessageIcon width={35} height={35} />
                    </div>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </footer>
  )
};

export default Footer;