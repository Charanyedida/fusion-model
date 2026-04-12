import './Architecture.css'

export default function Architecture() {
  return (
    <section className="architecture" id="architecture">
      <div className="container">
        <div className="arch-header">
          <div className="section-label">Under the Hood</div>
          <h2 className="section-title" style={{ color: 'var(--cream)' }}>
            Teacher–Student Cross-Modal Fusion
          </h2>
          <p className="section-subtitle" style={{ color: 'rgba(250,246,240,0.6)' }}>
            A dual-branch architecture that fuses 2D semantic intelligence with 3D spatial
            understanding — where 2D teaches meaning, 3D learns structure, and fusion creates understanding.
          </p>
        </div>

        {/* Main Architecture Diagram */}
        <div className="arch-flow reveal">
          {/* Input Layer */}
          <div className="arch-row">
            <div className="arch-block input-block">
              <div className="arch-block-icon">🖼️</div>
              <h4>RGB Images (2D)</h4>
              <p>Textures, colors, object identity</p>
            </div>
            <div className="arch-block input-block">
              <div className="arch-block-icon">🧊</div>
              <h4>Point Clouds (3D)</h4>
              <p>Depth, shape, spatial structure</p>
            </div>
          </div>

          <div className="arch-connector">
            <span className="arch-arrow-down">↓</span>
            <span className="arch-arrow-down">↓</span>
          </div>

          {/* Dual Branch */}
          <div className="arch-row">
            <div className="arch-block teacher-block">
              <div className="arch-block-tag">Teacher Network</div>
              <h4>Vision Transformer</h4>
              <p>ViT / DINOv2</p>
              <ul className="arch-features">
                <li>Global attention mechanism</li>
                <li>Dense semantic embeddings</li>
                <li>Object boundaries & context</li>
              </ul>
              <div className="arch-output-label">Understands <strong>what</strong> is in the scene</div>
            </div>
            <div className="arch-block student-block">
              <div className="arch-block-tag">Student Network</div>
              <h4>Point Transformer</h4>
              <p>3D Geometric Features</p>
              <ul className="arch-features">
                <li>Spatial distribution</li>
                <li>Surface structure</li>
                <li>Depth relationships</li>
              </ul>
              <div className="arch-output-label">Understands <strong>where</strong> things exist</div>
            </div>
          </div>

          <div className="arch-connector merge">
            <span className="arch-arrow-down">↘</span>
            <span className="arch-arrow-down">↙</span>
          </div>

          {/* Fusion Module */}
          <div className="arch-row">
            <div className="arch-block fusion-block">
              <div className="arch-block-icon">⚡</div>
              <h4>Synergy Fusion Module</h4>
              <p>Cross-Modal Feature Alignment</p>
              <ul className="arch-features">
                <li>3D→2D projection via camera calibration</li>
                <li>Semantic transfer from teacher to student</li>
                <li>Joint feature representation learning</li>
                <li>Self-supervised cosine similarity loss</li>
              </ul>
            </div>
          </div>

          <div className="arch-connector">
            <span className="arch-arrow-down">↓</span>
          </div>

          {/* Output */}
          <div className="arch-row">
            <div className="arch-block output-block">
              <div className="arch-block-icon">🎯</div>
              <h4>3D Output</h4>
              <p>Semantic Segmentation & Object Detection</p>
            </div>
          </div>
        </div>

        {/* Training Stages */}
        <div className="arch-training">
          <h3>Two-Stage Training Pipeline</h3>
          <div className="training-stages">
            <div className="training-stage">
              <div className="stage-num">1</div>
              <div className="stage-content">
                <h4>Independent Pretraining</h4>
                <p>3D branch is pretrained independently to stabilize geometric understanding before cross-modal interaction.</p>
              </div>
            </div>
            <div className="training-stage">
              <div className="stage-num">2</div>
              <div className="stage-content">
                <h4>Joint Training</h4>
                <p>Both branches interact — the student learns semantics from the teacher via feature alignment, no explicit labels needed.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="arch-stats">
          <div className="arch-stat-card">
            <div className="stat-val">2D</div>
            <div className="stat-label">Teaches Meaning</div>
          </div>
          <div className="arch-stat-card">
            <div className="stat-val">3D</div>
            <div className="stat-label">Learns Structure</div>
          </div>
          <div className="arch-stat-card">
            <div className="stat-val">Fusion</div>
            <div className="stat-label">Creates Understanding</div>
          </div>
          <div className="arch-stat-card">
            <div className="stat-val">20</div>
            <div className="stat-label">ScanNet Classes</div>
          </div>
        </div>
      </div>
    </section>
  )
}
