import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import './DemoSection.css'

const SCANNET_CLASSES = [
  "Wall", "Floor", "Cabinet", "Bed", "Chair", "Sofa", "Table", "Door", "Window",
  "Bookshelf", "Picture", "Counter", "Desk", "Curtain", "Fridge", "ShowerCurtain",
  "Toilet", "Sink", "Bathtub", "OtherFurniture"
]

// tab20 colormap — matches PyVista's default for ScanNet
const CLASS_COLORS = [
  '#1F77B4', '#AEC7E8', '#FF7F0E', '#FFBB78', '#2CA02C',
  '#98DF8A', '#D62728', '#FF9896', '#9467BD', '#C5B0D5',
  '#8C564B', '#C49C94', '#E377C2', '#F7B6D2', '#7F7F7F',
  '#C7C7C7', '#BCBD22', '#DBDB8D', '#17BECF', '#9EDAE5'
]

/* ---- POINT CLOUD COMPONENT ---- */
function PointCloud({ points, colors, pointSize = 2.0 }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(points.length * 3)
    const colorsArr = new Float32Array(points.length * 3)

    for (let i = 0; i < points.length; i++) {
      positions[i * 3] = points[i][0]
      positions[i * 3 + 1] = points[i][1]
      positions[i * 3 + 2] = points[i][2]
      colorsArr[i * 3] = colors[i][0]
      colorsArr[i * 3 + 1] = colors[i][1]
      colorsArr[i * 3 + 2] = colors[i][2]
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colorsArr, 3))
    geo.computeBoundingSphere()
    return geo
  }, [points, colors])

  return (
    <points geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={pointSize}
        sizeAttenuation={false}
      />
    </points>
  )
}

/* ---- CAMERA CONTROLLER: positions camera to fit the point cloud ---- */
function CameraSetup({ center, distance }) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(
      center[0] + distance * 0.7,
      center[1] + distance * 0.7,
      center[2] + distance * 0.7
    )
    camera.near = 0.01
    camera.far = distance * 10
    camera.updateProjectionMatrix()
    camera.lookAt(center[0], center[1], center[2])
  }, [camera, center, distance])

  return null
}

/* ---- 3D VIEWER COMPONENT ---- */
function Viewer3D({ points, colors, pointSize }) {
  // Compute bounding box center and diagonal for proper camera framing
  const { center, distance } = useMemo(() => {
    if (!points || points.length === 0) return { center: [0, 0, 0], distance: 10 }

    let minX = Infinity, minY = Infinity, minZ = Infinity
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity

    for (const p of points) {
      if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0]
      if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1]
      if (p[2] < minZ) minZ = p[2]; if (p[2] > maxZ) maxZ = p[2]
    }

    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    const cz = (minZ + maxZ) / 2
    const diag = Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2 + (maxZ - minZ) ** 2)

    return { center: [cx, cy, cz], distance: Math.max(diag, 1) }
  }, [points])

  return (
    <Canvas
      camera={{ fov: 50, near: 0.01, far: 5000 }}
      style={{ width: '100%', height: '100%', background: '#FFFFFF' }}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={1} />
      <CameraSetup center={center} distance={distance} />
      <PointCloud points={points} colors={colors} pointSize={pointSize} />
      <OrbitControls
        target={new THREE.Vector3(center[0], center[1], center[2])}
        enableDamping
        dampingFactor={0.1}
        minDistance={distance * 0.1}
        maxDistance={distance * 5}
      />
    </Canvas>
  )
}

