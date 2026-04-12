import './Applications.css'

const apps = [
  {
    icon: '🏗️', title: 'Architecture & Construction',
    desc: 'Automate floor-plan extraction from 3D scans of buildings under construction. Monitor construction progress by comparing scanned geometry against BIM models. Detect structural deviations in real-time, reducing costly rework by up to 30%. Used by firms like Matterport and OpenSpace for site documentation.',
    tags: ['BIM Integration', 'Progress Tracking', 'Quality Control']
  },
  {
    icon: '🤖', title: 'Robotics & Autonomous Navigation',
    desc: 'Enable robots and autonomous vehicles to understand indoor environments — distinguishing navigable floors from obstacles like furniture and walls. Critical for warehouse robots (Amazon), delivery drones, and assistive robots in hospitals. Reduces collision rates by enabling semantic path planning.',
    tags: ['Path Planning', 'Obstacle Detection', 'SLAM']
  },
  {
    icon: '🏠', title: 'Interior Design & Real Estate',
    desc: 'Virtually stage empty rooms by understanding which surfaces are floors, walls, and windows. Real estate platforms like Zillow use 3D segmentation for immersive property tours. Interior designers leverage it to auto-measure room dimensions and plan furniture placement with centimeter-level accuracy.',
    tags: ['Virtual Staging', 'Room Measurement', 'Property Tours']
  },
  {
    icon: '🎮', title: 'AR/VR & Immersive Gaming',
    desc: 'Reconstruct real-world rooms as playable game environments. Apple Vision Pro and Meta Quest use scene understanding to anchor virtual objects to real furniture. Semantic labels enable physics-aware interactions — a virtual ball bounces off a real table, and digital characters sit on your actual sofa.',
    tags: ['Scene Reconstruction', 'Mixed Reality', 'Spatial Anchors']
  },
  {
    icon: '🏥', title: 'Healthcare & Accessibility',
    desc: 'Assist visually impaired individuals by narrating surrounding objects — "door ahead, chair to your left." Smart glasses with embedded 3D segmentation provide real-time audio descriptions of indoor spaces. Also used in surgical planning where operating room layouts are digitized for optimal equipment placement.',
    tags: ['Assistive Tech', 'Surgical Planning', 'Smart Glasses']
  },
  {
    icon: '🏛️', title: 'Cultural Heritage & Preservation',
    desc: 'Digitize historical monuments, temples, and museums in full 3D with semantic annotations. UNESCO uses point cloud segmentation to catalog structural elements of endangered heritage sites. Enables precise digital restoration — architects can reconstruct damaged sections using classified geometry of intact areas.',
    tags: ['3D Digitization', 'Digital Restoration', 'UNESCO Sites']
  },
]

export default function Applications() {
  return (
    <section className="applications" id="applications">
      <div className="container">
        <div className="applications-header">
          <div className="section-label">Impact</div>
          <h2 className="section-title">Real-Life Applications</h2>
          <p className="section-subtitle">
            3D semantic segmentation is transforming industries worldwide. Here's how
            Spatial-SynergyNet's technology is being applied in practice.
          </p>
        </div>
        <div className="app-grid">
          {apps.map((app, i) => (
            <div className="app-card reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="app-icon">{app.icon}</div>
              <h3>{app.title}</h3>
              <p>{app.desc}</p>
              <div className="app-tags">
                {app.tags.map((t, j) => <span key={j}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
