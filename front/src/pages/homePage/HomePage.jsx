import React from 'react'
import HeroPage from './HeroPage'
import ServicesSlider from '../../components/common/ServicesSlider'
import WhyWithUs from './WhyWithUs'
import ConsultationBlock from './ConsultationBlock'
import AboutCompany from './AboutCompany'

const HomePage = () => {
    return (<>
        <HeroPage/>
        <ServicesSlider/>
        <WhyWithUs />
        <ConsultationBlock />
        <AboutCompany />
    </>)
}

export default HomePage;