import './Architecture.css'

const blocks = [
  { label: 'Input', detail: 'XYZ Points (3D)', cls: 'input' },
  { label: 'Backbone', detail: '3 → 128 → 384', cls: 'backbone' },
  { label: 'Task Head', detail: '384 → 512 → 256', cls: 'head' },
  { label: 'Output', detail: '20 Classes', cls: 'output' },
]

const stats = [
  { val: '384', label: 'Feature Dimensions' },
  { val: 'LoRA', label: 'Parameter-Efficient Tuning' },
  { val: 'LayerNorm', label: 'Normalization Strategy' },
  { val: '0.3', label: 'Dropout Rate' },
]

export default function Architecture() {
  return (
    <section className="architecture" id="architecture">
      <div className="container">
        <div className="arch-header">
          <div className="section-label">Under the Hood</div>
          <h2 className="section-title" style={{ color: 'var(--cream)' }}>Model Architecture</h2>
          <p className="section-subtitle" style={{ color: 'rgba(250,246,240,0.6)' }}>
            SpatialSynergyNet combines a lightweight backbone with a deep task-specific
            classification head, achieving efficient per-point semantic labeling.
          </p>
        </div>
        <div className="arch-diagram reveal">
          {blocks.map((b, i) => (
            <div key={i} style={{ display: 'contents' }}>
              {i > 0 && <span className="arch-arrow">→</span>}
              <div className={`arch-block ${b.cls}`}>
                <h4>{b.label}</h4>
                <p>{b.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="arch-stats">
          {stats.map((s, i) => (
            <div className="arch-stat-card reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="stat-val">{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
