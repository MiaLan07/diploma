// src/components/SpecialistsSlider.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import './SpecialistSlider.css';
import axios from 'axios';
import { useInView } from 'react-intersection-observer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SpecialistsSlider = () => {
  // Настройка Embla Carousel с автопрокруткой
  const autoplayOptions = { delay: 6500, stopOnInteraction: false };
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: true, slidesToScroll: 2 }, [Autoplay(autoplayOptions)]);
  const blobUrlsRef = useRef([]);

  const [specialists, setSpecialists] = useState([
    {
      id: 1,
      name: 'Максим Петров',
      position: 'риелтор',
      description: 'Опыт работы: 9 лет<br/>Образование: РЭУ им. Плеханова Специальность «Финансы и\u00A0кредит»<br/>Доп. образование: курс «Налогообложение сделок с\u00A0недвижимость» в\u00A0ВШЭ<br/>Специализация: проведение сделок с\u00A0залоговой недвижимостью',
      image: 'path/to/maxim-perlov.jpg',
    },
    {
      id: 2,
      name: 'Анна Сидорова',
      position: 'юрист',
      description: 'Опыт работы: 7 лет<br/>Образование: Московская государственная юридическая академия, гражданско-правовая специализация<br/>Член Ассоциации юристов России<br/>Специализация: проверка объектов в\u00A0долевом строительстве',
      image: 'path/to/anna-sidorova.jpg',
    },
    {
      id: 3,
      name: 'Игорь Васильев',
      position: 'менеджер по\u00A0продажам',
      description: 'Опыт работы в агентстве: 5 лет<br/>Образование: Санкт-Петербургский государственный университет, специальность «Менеджмент»<br/>Сертификат CIPS (Центр подготовки и развития риелторов)<br/>Специализация: маркетинг',
      image: 'path/to/igor-vasiliev.jpg',
    },
    {
      id: 4,
      name: 'Елена Комарова',
      position: 'специалист по\u00A0новостройкам',
      description: 'Опыт работы: 11 лет<br/>Образование: Московский государственный юридический университет им. О.Е. Кутафина, специальность «Гражданское право»<br/>Специализация: координация работы риелторов и юристов',
      image: 'path/to/elena-komarova.jpg',
    },
    {
      id: 5,
      name: 'Дмитрий Соколов',
      position: 'специалист по загородной недвижимости',
      description: 'Опыт работы: 8 лет<br/>Образование: Государственный университет по землеустройству, специальность «Земельный кадастр»<br/>Специализация: проведение сделок с коттеджами и таунхаусами',
      image: 'path/to/dmitry-sokolov.jpg',
    },
    {
      id: 6,
      name: 'Альбина Захарова',
      position: 'маркетолог',
      description: 'Опыт работы: 6 лет<br/>Образование: НИУ «Высшая школа экономики», специальность «Маркетинг»<br/>Специализация: увеличение скорости продаж',
      image: 'path/to/albina-zakharova.jpg',
    },
    {
      id: 7,
      name: 'Артем Кузин',
      position: 'менеджер по\u00A0аренде',
      description: 'Опыт работы: 9 лет<br/>Образование: Финансовый университет при Правительстве РФ, специальность «Банковское дело»<br/>Специализация: оформление ипотечных сделок',
      image: 'path/to/artem-kuzin.jpg',
    },
  ])

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slidesCount, setSlidesCount] = useState(0);

  useEffect(() => {
    const loadSpecImages = async () => {
      const updatedSpecs = await Promise.all(
        specialists.map(async (specialist) => {
          // Пропускаем, если изображение уже является blob URL (уже загружено)
          if (specialist.image && specialist.image.startsWith('blob:')) {
            return specialist;
          }
          try {
            const filename = `Специалист_${specialist.id}.jpg`;
            const response = await axios.get(`${API_URL}/images/${filename}`, { responseType: 'blob' });
            const imageUrl = URL.createObjectURL(response.data);
            // Сохраняем blob URL для последующей очистки
            blobUrlsRef.current.push(imageUrl);
            return { ...specialist, image: imageUrl };
          } catch (error) {
            console.warn(`Не удалось загрузить изображение для специалиста ${specialist.name}:`, error);
            return specialist; // оставляем исходный путь (fallback)
          }
        })
      );

      setSpecialists(updatedSpecs);
    };

    loadSpecImages();

    // Очистка всех созданных blob URL при размонтировании
    return () => {
      blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
    };
  }, []);

  const { ref } = useInView({
    threshold: 0.5,
    onChange: (inView) => {
      window.dispatchEvent(new CustomEvent('sectionVisible', {
        detail: { section: 'team', inView }
      }));
    },
  });

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setSlidesCount(emblaApi.scrollSnapList().length);
    };
  
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect(); // инициализация
  
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);
  
    // Обработчики
    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  return (
    <div ref={ref} className="specialists-slider" id='team'>
        <h2 className='section-title'>Наши специалисты</h2>
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {specialists.map((specialist, index) => (
            <div className="embla__slide" key={index}>
              <div className="specialist-card">
                <img src={specialist.image} alt={specialist.name} className="specialist-image" />
                <div className='specialist-descr'>
                    <h3 className="specialist-name">{specialist.name} &ndash; {specialist.position}</h3>
                    <p className="specialist-description">
                        {specialist.description.split('<br/>').map((part, i) => (
                            <React.Fragment key={i}>
                            {part}
                            {i < specialist.description.split('<br/>').length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="specialists-navigation">
        <button
          className="specialists-arrow specialists-arrow--prev"
          onClick={scrollPrev}
          disabled={selectedIndex === 0}
          aria-label="Предыдущие услуги"
        >
          ←
        </button>

        <div className="specialists-dots">
          {Array.from({ length: slidesCount }).map((_, idx) => (
            <button
              key={idx}
              className={`specialists-dot ${idx === selectedIndex ? 'specialists-dot--active' : ''}`}
              onClick={() => scrollTo(idx)}
              aria-label={`Перейти к услуге ${idx + 1}`}
            />
          ))}
        </div>

        <button
          className="specialists-arrow specialists-arrow--next"
          onClick={scrollNext}
          disabled={selectedIndex === slidesCount - 1}
          aria-label="Следующие услуги"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default SpecialistsSlider;