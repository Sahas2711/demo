import Navbar from '../component/Navbar'
import Hero from '../component/Hero'
import Features from '../component/Features'
import DashboardPreview from '../component/DashboardPreview'
import CTA from '../component/CTA'
import Footer from '../component/Footer'

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'Poppins, Inter, system-ui, sans-serif' }}>
      <Navbar />
      <Hero />
      <Features />
      <DashboardPreview />
      <CTA />
      <Footer />
    </div>
  )
}
