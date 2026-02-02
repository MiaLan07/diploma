import PropertySearch from '../additional/PropertySearch';
import './Hero.css';

const HeroComp = () => {
  return (
    <section className="hero">
      <div className="hero__overlay">
        <div className="container hero__content">
          <h1 className="hero__title">
            Подбор и продажа
            <span className="hero__highlight"> НЕДВИЖИМОСТИ </span> 
            в вашем городе
          </h1>

          <button className="btn btn--primary hero__btn">
            ПОСМОТРЕТЬ
          </button>

          <PropertySearch />
        </div>
      </div>
    </section>
  );
};

export default HeroComp;