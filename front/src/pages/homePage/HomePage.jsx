import React from 'react'
import HeroPage from './HeroPage'
import ServicesSlider from '../../components/common/ServicesSlider'
import WhyWithUs from './WhyWithUs'
import ConsultationBlock from './ConsultationBlock'
import AboutCompany from './AboutCompany'
import SpecialistsSlider from '../../components/common/SpecialistSlider'
import ReviewsSlider from '../../components/common/RewievsSlider'
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