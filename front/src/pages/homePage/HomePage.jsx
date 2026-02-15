import React from 'react'
import HeroPage from './HeroPage'
import ServicesSlider from '../../components/common/Sliders/Services/ServicesSlider'
import WhyWithUs from './WhyWithUs'
import ConsultationBlock from './ConsultationBlock'
import AboutCompany from './AboutCompany'
import SpecialistsSlider from '../../components/common/Sliders/Specs/SpecialistSlider'
import ReviewsSlider from '../../components/common/Sliders/Rews/RewievsSlider'
import ContactBlock from './ContactBlock'
import Footer from '../../components/ui/Footer'

const HomePage = () => {
    return (<>
        <HeroPage/>
        <ServicesSlider/>
        <WhyWithUs />
        <ConsultationBlock />
        <AboutCompany />
        <SpecialistsSlider />
        <ReviewsSlider />
        <ContactBlock />
        <Footer />
    </>)
}

export default HomePage;