# Spatial-SynergyNet — 3D Semantic Segmentation

A high-capacity deep learning model for 3D semantic segmentation on **ScanNet** point clouds, with a **React + Three.js** web UI for in-browser interactive demos.

---

## 🚀 Quick Start

### 1. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the Flask backend
```bash
python server.py
```
This starts the API at `http://localhost:5000`.

### 3. Start the React frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Run the demo
- Upload a `.ply` file through the web UI
- Or run the standalone PyVista demo: `python demo.py real_room.ply`

---

## 🌐 Web Interface

The React UI includes:
- **Hero** — Project overview with animated stats
- **How It Works** — 4-step pipeline visualization
- **Real-Life Applications** — 6 industry use cases (Architecture, Robotics, AR/VR, Healthcare, Heritage, Interior Design)
- **Model Architecture** — Layer diagram and specifications
- **20 ScanNet Classes** — Color-coded category chips
- **Interactive Demo** — Upload a `.ply` file and see:
  - Split-view 3D renderer (raw vs. predictions) powered by Three.js
  - Live class distribution dashboard
  - Drag-and-drop file upload

---

## 🏗️ Real-Life Applications

| Industry | Use Case |
|---|---|
| **Architecture** | Floor plan extraction, BIM progress monitoring, quality control |
| **Robotics** | Indoor navigation, obstacle detection, semantic path planning |
| **Interior Design** | Virtual staging, room measurement, property tours |
| **AR/VR** | Scene reconstruction, spatial anchors, mixed reality |
| **Healthcare** | Assistive navigation for visually impaired, surgical room planning |
| **Heritage** | 3D digitization of monuments, digital restoration |

---

## 📂 Project Structure

```
fusion-model/
├── server.py             # Flask API backend (POST /api/predict)
├── demo.py               # Standalone PyVista visualization
├── model_4.pth           # Trained model weights
├── real_room.ply          # Sample 3D scan
├── requirements.txt       # Python dependencies
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css     # Global design system
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── Hero.jsx
│   │       ├── Pipeline.jsx
│   │       ├── Applications.jsx
│   │       ├── Architecture.jsx
│   │       ├── ClassesGrid.jsx
│   │       ├── DemoSection.jsx  # ← File upload + Three.js viewer
│   │       └── Footer.jsx
│   └── vite.config.js    # Proxy /api → Flask
├── index.html            # Static fallback UI
└── README.md
```

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Three.js, React Three Fiber |
| Backend | Flask, Flask-CORS |
| ML | PyTorch, SpatialSynergyNet |
| Data | NumPy, ScanNet PLY format |
| Viz (standalone) | PyVista |
