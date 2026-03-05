import torch
import torch.nn as nn
import numpy as np
import pyvista as pv
import sys
import os

# ==========================================
# 1. SCANNET CLASS DEFINITIONS
# ==========================================
SCANNET_CLASSES = [
    "Wall", "Floor", "Cabinet", "Bed", "Chair", "Sofa", "Table", "Door", "Window", 
    "Bookshelf", "Picture", "Counter", "Desk", "Curtain", "Fridge", "ShowerCurtain", 
    "Toilet", "Sink", "Bathtub", "OtherFurniture"
]

# ==========================================
# 2. MODEL ARCHITECTURE (Must match Training)
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
            LoRALinear(384, 128, rank=8),
            nn.ReLU(),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        return self.task_head(self.backbone(x))

# ==========================================
# 3. THE REAL DEMO VISUALIZATION
# ==========================================
def run_demo(file_path=None):
    # --- 1. Load Data ---
    if file_path and os.path.exists(file_path):
        print(f"Loading Real Scene: {file_path}...")
        try:
            mesh = pv.read(file_path)
            points = mesh.points
        except Exception as e:
            print(f"Error reading file: {e}")
            return
    else:
        print("No file provided. Generating SYNTHETIC demo data...")
        floor = np.column_stack([np.random.uniform(-2, 2, (2500, 2)), np.zeros(2500)])
        wall = np.column_stack([np.random.uniform(-2, 2, 2500), np.full(2500, 2), np.random.uniform(0, 2, 2500)])
        points = np.vstack([floor, wall])

    # --- 2. CRITICAL FIX: Preprocess (Center X/Y only) ---
    # Do NOT scale the room down. Keep the real-world scale and height (Z-axis).
    centroid = np.mean(points, axis=0)
    input_points = np.copy(points)
    input_points[:, 0] -= centroid[0] # Center X
    input_points[:, 1] -= centroid[1] # Center Y
    
    input_tensor = torch.from_numpy(input_points).float().unsqueeze(0) # [1, N, 3]

    # --- 3. Load Model ---
    print("Loading AI Model...")
    model = SpatialSynergyNet(num_classes=20)
    try:
        state_dict = torch.load("model_three.pth", map_location='cpu', weights_only=True)
        model.load_state_dict(state_dict, strict=False)
        print("Weights loaded successfully!")
    except FileNotFoundError:
        print("ERROR: 'SpatialSynergyNet_Production.pth' not found. Please download it from Kaggle.")
        return

    model.eval()
    
    # --- 4. Inference ---
    print("Running Spatial-SynergyNet Inference...")
    with torch.no_grad():
        logits = model(input_tensor) # [1, N, 20]
        predictions = torch.argmax(logits, dim=2).squeeze(0).numpy() # [N]
        
    print("Inference Complete! Opening 3D Visualization Window...")
    
    # --- 5. Visualization with Real Labels ---
    cloud = pv.PolyData(points) 
    cloud['Semantic Class'] = predictions
    
    pl = pv.Plotter()
    pl.add_text("Spatial-SynergyNet: Object Classification", font_size=18)
    pl.add_text("Press 'q' to close", position='upper_left', font_size=10)
    
    # Use annotations to map class numbers to real names (Chair, Wall, Floor, etc.)
    pl.add_mesh(
        cloud, 
        scalars='Semantic Class', 
        cmap='tab20', 
        point_size=6, 
        render_points_as_spheres=True,
        annotations={i: SCANNET_CLASSES[i] for i in range(20)},
        scalar_bar_args={
            'title': "Predicted Objects",
            'label_font_size': 12,
            'n_labels': 0, # Hides the messy numbers, keeps just your text annotations
            'fmt': ''      # Removes decimal formatting
        }
    )
    
    pl.show()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_demo(sys.argv[1])
    else:
        if os.path.exists("real_room.ply"):
            run_demo("real_room.ply")
        else:
            run_demo()