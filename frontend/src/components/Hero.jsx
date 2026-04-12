import { useEffect, useRef } from 'react'
import './Hero.css'

export default function Hero() {
  const statsRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.number[data-target]').forEach(el => {
            const target = parseInt(el.dataset.target)
            animateCounter(el, 0, target, 1200)
          })
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.5 })

    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  function animateCounter(el, start, end, duration) {
    const startTime = performance.now()
    function update(time) {
      const progress = Math.min((time - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      el.textContent = Math.round(start + (end - start) * eased)
      if (progress < 1) requestAnimationFrame(update)
    }
    requestAnimationFrame(update)
  }

  return (
    <section className="hero" id="hero">
      <div className="container hero-inner">
        <div className="hero-content">
          <h1>
            Understand 3D Spaces<br />
            with <span className="highlight">Spatial</span>
            <span className="highlight-gold">SynergyNet</span>
          </h1>
          <p className="hero-description">
            A high-capacity neural network that transforms raw 3D point cloud scans into
            semantically labeled scenes — identifying walls, furniture, fixtures, and more
            with state-of-the-art accuracy.
          </p>
          <div className="hero-actions">
            <a href="#demo" className="btn btn-primary" onClick={(e) => {
              e.preventDefault()
              document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
            }}>
              ▶ Run the Demo
            </a>
            <a href="#applications" className="btn btn-secondary" onClick={(e) => {
              e.preventDefault()
              document.getElementById('applications')?.scrollIntoView({ behavior: 'smooth' })
            }}>
              Explore Use Cases →
            </a>
          </div>
          <div className="hero-stats" ref={statsRef}>
            <div className="hero-stat">
              <div className="number" data-target="20">0</div>
              <div className="label">Object Categories</div>
            </div>
            <div className="hero-stat">
              <div className="number" data-target="3">0</div>
              <div className="label">Input Dimensions</div>
            </div>
            <div className="hero-stat">
              <div className="number" data-target="5">0</div>
              <div className="label">Trained Models</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-content">
              <div className="icon-3d">🧊</div>
              <h3>3D Scene Understanding</h3>
              <p>Point Cloud → Semantic Labels</p>
            </div>
          </div>
          <div className="float-tag" style={{ top: '10%', right: '-15%', animationDelay: '0.5s' }}>
            <span className="tag-dot green" /> Wall Detected
          </div>
          <div className="float-tag" style={{ bottom: '15%', left: '-10%', animationDelay: '1.2s' }}>
            <span className="tag-dot gold" /> Table Classified
          </div>
          <div className="float-tag" style={{ top: '50%', right: '-20%', animationDelay: '1.8s' }}>
            <span className="tag-dot maroon" /> Chair Identified
          </div>
        </div>
      </div>
    </section>
  )
}