/* ---- MAIN DEMO SECTION ---- */
export default function DemoSection() {
  const [status, setStatus] = useState('idle') // idle | uploading | processing | done | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef(null)

  const handleFile = useCallback(async (file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.ply')) {
      setError('Please upload a .ply file')
      setStatus('error')
      return
    }

    setFileName(file.name)
    setStatus('uploading')
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      setStatus('processing')
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/predict`, { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Inference failed')
      }

      setResult(data)
      setStatus('done')
    } catch (err) {
      setError(err.message || 'Failed to connect to server. Is the Flask backend running?')
      setStatus('error')
    }
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const onFileSelect = useCallback((e) => {
    handleFile(e.target.files[0])
  }, [handleFile])

  // Compute colors for raw (gold) and predicted (class colors)
  const rawColors = useMemo(() => {
    if (!result) return []
    const green = [0.18, 0.55, 0.34]  // #2E8B57 seagreen — darker green matching PyVista
    return result.points.map(() => green)
  }, [result])

  const predColors = useMemo(() => {
    if (!result) return []
    return result.predictions.map(classId => {
      const hex = CLASS_COLORS[classId] || '#696969'
      return [
        parseInt(hex.slice(1, 3), 16) / 255,
        parseInt(hex.slice(3, 5), 16) / 255,
        parseInt(hex.slice(5, 7), 16) / 255,
      ]
    })
  }, [result])

  // Sort class counts for stats
  const sortedClasses = useMemo(() => {
    if (!result) return []
    return Object.entries(result.stats.class_counts)
      .sort((a, b) => b[1] - a[1])
  }, [result])

  return (
    <section className="demo-section" id="demo">
      <div className="container">
        <div className="demo-header">
          <div className="section-label">Interactive</div>
          <h2 className="section-title">Run the Demo</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Upload a .ply point cloud file and watch Spatial-SynergyNet classify every point in real-time.
          </p>
        </div>

        {/* Upload Zone */}
        {status !== 'done' && (
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''} ${status === 'processing' ? 'processing' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => status === 'idle' || status === 'error' ? fileRef.current?.click() : null}
          >
            <input
              type="file"
              accept=".ply"
              ref={fileRef}
              onChange={onFileSelect}
              style={{ display: 'none' }}
            />
            {status === 'idle' && (
              <>
                <div className="upload-icon">📁</div>
                <h3>Drop your .ply file here</h3>
                <p>or click to browse • Supports binary and ASCII PLY format</p>
                <p className="upload-hint">Try uploading <code>real_room.ply</code> from the project folder</p>
              </>
            )}
            {status === 'uploading' && (
              <>
                <div className="upload-icon spinning">📡</div>
                <h3>Uploading {fileName}...</h3>
              </>
            )}
            {status === 'processing' && (
              <>
                <div className="upload-icon spinning">🧠</div>
                <h3>Running SpatialSynergyNet Inference...</h3>
                <p>This may take a few seconds for large point clouds</p>
              </>
            )}
            {status === 'error' && (
              <>
                <div className="upload-icon">⚠️</div>
                <h3>Error</h3>
                <p className="error-text">{error}</p>
                <p>Click to try again</p>
              </>
            )}
          </div>
        )}

        {/* Results View */}
        {status === 'done' && result && (
          <div className="results-container reveal visible">
            <div className="results-toolbar">
              <div className="results-info">
                <span className="results-file">📁 {fileName}</span>
                <span className="results-points">{result.stats.total_points.toLocaleString()} points</span>
                <span className="results-classes">{result.stats.classes_found} classes detected</span>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => { setStatus('idle'); setResult(null); setFileName('') }}
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
              >
                ↩ Upload New File
              </button>
            </div>

            {/* Split 3D Viewers */}
            <div className="viewers-grid">
              <div className="viewer-panel">
                <div className="viewer-label">
                  <span className="viewer-dot raw" /> INPUT: Raw Point Cloud
                </div>
                <div className="viewer-canvas">
                  <Viewer3D points={result.points} colors={rawColors} pointSize={3.0} />
                </div>
              </div>
              <div className="viewer-panel">
                <div className="viewer-label">
                  <span className="viewer-dot pred" /> OUTPUT: Semantic Predictions
                </div>
                <div className="viewer-canvas">
                  <Viewer3D points={result.points} colors={predColors} pointSize={3.0} />
                </div>
              </div>
            </div>

            {/* Stats Dashboard */}
            <div className="stats-dashboard">
              <h3>Class Distribution</h3>
              <div className="stats-bars">
                {sortedClasses.map(([className, count]) => {
                  const pct = (count / result.stats.total_points) * 100
                  const classIdx = SCANNET_CLASSES.indexOf(className)
                  const color = classIdx >= 0 ? CLASS_COLORS[classIdx] : '#696969'
                  return (
                    <div className="stat-bar-row" key={className}>
                      <div className="stat-bar-label">
                        <span className="stat-bar-dot" style={{ background: color }} />
                        {className}
                      </div>
                      <div className="stat-bar-track">
                        <div
                          className="stat-bar-fill"
                          style={{ width: `${Math.max(pct, 1)}%`, background: color }}
                        />
                      </div>
                      <div className="stat-bar-pct">{pct.toFixed(1)}%</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Class Legend */}
            <div className="results-legend">
              <h3>Legend</h3>
              <div className="legend-chips">
                {SCANNET_CLASSES.map((name, i) => (
                  <div className="legend-chip" key={i}>
                    <span className="legend-dot" style={{ background: CLASS_COLORS[i] }} />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
