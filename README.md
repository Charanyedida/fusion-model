# Spatial-SynergyNet 3D Object Detection Demo

This repository contains a demonstration script (`demo.py`) for Spatial-SynergyNet, a high-capacity model designed to perform 3D semantic segmentation on `ScanNet` point clouds.

## Requirements

Ensure you have Python installed, then install the required dependencies using the newly updated `requirements.txt` file.

```bash
pip install -r requirements.txt
```

## Running the Demo

The script can be executed directly from the terminal. It accepts a `.ply` file representing a 3D scan of a scene.

```bash
python demo.py path/to/your/scene.ply
```

If no arguments are provided, the script will default to using the `real_room.ply` file available in the directory.
Alternatively, users can drag and drop a `.ply` file into the terminal window alongside the script.

## Visualization Interface

When `demo.py` is run, a split-screen interactive pyvista visualization window will open:
- **Left Panel:** Displays the raw, unlabeled 3D geometry of the scene in a clean green color format.
- **Right Panel:** Displays the AI-generated semantic predictions colored according to their respective ScanNet object categories. A vertical legend is available on the right for reference.

The cameras for both panels are linked—rotating, zooming, or panning in one panel will synchronously manipulate the other, allowing straightforward comparison between the raw scan and predictions.
