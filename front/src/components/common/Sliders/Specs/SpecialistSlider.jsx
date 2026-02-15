// src/components/SpecialistsSlider.jsx
import React, {useState, useEffect} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import './SpecialistSlider.css';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SpecialistsSlider = () => {
  // Настройка Embla Carousel с автопрокруткой
  const autoplayOptions = { delay: 6500, stopOnInteraction: false };
  const [emblaRef] = useEmblaCarousel({ loop: false, dragFree: true, slidesToScroll: 2 }, [Autoplay(autoplayOptions)]);

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

  useEffect(() => {
    const loadSpecImages = async () => {
      const updatedSpecs = await Promise.all(
        specialists.map(async (specialist) => {
          try {
            const filename = `Специалист_${specialist.id}.jpg`;
            const response = await axios.get(`${API_URL}/images/${filename}`, { responseType: 'blob' });

            const imageUrl = URL.createObjectURL(response.data);
            return { ...specialist, image: imageUrl };
          } catch (error) {
            console.warn(`Не удалось загрузить изображение для специалиста ${specialist.name}:`, error);
            return specialist; // оставляем fallback
          }
        })
      );

      setSpecialists(updatedSpecs);
    };

    loadSpecImages();

    // Очистка blob-URL при размонтировании
    return () => {
      specialists.forEach((specialist) => {
        if (specialist.image?.startsWith('blob:')) {
          URL.revokeObjectURL(specialist.image);
        }
      });
    };
  }, []);

  return (
    <div className="specialists-slider">
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
    </div>
  );
};

export default SpecialistsSlider;