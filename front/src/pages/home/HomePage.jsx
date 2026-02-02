import HeroComp from '../../components/heroPage/Hero';          // или путь к твоему Hero

export default function HomePage() {
  return (
    <>
      <HeroComp />
      {/* Здесь потом будут другие секции главной страницы */}
      {/* <Services /> */}
      {/* <WhyUs /> */}
      {/* <CatalogPreview /> */}
      {/* ... */}
    </>
  );
}