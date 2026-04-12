import './Pipeline.css'

const steps = [
  { icon: '📡', num: 'Step 01', title: '3D Scanning', desc: 'Capture raw point cloud data from LiDAR sensors, depth cameras, or structured light scanners in .PLY format.' },
  { icon: '⚙️', num: 'Step 02', title: 'Preprocessing', desc: 'Center and normalize XYZ coordinates. Apply spatial transformations for model-ready tensor preparation.' },
  { icon: '🧠', num: 'Step 03', title: 'AI Inference', desc: "SpatialSynergyNet's deep backbone + task head processes each point through 384-dim feature space with LoRA-enhanced layers." },
  { icon: '🎨', num: 'Step 04', title: 'Semantic Map', desc: 'Each 3D point receives a semantic label from 20 ScanNet categories — visualized as a color-coded interactive scene.' },
]

export default function Pipeline() {
  return (
    <section className="pipeline" id="pipeline">
      <div className="container">
        <div className="pipeline-header">
          <div className="section-label">Pipeline</div>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            From raw 3D scans to intelligent semantic understanding — our four-stage pipeline
            processes point clouds in real-time.
          </p>
        </div>
        <div className="pipeline-grid">
          {steps.map((s, i) => (
            <div className="pipeline-step reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="pipeline-icon">{s.icon}</div>
              <div className="pipeline-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
