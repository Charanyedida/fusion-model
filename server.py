"""
Spatial-SynergyNet — Flask Backend
Serves model inference via REST API for the React frontend.
"""

import os
import io
import numpy as np
import torch
import torch.nn as nn
from flask import Flask, request, jsonify
from flask_cors import CORS

# ==========================================
# MODEL ARCHITECTURE (Must match Training)
# ==========================================
class LoRALinear(nn.Module):
    def __init__(self, in_features, out_features, rank=8, alpha=16, dropout=0.1):
        super().__init__()
        self.linear = nn.Linear(in_features, out_features)
        self.lora_A = nn.Linear(in_features, rank, bias=False)
        self.lora_B = nn.Linear(rank, out_features, bias=False)
        self.scaling = alpha / rank

    def forward(self, x):
        return self.linear(x) + (self.lora_B(self.lora_A(x)) * self.scaling)


class SpatialSynergyNet(nn.Module):
    def __init__(self, num_classes=20):
        super().__init__()
        self.backbone = nn.Sequential(
            nn.Linear(3, 128), nn.ReLU(),
            nn.Linear(128, 384)
        )
        self.task_head = nn.Sequential(
            nn.Linear(384, 512),
            nn.LayerNorm(512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.LayerNorm(256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, num_classes)
        )

    def forward(self, x):
        return self.task_head(self.backbone(x))


# ==========================================
# SCANNET CLASSES
# ==========================================
SCANNET_CLASSES = [
    "Wall", "Floor", "Cabinet", "Bed", "Chair", "Sofa", "Table", "Door", "Window",
    "Bookshelf", "Picture", "Counter", "Desk", "Curtain", "Fridge", "ShowerCurtain",
    "Toilet", "Sink", "Bathtub", "OtherFurniture"
]

# ==========================================
# FLASK APP
# ==========================================
app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173",
    "https://fusion-model.vercel.app/", 
])

# Load model once at startup
print("Loading SpatialSynergyNet model...")
model = SpatialSynergyNet(num_classes=20)
model_path = os.path.join(os.path.dirname(__file__), "model_4.pth")

try:
    state_dict = torch.load(model_path, map_location='cpu', weights_only=True)
    model.load_state_dict(state_dict, strict=False)
    model.eval()
    print("✓ Model loaded successfully!")
except FileNotFoundError:
    print("✗ WARNING: model_4.pth not found. Inference will fail.")


def parse_ply_with_pyvista(file_bytes):
    """Parse a PLY file using PyVista for reliable binary/ASCII support."""
    import pyvista as pv
    import tempfile

    # Save to temp file so PyVista can read it
    tmp_path = os.path.join(tempfile.gettempdir(), 'upload_temp.ply')
    with open(tmp_path, 'wb') as f:
        f.write(file_bytes)

    try:
        mesh = pv.read(tmp_path)
        points = np.array(mesh.points, dtype=np.float32)
        print(f"  ✓ Parsed {len(points):,} points from PLY file")
        return points
    except Exception as e:
        print(f"  ✗ PyVista parse error: {e}")
        return np.array([], dtype=np.float32).reshape(0, 3)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)



@app.route('/api/predict', methods=['POST'])
def predict():
    """Accept .ply file upload, run inference, return points + predictions."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if not file.filename.lower().endswith('.ply'):
        return jsonify({'error': 'Only .ply files are supported'}), 400

    try:
        file_bytes = file.read()
        points = parse_ply_with_pyvista(file_bytes)

        if len(points) == 0:
            return jsonify({'error': 'Could not parse any points from the file'}), 400

        # Preprocess (center X/Y)
        centroid = np.mean(points, axis=0)
        input_points = np.copy(points)
        input_points[:, 0] -= centroid[0]
        input_points[:, 1] -= centroid[1]

        input_tensor = torch.from_numpy(input_points).float().unsqueeze(0)

        # Inference
        with torch.no_grad():
            logits = model(input_tensor)
            predictions = torch.argmax(logits, dim=2).squeeze(0).numpy()

        # Compute statistics
        unique, counts = np.unique(predictions, return_counts=True)
        total = int(len(predictions))
        class_counts = {}
        for cls_id, count in zip(unique, counts):
            class_counts[SCANNET_CLASSES[int(cls_id)]] = int(count)

        # Subsample for browser performance (max 100k points)
        max_points = 100000
        if len(points) > max_points:
            indices = np.random.choice(len(points), max_points, replace=False)
            indices.sort()
            points_out = points[indices].tolist()
            preds_out = predictions[indices].tolist()
        else:
            points_out = points.tolist()
            preds_out = predictions.tolist()

        return jsonify({
            'points': points_out,
            'predictions': preds_out,
            'stats': {
                'total_points': total,
                'classes_found': int(len(unique)),
                'class_counts': class_counts
            },
            'classes': SCANNET_CLASSES
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model': 'SpatialSynergyNet', 'classes': 20})


if __name__ == '__main__':
    print("\n  ╔═══════════════════════════════════════╗")
    print("  ║   SPATIAL-SYNERGYNET API SERVER       ║")
    port = int(os.environ.get('PORT', 5000))
    print(f"  ║   http://localhost:{port}                ║")
    print("  ╚═══════════════════════════════════════╝\n")
    app.run(host='0.0.0.0', port=port, debug=True)
