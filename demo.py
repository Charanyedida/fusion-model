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

# Assuming this script is running your latest High Capacity Model
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
# 3. PRO UI DEMO VISUALIZATION
# ==========================================
# ==========================================
# 3. PRO UI DEMO VISUALIZATION
# ==========================================
def run_demo(file_path=None):
    # --- 1. Load Data ---
    if file_path and os.path.exists(file_path):
        print(f"Loading Raw Scene: {file_path}...")
        try:
            mesh = pv.read(file_path)
            points = mesh.points
        except Exception as e:
            print(f"Error reading file: {e}")
            return
    else:
        print("Please provide a valid .ply file!")
        return

    # --- 2. Preprocess (Center X/Y) ---
    centroid = np.mean(points, axis=0)
    input_points = np.copy(points)
    input_points[:, 0] -= centroid[0] 
    input_points[:, 1] -= centroid[1] 
    
    input_tensor = torch.from_numpy(input_points).float().unsqueeze(0) 

    # --- 3. Load Model ---
    print("Loading AI Model...")
    model = SpatialSynergyNet(num_classes=20)
    try:
        # Make sure this matches your exact filename!
        state_dict = torch.load("SpatialSynergyNet_Ultimate.pth", map_location='cpu', weights_only=True)
        model.load_state_dict(state_dict, strict=False)
        print("Weights loaded successfully!")
    except FileNotFoundError:
        print("ERROR: Model weights not found. Update the filename in the script if needed.")
        return

    model.eval()
    
    # --- 4. Inference ---
    print("Running Spatial-SynergyNet Inference...")
    with torch.no_grad():
        logits = model(input_tensor) 
        predictions = torch.argmax(logits, dim=2).squeeze(0).numpy() 
        
    print("Opening Split-Screen Visualization...")
    
    # --- 5. SPLIT-SCREEN UI VISUALIZATION ---
    cloud = pv.PolyData(points) 
    cloud['Semantic Class'] = predictions
    
    # Create a wide 1x2 Plotter
    pl = pv.Plotter(shape=(1, 2), window_size=[1800, 800])
    
    # Clean white background
    pl.set_background("white") 

    # ----------------------------------------
    # LEFT WINDOW: Raw Geometry (Green)
    # ----------------------------------------
    pl.subplot(0, 0)
    pl.add_text("Input: Raw Unlabeled 3D Scan", font_size=16, color='black')
    
    pl.add_mesh(
        cloud, 
        color='mediumseagreen', 
        point_size=5, 
        render_points_as_spheres=True
    )
        
    # ----------------------------------------
    # RIGHT WINDOW: AI Predictions
    # ----------------------------------------
    pl.subplot(0, 1)
    pl.add_text("Output: Spatial-SynergyNet Prediction", font_size=16, color='black')
    
    # CRITICAL FIX: Vertical Legend on the Right Side
    pl.add_mesh(
        cloud, 
        scalars='Semantic Class', 
        cmap='tab20', 
        point_size=5, 
        render_points_as_spheres=True,
        annotations={i: SCANNET_CLASSES[i] for i in range(20)},
        scalar_bar_args={
            'title': "Object Categories", 
            'vertical': True,         # Forces the legend to be a vertical sidebar
            'position_x': 0.85,       # Pushes it to the right edge of the window
            'position_y': 0.1,        # Starts it a bit above the bottom
            'width': 0.1,             # Makes the color boxes thin
            'height': 0.8,            # Stretches it to use most of the vertical space
            'n_labels': 0, 
            'fmt': '',
            'color': 'black',
            'title_font_size': 14,
            'label_font_size': 12
        }
    )
    
    # Link the cameras so they spin together
    pl.link_views()
    
    # Start the interactive window
    pl.show()
if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_demo(sys.argv[1])
    else:
        # Updated fallback logic to just use your provided ply
        if os.path.exists("real_room.ply"):
            run_demo("real_room.ply")
        else:
            print("Drag and drop your .ply file onto this script!")