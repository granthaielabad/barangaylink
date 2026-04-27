import Hero from '../components/Hero'
import { NavBar } from '../../../layout'
import About from '../components/About'
import Features from '../components/Features'
import { Footer } from '../../../layout'

export default function LandingPage() {
  return (
    <>
      <NavBar />
      <section id="home">
        <Hero />
      </section>
      <section id="about">
        <About />
      </section>
      
      <section id="features">
        <Features />
      </section>

      <footer>
        <Footer />  
      </footer>
    </>
  )
}

