import './ClassesGrid.css'

const SCANNET_CLASSES = [
  "Wall", "Floor", "Cabinet", "Bed", "Chair", "Sofa", "Table", "Door", "Window",
  "Bookshelf", "Picture", "Counter", "Desk", "Curtain", "Fridge", "ShowerCurtain",
  "Toilet", "Sink", "Bathtub", "OtherFurniture"
]

const COLORS = [
  '#6B1D2A', '#C5973B', '#2D5016', '#1B2A4A', '#8B2F42',
  '#3F7A1F', '#5C4033', '#2A3F6A', '#9B6B3A', '#4A6741',
  '#7A4455', '#B8860B', '#556B2F', '#4A0E1C', '#8B7355',
  '#6B8E23', '#704214', '#2F4F4F', '#8B4513', '#696969'
]

export default function ClassesGrid() {
  return (
    <section className="classes-section" id="classes">
      <div className="container">
        <div className="classes-header">
          <div className="section-label">Categories</div>
          <h2 className="section-title">20 ScanNet Object Classes</h2>
          <p className="section-subtitle">
            Every point in the 3D scan is assigned one of these semantic labels,
            enabling comprehensive scene understanding.
          </p>
        </div>
        <div className="classes-grid">
          {SCANNET_CLASSES.map((name, i) => (
            <div
              className="class-chip reveal"
              key={i}
              style={{ transitionDelay: `${i * 0.03}s` }}
            >
              <span className="chip-color" style={{ background: COLORS[i] }} />
              <span className="chip-label">{name}</span>
              <span className="chip-id">#{i}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
