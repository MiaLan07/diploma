// src/components/ServicesSlider.jsx
import React, {useEffect, useState} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import axios from 'axios';
import './ServicesSlider.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ServicesSlider = () => {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: false,
      align: 'start',
      slidesToScroll: 1,
      dragFree: true,           // плавное перетаскивание
      containScroll: 'trimSnaps',
    },
    [
      Autoplay({
        delay: 6500,            // автопрокрутка каждые 6.5 сек
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      }),
    ]
  );
  const [services, setServices] = useState([
    {
      id: '1',
      title: "Консультация",
      description: "30-минутная консультация с экспертом. Разберёмся с ситуацией, оценим перспективы, ответим на все вопросы. Оставьте заявку на сайте, а дальше мы позвоним.",
      price: "Бесплатно",
      buttonText: "ЗАЯВКА",
    },
    {
      id: '2',
      title: "Подбор и оформление аренды",
      description: "Ищете уютное гнёздышко или хотите сдать? Найдём для вас идеальный вариант, проверим документы и подготовим договор. 75% от месячной оплаты.",
      price: "75% от месячной оплаты",
      buttonText: "ЗАЯВКА",
    },
    {
      id: '3',
      title: "Юридическое сопровождение",
      description: "Страшно совершать такую крупную сделку? Наш юрист проверит объект, подготовит необходимые документы и сопроводит вас на сделке.",
      price: "30 000 ₽",
      buttonText: "ЗАЯВКА",
    },
    {
      id: '4',
      title: "Оценка стоимости",
      description: "Чтобы не продешевить, нужен точный расчёт. Наш эксперт проведёт детальный анализ рынка и объекта и даст обоснованную рекомендацию по цене.",
      price: "5 000 ₽",
      buttonText: "ЗАЯВКА",
    },
    {
      id: '5',
      title: "Продажа «под ключ»",
      description: "Мечтаете продать быстро и без хлопот? Мы возьмём на себя всё: от профессиональной съёмки и рекламы до организации показов и сделки.",
      price: "3% от стоимости продажи объекта",
      buttonText: "ЗАЯВКА",
    },
  ])

  useEffect(() => {
    const loadServiceImages = async () => {
      const updatedServices = await Promise.all(
        services.map(async (service) => {
          try {
            const filename = `Услуга_${service.id}.jpg`;
            const response = await axios.get(`${API_URL}/images/${filename}`, { responseType: 'blob' });

            const imageUrl = URL.createObjectURL(response.data);
            return { ...service, imageUrl };
          } catch (error) {
            console.warn(`Не удалось загрузить изображение для услуги ${service.title}:`, error);
            return service; // оставляем fallback
          }
        })
      );

      setServices(updatedServices);
    };

    loadServiceImages();

    // Очистка blob-URL при размонтировании
    return () => {
      services.forEach((service) => {
        if (service.imageUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(service.imageUrl);
        }
      });
    };
  }, []);

  return (
    <div className="services-section">
      <h2 className='section-title'>Услуги</h2>
      <div className="services-slider" ref={emblaRef}>
        <div className="services-slider__container">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-card__image-placeholder">
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/fallback/service-fallback.jpg'; // запасное изображение при ошибке
                  }}
                />
              </div>

              <div className="service-card__content">
                <h3 className="service-card__title">{service.title}</h3>
                <p className="service-card__description">{service.description}</p>
                <div className='service-card-bottom'>
                  <div className="service-card__price">{service.price}</div>
                  <button className="service-card__button">
                    {service.buttonText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesSlider;