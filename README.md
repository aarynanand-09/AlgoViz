# AlgoViz - Algorithm Visualization Tool
# This README provides setup and usage instructions for the AlgoViz visualization tool.
# Sections: Features, Getting Started, Usage, Contributing, License
# ---------------------------------------------
# Features
- **Graph Algorithms**: Visualize common graph traversal and pathfinding algorithms
  - Depth-First Search (DFS)
  - Breadth-First Search (BFS)
  - Dijkstra's Algorithm
- **Sorting Algorithms**: Watch sorting algorithms in action
  - QuickSort
- **Interactive UI**:
  - Step-by-step visualization with explanations
  - Play, pause, forward, and backward controls
  - Dark/Light mode toggle
  - Adjustable animation speed
  - Detailed explanations of each step
  - Fullscreen mode for better viewing
# ---------------------------------------------
# Getting Started
## Prerequisites
- Python 3.7 or higher
- pip (Python package installer)
## Installation
1. Clone the repository or download the source code
2. Navigate to the project directory
3. Install the required dependencies:
```bash
pip install -r requirements.txt
```
## Running the Application
Run the Streamlit application:
```bash
streamlit run algoviz/app.py
```
The application will start and open in your default web browser.
# ---------------------------------------------
# Using the Application
## General Controls
- **Algorithm Selection**: Choose the type of algorithm and specific algorithm to visualize
- **Visualization Controls**:
  - Play/Pause: Start or pause the animation
  - Step Forward: Move one step forward in the algorithm
  - Step Backward: Move one step backward
  - Reset: Reset the visualization to the beginning
  - Speed Control: Adjust animation speed (Slow, Medium, Fast)
  - Fullscreen: Toggle fullscreen mode for better viewing
## Graph Algorithms
1. **Setup**:
   - Choose graph creation mode (Automatic or Manual)
   - For automatic mode, adjust nodes and edge density
   - For manual mode, use the graph editor tools
2. **Graph Editor Tools**:
   - Select: Select elements in the graph
   - Add Node: Click in empty space to add a new node
   - Add Edge: Select source node, then target node, and enter weight
   - Delete: Remove nodes or edges by clicking on them
   - Reset Graph: Clear the entire graph
3. **Start Node Selection**:
   - For algorithms like Dijkstra's, select the starting node
4. **Visualization**:
   - The upper right panel shows current steps
   - The lower right panel provides explanations
   - Different colors indicate:
     - Orange: Currently visited nodes
     - Blue: Current node being processed
     - Green: Completed paths
     - Red: Backtracking
## Sorting Algorithms
1. **Setup**:
   - Choose array size and generation method
2. **Visualization**:
   - Each step in the sorting process is visualized
   - Colors indicate:
     - Orange: Pivot element (for QuickSort)
     - Yellow: Elements being compared
     - Purple: Elements being swapped
     - Green: Sorted elements
# ---------------------------------------------
# Features in Detail
## Explanation Panels
- **Current Step**: Shows what's happening in the current step
- **Explanation**: Provides reasoning and details about the current operation
## Graph Creation
- **Automatic**: Creates a random graph with specified parameters
- **Manual**: Build your own graph with nodes and weighted edges
## Visualization Navigation
- Use the control panel to navigate through algorithm steps
- Zoom controls allow zooming in/out and resetting the view
## Performance Settings
- Adjust animation speed to see algorithms at different paces
- Fullscreen mode for better visibility
# ---------------------------------------------
# Contributing
Contributions are welcome! Feel free to submit pull requests or open issues to improve the application.
# ---------------------------------------------
# Copyright and Usage Restrictions
Copyright © Aaryn Anand 2025

All rights reserved. This code and software are proprietary and confidential.
No part of this codebase may be reproduced, distributed, or transmitted in any form 
or by any means without the prior written permission of the copyright owner.

Unauthorized copying, modification, distribution, or use of this code is strictly prohibited.

