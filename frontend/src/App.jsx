import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Pipeline from './components/Pipeline'
import Applications from './components/Applications'
import Architecture from './components/Architecture'
import ClassesGrid from './components/ClassesGrid'
import DemoSection from './components/DemoSection'
import Footer from './components/Footer'

function App() {
  // Scroll reveal effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    )

    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    revealEls.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Navbar />
      <Hero />
      <Pipeline />
      <Applications />
      <Architecture />
      <ClassesGrid />
      <DemoSection />
      <Footer />
    </>
  )
}

export default App
