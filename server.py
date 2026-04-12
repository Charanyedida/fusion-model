"""
Spatial-SynergyNet — Flask Backend
Serves model inference via REST API for the React frontend.
Optimized for Render free tier (512 MB RAM).
"""

import os
import io
import gc
import struct
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
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB upload limit
CORS(app, origins=[
    "http://localhost:5173",
    "https://fusion-model.vercel.app",
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


# ==========================================
# LIGHTWEIGHT PLY PARSER (replaces PyVista)
# ==========================================
def parse_ply_lightweight(file_bytes):
    """
    Parse a PLY file without PyVista.
    Supports both ASCII and binary_little_endian formats.
    Much lighter on memory than PyVista (~100MB less RAM).
    """
    try:
        # Find end of header
        header_end = file_bytes.find(b'end_header\n')
        if header_end == -1:
            header_end = file_bytes.find(b'end_header\r\n')
            if header_end == -1:
                print("  ✗ Invalid PLY: no end_header found")
                return np.array([], dtype=np.float32).reshape(0, 3)
            header_end += len(b'end_header\r\n')
        else:
            header_end += len(b'end_header\n')

        header = file_bytes[:header_end].decode('ascii', errors='ignore')
        data = file_bytes[header_end:]

        # Parse header
        num_vertices = 0
        is_binary = False
        properties = []

        for line in header.split('\n'):
            line = line.strip()
            if line.startswith('element vertex'):
                num_vertices = int(line.split()[-1])
            elif line.startswith('format binary'):
                is_binary = True
            elif line.startswith('property'):
                parts = line.split()
                if len(parts) >= 3:
                    properties.append((parts[1], parts[2]))

        if num_vertices == 0:
            print("  ✗ No vertices found in PLY header")
            return np.array([], dtype=np.float32).reshape(0, 3)

        # Find x, y, z property indices
        prop_names = [p[1] for p in properties]
        try:
            x_idx = prop_names.index('x')
            y_idx = prop_names.index('y')
            z_idx = prop_names.index('z')
        except ValueError:
            print("  ✗ PLY file missing x/y/z properties")
            return np.array([], dtype=np.float32).reshape(0, 3)

        if is_binary:
            # Binary parsing
            # Build struct format from properties
            type_map = {
                'float': 'f', 'float32': 'f',
                'double': 'd', 'float64': 'd',
                'uchar': 'B', 'uint8': 'B',
                'char': 'b', 'int8': 'b',
                'ushort': 'H', 'uint16': 'H',
                'short': 'h', 'int16': 'h',
                'uint': 'I', 'uint32': 'I',
                'int': 'i', 'int32': 'i',
            }
            fmt = '<'  # little endian
            for ptype, _ in properties:
                fmt += type_map.get(ptype, 'f')

            vertex_size = struct.calcsize(fmt)
            points = np.zeros((num_vertices, 3), dtype=np.float32)

            for i in range(num_vertices):
                offset = i * vertex_size
                if offset + vertex_size > len(data):
                    num_vertices = i
                    points = points[:i]
                    break
                values = struct.unpack(fmt, data[offset:offset + vertex_size])
                points[i, 0] = values[x_idx]
                points[i, 1] = values[y_idx]
                points[i, 2] = values[z_idx]
        else:
            # ASCII parsing
            lines = data.decode('ascii', errors='ignore').strip().split('\n')
            actual_count = min(num_vertices, len(lines))
            points = np.zeros((actual_count, 3), dtype=np.float32)

            for i in range(actual_count):
                values = lines[i].strip().split()
                if len(values) > max(x_idx, y_idx, z_idx):
                    points[i, 0] = float(values[x_idx])
                    points[i, 1] = float(values[y_idx])
                    points[i, 2] = float(values[z_idx])

        print(f"  ✓ Parsed {len(points):,} points from PLY file (lightweight parser)")
        return points

    except Exception as e:
        print(f"  ✗ PLY parse error: {e}")
        return np.array([], dtype=np.float32).reshape(0, 3)


@app.route('/api/predict', methods=['POST'])
def predict():
    """Accept .ply file upload, run inference, return points + predictions."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if not file.filename.lower().endswith('.ply'):
        return jsonify({'error': 'Only .ply files are supported'}), 400

    try:
        print(f"  → Received file: {file.filename}")
        file_bytes = file.read()
        print(f"  → File size: {len(file_bytes):,} bytes")

        points = parse_ply_lightweight(file_bytes)
        del file_bytes  # Free memory immediately
        gc.collect()

        if len(points) == 0:
            return jsonify({'error': 'Could not parse any points from the file'}), 400

        # Preprocess (center X/Y)
        centroid = np.mean(points, axis=0)
        input_points = np.copy(points)
        input_points[:, 0] -= centroid[0]
        input_points[:, 1] -= centroid[1]

        input_tensor = torch.from_numpy(input_points).float().unsqueeze(0)
        del input_points  # Free memory
        gc.collect()

        # Inference
        print("  → Running inference...")
        with torch.no_grad():
            logits = model(input_tensor)
            predictions = torch.argmax(logits, dim=2).squeeze(0).numpy()

        del input_tensor, logits  # Free memory
        gc.collect()

        # Compute statistics
        unique, counts = np.unique(predictions, return_counts=True)
        total = int(len(predictions))
        class_counts = {}
        for cls_id, count in zip(unique, counts):
            class_counts[SCANNET_CLASSES[int(cls_id)]] = int(count)

        response = jsonify({
            'points': points.tolist(),
            'predictions': predictions.tolist(),
            'stats': {
                'total_points': total,
                'classes_found': int(len(unique)),
                'class_counts': class_counts
            },
            'classes': SCANNET_CLASSES
        })

        del points, predictions  # Free memory
        gc.collect()

        print(f"  ✓ Inference complete! {total:,} points, {len(unique)} classes")
        return response

    except Exception as e:
        gc.collect()
        print(f"  ✗ Error: {e}")
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
