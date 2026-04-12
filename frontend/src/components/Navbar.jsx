import { useState, useEffect } from 'react'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-inner">
        <a href="#" className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="nav-logo-icon">S</div>
          <span className="nav-logo-text">Spatial-SynergyNet</span>
        </a>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <a onClick={() => scrollTo('pipeline')}>How It Works</a>
          <a onClick={() => scrollTo('applications')}>Applications</a>
          <a onClick={() => scrollTo('architecture')}>Architecture</a>
          <a onClick={() => scrollTo('classes')}>Classes</a>
          <a href="https://github.com/Charanyedida/fusion-model" target="_blank" rel="noreferrer">GitHub</a>
          <a onClick={() => scrollTo('demo')} className="nav-cta">Try Demo</a>
        </div>
        <div className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span style={menuOpen ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}} />
          <span style={menuOpen ? { opacity: 0 } : {}} />
          <span style={menuOpen ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {}} />
        </div>
      </div>
    </nav>
  )
}
