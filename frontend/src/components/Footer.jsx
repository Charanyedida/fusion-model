import './Footer.css'

export default function Footer() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <div className="tech-strip">
        <div className="container">
          <div className="tech-inner">
            {[
              ['🔥', 'PyTorch'], ['📊', 'NumPy'], ['🖥️', 'PyVista'],
              ['📐', 'ScanNet'], ['🧬', 'LoRA'], ['🐍', 'Python'],
              ['⚛️', 'React'], ['🎯', 'Three.js']
            ].map(([icon, name]) => (
              <div className="tech-badge" key={name}>
                <div className="tech-icon">{icon}</div> {name}
              </div>
            ))}
          </div>
        </div>
      </div>
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <h3>Spatial-SynergyNet</h3>
              <p>High-capacity 3D semantic segmentation for indoor scene understanding. Built with PyTorch and trained on the ScanNet benchmark.</p>
            </div>
            <div>
              <h4>Navigation</h4>
              <ul>
                <li><a onClick={() => scrollTo('pipeline')}>How It Works</a></li>
                <li><a onClick={() => scrollTo('applications')}>Applications</a></li>
                <li><a onClick={() => scrollTo('architecture')}>Architecture</a></li>
                <li><a onClick={() => scrollTo('demo')}>Try Demo</a></li>
              </ul>
            </div>
            <div>
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">ScanNet Dataset</a></li>
                <li><a href="#">Research Paper</a></li>
                <li><a href="#">GitHub Repository</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2026 Spatial-SynergyNet. All rights reserved.</span>
            <span>Built with ❤️ and <a href="https://pytorch.org" target="_blank" rel="noreferrer">PyTorch</a></span>
          </div>
        </div>
      </footer>
    </>
  )
}
