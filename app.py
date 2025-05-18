import streamlit as st
import streamlit.components.v1 as components
import json
import os
from algorithms.graph_algorithms import dfs, bfs, dijkstra
from algorithms.sorting import quicksort

# Get the absolute path to the static files
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")

# Helper function to create parameter with tooltip
def parameter_with_tooltip(label, tooltip, widget_func, *args, **kwargs):
    """
    Creates a parameter with a tooltip explanation.
    Args:
        label: The label for the parameter
        tooltip: The explanation text
        widget_func: The Streamlit widget function to use (e.g., st.slider, st.number_input)
        *args, **kwargs: Arguments to pass to the widget function
    
    Returns:
        The value from the widget
    """
    # Create the actual parameter widget
    result = widget_func(label, *args, **kwargs)
    # Create a container for the parameter with tooltip
    html_code = f"""
    <style>
    .tooltip-icon {{
        display: inline-block;
        width: 18px;
        height: 18px;
        background-color: #4285f4;
        color: white;
        border-radius: 50%;
        text-align: center;
        line-height: 18px;
        font-size: 12px;
        font-weight: bold;
        margin-left: 5px;
        cursor: help;
        position: relative;
        vertical-align: middle;
    }}
    .tooltip-icon:hover::after {{
        content: "{tooltip}";
        position: absolute;
        left: 25px;
        top: -5px;
        background-color: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        width: 220px;
        font-size: 12px;
        line-height: 1.4;
        z-index: 1000;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        white-space: normal;
    }}
    .tooltip-icon:hover::before {{
        content: '';
        position: absolute;
        left: 18px;
        top: 7px;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-right: 6px solid #333;
    }}
    /* Target the label containing our parameter */
    .stSlider label, .stSelectbox label, .stNumberInput label, .stRadio label, .stCheckbox label {{
        display: flex !important;
        align-items: center !important;
    }}
    </style>
    <script>
    function addTooltipIcons() {{
        const labels = document.querySelectorAll('.sidebar label');
        const lastLabel = Array.from(labels).pop();
        if (lastLabel) {{
            const tooltipIcon = document.createElement('span');
            tooltipIcon.className = 'tooltip-icon';
            tooltipIcon.innerHTML = '?';
            lastLabel.appendChild(tooltipIcon);
        }}
    }}
    setTimeout(addTooltipIcons, 500);
    </script>
    """
    st.sidebar.markdown(html_code, unsafe_allow_html=True)
    
    return result

# Main entry point for the Streamlit app
def main():
    st.set_page_config(
        page_title="Algorithm Visualization Tool",
        page_icon="📊",
        layout="wide",
    )
    
    # Initialize session state variables to remember selections
    if 'algorithm_type' not in st.session_state:
        st.session_state.algorithm_type = "Graph Algorithms"
    if 'algorithm' not in st.session_state:
        st.session_state.algorithm = "Depth-First Search (DFS)"
    if 'create_mode' not in st.session_state:
        st.session_state.create_mode = "Automatic"
    if 'nodes' not in st.session_state:
        st.session_state.nodes = 10
    if 'edge_density' not in st.session_state:
        st.session_state.edge_density = 0.3
    if 'array_size' not in st.session_state:
        st.session_state.array_size = 20
    if 'is_random' not in st.session_state:
        st.session_state.is_random = True
    if 'pivot_method' not in st.session_state:
        st.session_state.pivot_method = "last"
    
    # Add Font Awesome
    st.markdown("""
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
    <script>
    function checkFontAwesome() {
        if (typeof FontAwesome !== 'undefined' || document.querySelector('.fa, .fas, .far, .fab')) {
            console.log('Font Awesome is loaded');
        } else {
            console.log('Font Awesome not loaded, attempting to load it again');
            const linkElement = document.createElement('link');
            linkElement.rel = 'stylesheet';
            linkElement.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(linkElement);
            const scriptElement = document.createElement('script');
            scriptElement.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js';
            document.head.appendChild(scriptElement);
        }
    }
    setTimeout(checkFontAwesome, 1000);
    </script>
    """, unsafe_allow_html=True)
    
    st.title("Algorithm Visualization Tool")
    
    # Add CSS for container and fullscreen styling
    st.markdown("""
    <style>
    /* Ensure all visualization elements stay within the container */
    .visualization-container {
        overflow: hidden !important; /* Keep this to prevent scrollbars from SVG content */
        position: relative; /* Crucial for absolute positioning of children like fullscreen button */
        margin: 20px auto;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        background-color: #ffffff;
        color: #333333;
        padding: 15px; /* Add some padding to the container itself */
    }
    
    /* Fullscreen mode styling - handled by main.js */
    
    /* Title bar for the visualization (e.g., "DFS Visualization") */
    .vis-title {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        background-color: #f0f0f0;
        color: #333333;
        padding: 10px 0; /* Adjusted padding */
        border-bottom: 1px solid #ddd;
        margin-bottom: 10px; /* Space below title before controls */
    }
    
    /* Graph editor controls positioning for NORMAL view */
    .graph-editor-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 8px; /* Slightly reduced padding */
        background-color: #f9f9f9; /* Light background */
        border-radius: 6px;
        margin-bottom: 15px; /* Space below controls before SVG/Content */
        /* It will naturally be top-left within its flow after .vis-title */
    }
    
    /* SVG element styling */
    .visualization-container svg {
        display: block; /* Remove extra space below SVG */
        margin-left: auto; /* Center SVG if it's narrower than container */
        margin-right: auto;
        background-color: #ffffff; /* Ensure SVG background is white */
    }
        
    /* Explanation panels container styling for NORMAL view */
    .explanation-container {
        display: flex; /* Use flex for internal layout of steps/reason */
        flex-direction: row;
        flex-wrap: wrap; /* Allow wrapping on smaller screens */
        justify-content: space-between;
        margin-top: 20px; /* Space above panels */
        /* For right alignment, we will ensure it doesn't take full width unless content forces it */
        /* If the SVG is wide, these panels will appear below it */
    }
    
    /* Individual explanation panels */
    .step-explanation {
        background: linear-gradient(to right, #f8f8f8, #e9e9e9) !important; /* Subtle gradient */
        border-radius: 6px !important;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08) !important;
        color: #333333 !important;
        padding: 12px !important; /* Adjusted padding */
        flex-basis: 48%; /* Aim for two columns, with a bit of space */
        min-width: 280px; /* Minimum width before wrapping */
        margin-bottom: 10px; /* Space between panels if they wrap */
    }
    
    .steps-panel {
        border-left: 3px solid #4285f4 !important;
    }
    
    .reason-panel {
        border-left: 3px solid #34a853 !important;
    }
    
    /* Ensure controls stay within the container - general rule */
    .control-panel, .zoom-controls, .quicksort-options {
        max-width: calc(100% - 20px); /* Max width considering some padding */
        margin-left: auto; /* Center these controls */
        margin-right: auto;
    }
    
    /* General control panel (Play/Pause, Next, etc.) */
    .control-panel {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        padding: 10px;
        background-color: #f0f0f0;
        border-radius: 8px;
        margin-top: 15px; /* Space above this panel */
        margin-bottom: 10px; /* Space below this panel */
    }
    
    .control-panel button {
        min-width: 80px;
        padding: 6px 12px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
        background-color: #e0e0e0;
        color: #333333;
    }
    
    .control-panel button:hover {
        background-color: #d0d0d0;
    }
    
    .control-panel .play-pause {
        background-color: #4285f4;
        color: white;
    }
    
    .control-panel .play-pause:hover {
        background-color: #2a75e8;
    }
    
    /* Improved speed selector */
    .speed-selector {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .speed-selector select {
        padding: 4px 8px;
        border-radius: 4px;
        background-color: #fff;
        color: #333;
        border: 1px solid #ddd;
    }
    
    /* Improved graph editor controls */
    .graph-editor-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 10px;
        background-color: #f5f5f5;
        border-radius: 8px;
        margin: 10px 0;
    }
    
    .editor-button {
        padding: 6px 12px;
        border-radius: 4px;
        border: none; 
        cursor: pointer;
        background-color: #e0e0e0;
        color: #333;
    }
    
    .editor-button:hover {
        background-color: #d0d0d0;
    }
    
    .editor-button.active {
        background-color: #4285f4;
        color: white;
    }
    
    /* Icon styles */
    .fa, .fas, .far, .fab {
        margin-right: 5px;
    }
    
    /* Fullscreen button styles - specific absolute positioning */
    .fullscreen-button {
        background-color: rgba(66, 133, 244, 0.9);
        color: white;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        font-size: 16px;
        padding: 8px 12px;
        border-radius: 4px;
        position: absolute; /* Relative to .visualization-container */
        top: 10px; /* Positioned near top-right of the container */
        right: 10px;
        z-index: 100000;
    }
    
    .fullscreen-button:hover {
        background-color: rgba(25, 103, 210, 0.9);
    }
    
    /* Button styling */
    .fullscreen-button, .zoom-button {
        padding: 8px;
        border-radius: 4px;
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        cursor: pointer;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 36px;
        height: 36px;
        transition: background-color 0.2s ease;
        font-weight: bold;
        font-size: 16px;
        font-family: Arial, sans-serif;
    }
    
    .fullscreen-button:hover, .zoom-button:hover {
        background-color: #e0e0e0;
    }
    
    /* Remove icon-specific styling as we're using text now */
    </style>
    """, unsafe_allow_html=True)
    
    # Sidebar with algorithm selection and controls
    st.sidebar.header("Algorithm Selection")
    
    # Temporarily store the old algorithm type if it exists, otherwise default
    old_algorithm_type = st.session_state.get('algorithm_type', "Graph Algorithms")

    algorithm_type = parameter_with_tooltip(
        "Choose Algorithm Type", 
        "Select the category of algorithms you want to visualize.",
        st.sidebar.selectbox,
        ["Graph Algorithms", "Sorting Algorithms"],
        # Use .get() for robustness on first run for index
        index=["Graph Algorithms", "Sorting Algorithms"].index(st.session_state.get('algorithm_type', "Graph Algorithms"))
    )
    st.session_state.algorithm_type = algorithm_type

    # If algorithm_type has changed, reset the specific algorithm choice to a valid default
    if old_algorithm_type != st.session_state.algorithm_type:
        if st.session_state.algorithm_type == "Graph Algorithms":
            st.session_state.algorithm = "Depth-First Search (DFS)"  # Default for Graph
        elif st.session_state.algorithm_type == "Sorting Algorithms":
            st.session_state.algorithm = "QuickSort"  # Default for Sorting
    
    # Now, st.session_state.algorithm should hold a potentially valid default for the current algorithm_type
    
    if st.session_state.algorithm_type == "Graph Algorithms":
        valid_graph_algos = ["Depth-First Search (DFS)", "Breadth-First Search (BFS)", "Dijkstra's Algorithm"]
        # Ensure current algorithm is valid for graph algos, otherwise reset to default for this type
        current_graph_algo_from_state = st.session_state.get("algorithm", valid_graph_algos[0])
        if current_graph_algo_from_state not in valid_graph_algos:
            st.session_state.algorithm = valid_graph_algos[0]
        
        algorithm = parameter_with_tooltip(
            "Choose Algorithm", 
            "Select a specific graph algorithm to visualize.",
            st.sidebar.selectbox,
            valid_graph_algos,
            index=valid_graph_algos.index(st.session_state.algorithm) 
        )
        st.session_state.algorithm = algorithm # Update session state with selection
        
        # Graph parameters
        st.sidebar.header("Graph Parameters")
        
        # Add user creation option
        create_mode = parameter_with_tooltip(
            "Graph Creation Mode", 
            "Automatic: Creates a random graph with specified parameters. Manual: Allows you to build your own graph.",
            st.sidebar.radio,
            ["Automatic", "Manual"],
            index=["Automatic", "Manual"].index(st.session_state.create_mode)
        )
        
        # Store create mode
        st.session_state.create_mode = create_mode
        
        if create_mode == "Automatic":
            nodes = parameter_with_tooltip(
                "Number of Nodes", 
                "The number of vertices in the graph. More nodes create a more complex graph.",
                st.sidebar.slider,
                5, 20, st.session_state.nodes
            )
            
            # Store nodes value
            st.session_state.nodes = nodes
            
            edge_density = parameter_with_tooltip(
                "Edge Density", 
                "Controls how connected the graph is. Higher values create more edges between nodes.",
                st.sidebar.slider, 
                0.1, 1.0, st.session_state.edge_density
            )
            
            # Store edge density
            st.session_state.edge_density = edge_density
            
            # Add option for directed/undirected graph
            if 'is_directed' not in st.session_state:
                st.session_state.is_directed = False
                
            is_directed = parameter_with_tooltip(
                "Graph Type", 
                "Choose whether the graph is directed (arrows showing direction) or undirected.",
                st.sidebar.radio,
                ["Undirected", "Directed"], 
                index=1 if st.session_state.is_directed else 0
            )
            
            # Store directed graph choice
            st.session_state.is_directed = (is_directed == "Directed")
            
            # Generate graph data
            graph_data = generate_graph(nodes, edge_density, st.session_state.is_directed)
        else:
            # For user-created graphs, start with an empty graph
            # Allow selecting graph type in manual mode as well
            if 'is_directed' not in st.session_state:
                st.session_state.is_directed = False
                
            is_directed = parameter_with_tooltip(
                "Graph Type", 
                "Choose whether the graph is directed (arrows showing direction) or undirected.",
                st.sidebar.radio,
                ["Undirected", "Directed"], 
                index=1 if st.session_state.is_directed else 0
            )
            
            # Store directed graph choice
            st.session_state.is_directed = (is_directed == "Directed")
            
            # The actual graph creation happens in JavaScript
            graph_data = {"nodes": [], "links": [], "directed": st.session_state.is_directed}
            st.sidebar.info("""
            In manual mode, you can build your own graph:
            1. Click the 'Add Node' button, then click anywhere on the white space to create a node
            2. Click 'Add Edge', select a source node, then select a target node, and enter the weight 
            3. Use 'Delete' button to remove nodes or edges by clicking on them
            4. 'Reset Graph' clears the entire graph
            """)
        
        # Algorithm specific parameters
        if algorithm == "Dijkstra's Algorithm":
            if graph_data["nodes"]:
                start_node = parameter_with_tooltip(
                    "Start Node", 
                    "The source node from which Dijkstra's algorithm will find shortest paths to all other nodes.",
                    st.sidebar.number_input,
                    0, len(graph_data["nodes"])-1, 0
                )
            else:
                start_node = 0
                st.sidebar.text("Start node: 0 (create nodes first)")
        
        # Create visualization
        if algorithm == "Depth-First Search (DFS)":
            st.markdown("### Depth-First Search (DFS) Visualization")
            st.markdown("""
            **Description**: DFS explores as far as possible along each branch before backtracking. 
            It uses a stack to keep track of vertices to visit next.
            """)
            visualize_graph_algorithm(graph_data, "dfs")
        elif algorithm == "Breadth-First Search (BFS)":
            st.markdown("### Breadth-First Search (BFS) Visualization")
            st.markdown("""
            **Description**: BFS explores all neighbor nodes at the present depth before moving to nodes at the next depth level. 
            It uses a queue to keep track of vertices to visit next.
            """)
            visualize_graph_algorithm(graph_data, "bfs")
        elif algorithm == "Dijkstra's Algorithm":
            st.markdown("### Dijkstra's Algorithm Visualization")
            st.markdown("""
            **Description**: Dijkstra's algorithm finds the shortest paths from a source node to all other nodes in a weighted graph. 
            It uses a priority queue to select the next vertex with the smallest distance.
            """)
            visualize_graph_algorithm(graph_data, "dijkstra", start_node=start_node)
    
    elif st.session_state.algorithm_type == "Sorting Algorithms":  # Sorting Algorithms
        valid_sorting_algos = ["QuickSort"]
        # Ensure current algorithm is valid for sorting algos, otherwise reset to default
        current_sorting_algo_from_state = st.session_state.get("algorithm", valid_sorting_algos[0])
        if current_sorting_algo_from_state not in valid_sorting_algos:
            st.session_state.algorithm = valid_sorting_algos[0]
            
        algorithm = parameter_with_tooltip(
            "Choose Algorithm", 
            "Select a specific sorting algorithm to visualize.",
            st.sidebar.selectbox,
            valid_sorting_algos,
            index=valid_sorting_algos.index(st.session_state.algorithm)
        )
        st.session_state.algorithm = algorithm # Update session state with selection
        
        # Array parameters
        st.sidebar.header("Array Parameters")
        array_size = parameter_with_tooltip(
            "Array Size", 
            "The number of elements in the array to be sorted. Larger arrays show more complex sorting behavior.",
            st.sidebar.slider,
            5, 100, st.session_state.array_size
        )
        
        # Store array size
        st.session_state.array_size = array_size
        
        is_random = parameter_with_tooltip(
            "Random Array", 
            "If checked, creates a completely random array. If unchecked, creates a partially sorted array.",
            st.sidebar.checkbox,
            st.session_state.is_random
        )
        
        # Store is_random value
        st.session_state.is_random = is_random
        
        # QuickSort specific parameters
        if algorithm == "QuickSort":
            pivot_method = parameter_with_tooltip(
                "Pivot Selection Method (Server-Side)", 
                "Controls how the pivot element is chosen for partitioning the array. Different methods can affect performance.",
                st.sidebar.selectbox,
                ["last", "first", "middle", "random", "median"],
                index=["last", "first", "middle", "random", "median"].index(st.session_state.pivot_method)
            )
            
            # Store pivot method
            st.session_state.pivot_method = pivot_method
        else:
            pivot_method = "last"
        
        # Generate array data
        array_data = generate_array(array_size, is_random)
        
        # Create visualization
        if algorithm == "QuickSort":
            st.markdown("### QuickSort Visualization")
            st.markdown("""
            **Description**: QuickSort is a divide-and-conquer algorithm that picks an element as a pivot and 
            partitions the array around the pivot. It has an average time complexity of O(n log n).
            
            You can change the pivot selection method in the sidebar (server-side) or in the visualization 
            controls (client-side, for demonstration).
            """)
            visualize_sorting_algorithm(array_data, "quicksort", pivot_method=pivot_method)
    
    # Controls for visualization
    st.sidebar.header("Visualization Controls")
    speed = parameter_with_tooltip(
        "Animation Speed", 
        "Controls how fast the visualization runs. Higher values make the animation faster.",
        st.sidebar.slider,
        0.1, 2.0, 1.0
    )
    
    step_size = parameter_with_tooltip(
        "Step Size", 
        "Number of algorithm steps to execute at once when using 'Next' button.",
        st.sidebar.slider,
        1, 5, 1
    )
    
    # JavaScript to control speed and step size
    js_control = f"""
    <script>
        const speed = {speed};
        const stepSize = {step_size};
        
        
        if (window.updateControlParams) {{
            window.updateControlParams(speed, stepSize);
        }}
    </script>
    """
    components.html(js_control, height=0)

def generate_graph(nodes, edge_density, is_directed=False):
    """Generate a random graph with specified parameters."""
    import networkx as nx
    import random
    
    # Create either directed or undirected random graph
    if is_directed:
        G = nx.gnp_random_graph(nodes, edge_density, directed=True)
    else:
        G = nx.gnp_random_graph(nodes, edge_density, directed=False)
    
    # Add random weights to edges
    for u, v in G.edges():
        G[u][v]['weight'] = random.randint(1, 10)
    
    # Convert to dictionary format for D3.js
    graph_data = {
        "nodes": [{"id": i} for i in range(nodes)],
        "links": [{"source": u, "target": v, "weight": G[u][v]['weight']} 
                 for u, v in G.edges()],
        "directed": is_directed  # Include whether the graph is directed
    }
    
    return graph_data

def generate_array(size, is_random):
    """Generate an array for sorting visualization."""
    import random
    
    if is_random:
        return [random.randint(1, 100) for _ in range(size)]
    else:
        # Generate a nearly sorted array with some out-of-place elements
        arr = list(range(1, size + 1))
        swaps = max(1, size)
        for _ in range(swaps):
            i, j = random.sample(range(size), 2)
            arr[i], arr[j] = arr[j], arr[i]
        return arr

def visualize_graph_algorithm(graph_data, algorithm, **params):
    """Create a D3.js visualization for graph algorithms."""
    # Pass data and algorithm to the D3 visualization
    graph_json = json.dumps(graph_data)
    
    # Execute algorithm to get steps
    if algorithm == "dfs":
        start_node = params.get("start_node", 0)
        steps = dfs(graph_data, start_node)
        # Add explanations to steps
        for step in steps:
            if step["type"] == "visit":
                step["action"] = f"Visiting node {step['node']}"
                step["reason"] = f"DFS selects an unvisited neighbor of the current node to explore next."
            elif step["type"] == "explore":
                step["action"] = f"Exploring edge from {step['from']} to {step['to']}"
                step["reason"] = f"DFS explores edges to find unvisited nodes."
            elif step["type"] == "complete":
                step["action"] = f"Completed exploration of node {step['node']}"
                step["reason"] = f"All neighbors of this node have been visited, so DFS marks it as complete."
            elif step["type"] == "backtrack":
                step["action"] = f"Backtracking from {step['from']} to {step['to']}"
                step["reason"] = f"DFS backtracks when it reaches a dead-end or a node with no unvisited neighbors."
    elif algorithm == "bfs":
        start_node = params.get("start_node", 0)
        steps = bfs(graph_data, start_node)
        # Add explanations to steps
        for step in steps:
            if step["type"] == "visit":
                step["action"] = f"Visiting node {step['node']}"
                step["reason"] = f"BFS visits nodes in order of their distance from the start node."
            elif step["type"] == "explore":
                step["action"] = f"Exploring edge from {step['from']} to {step['to']}"
                step["reason"] = f"BFS explores all edges from a node before moving to the next level."
            elif step["type"] == "complete":
                step["action"] = f"Completed exploration of node {step['node']}"
                step["reason"] = f"All neighbors of this node have been discovered, so BFS marks it as complete."
    elif algorithm == "dijkstra":
        start_node = params.get("start_node", 0)
        steps = dijkstra(graph_data, start_node)
        # Add explanations to steps
        for step in steps:
            if step["type"] == "distance":
                step["action"] = f"Setting distance of node {step['node']} to {step['distance']}"
                step["reason"] = f"Dijkstra's algorithm updates distances as it finds shorter paths."
            elif step["type"] == "visit":
                step["action"] = f"Visiting node {step['node']}"
                step["reason"] = f"Dijkstra's algorithm always selects the unvisited node with the smallest distance."
            elif step["type"] == "relax":
                if step["success"]:
                    step["action"] = f"Relaxing edge from {step['from']} to {step['to']}: new distance {step['newDistance']}"
                    step["reason"] = f"Found a shorter path to node {step['to']} through node {step['from']}."
                else:
                    step["action"] = f"Tried relaxing edge from {step['from']} to {step['to']}, but no improvement"
                    step["reason"] = f"The current path to node {step['to']} is already optimal."
            elif step["type"] == "complete":
                step["action"] = f"Completed processing of node {step['node']}"
                step["reason"] = f"All edges from this node have been considered for relaxation."
            elif step["type"] == "path":
                step["action"] = f"Final shortest paths calculated"
                step["reason"] = f"The algorithm has found the shortest path from the start node to all other nodes."
    
    steps_json = json.dumps(steps)
    
    # Embed the D3.js visualization
    html_content = f"""
    <div id="graph-container" class="visualization-container"></div>
    
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script>
        const graphData = {graph_json};
        const algorithmSteps = {steps_json};
        const algorithm = "{algorithm}";
        
        
        document.addEventListener("DOMContentLoaded", function() {{
            if (window.createGraphVisualization) {{
                window.createGraphVisualization(
                    graphData, 
                    algorithmSteps, 
                    algorithm, 
                    document.getElementById("graph-container")
                );
            }}
        }});
    </script>
    """
    
    # Include custom JavaScript and CSS
    graph_js_path = os.path.join(STATIC_DIR, "js", "visualizations", "graph.js")
    main_js_path = os.path.join(STATIC_DIR, "js", "main.js")
    css_path = os.path.join(STATIC_DIR, "css", "style.css")
    
    with open(graph_js_path, "r") as f:
        graph_js = f.read()
    
    with open(main_js_path, "r") as f:
        main_js = f.read()
    
    with open(css_path, "r") as f:
        css = f.read()
    
    full_html = f"""
    <style>{css}</style>
    {html_content}
    <script>{main_js}</script>
    <script>{graph_js}</script>
    """
    
    components.html(full_html, height=800, scrolling=False)

def visualize_sorting_algorithm(array_data, algorithm, **params):
    """Create a D3.js visualization for sorting algorithms."""
    # Pass data and algorithm to the D3 visualization
    array_json = json.dumps(array_data)
    
    # Execute algorithm to get steps
    if algorithm == "quicksort":
        pivot_method = params.get("pivot_method", "last")
        steps = quicksort(array_data.copy(), pivot_method=pivot_method)
        # Add explanations to steps
        for i, step in enumerate(steps):
            if not "action" in step:  # Only add if not already present
                # Keep track of current pivot for all steps
                current_pivot_idx = -1
                if "pivot" in step:
                    current_pivot_idx = step['pivot']
                    step["action"] = f"Selected pivot: value {array_data[step['pivot']]} at index {step['pivot']}"
                    step["reason"] = f"Using {pivot_method} element as pivot"
                elif "range" in step:
                    low, high = step['range']
                    subarray_elements = array_data[low:high+1]
                    
                    # Find pivot if it exists in this range from previous steps
                    pivot_info = ""
                    for j in range(i, -1, -1):
                        if "pivot" in steps[j] and low <= steps[j]["pivot"] <= high:
                            current_pivot_idx = steps[j]["pivot"]
                            pivot_info = f" (pivot at index {current_pivot_idx}, value {array_data[current_pivot_idx]})"
                            break
                            
                    step["action"] = f"Processing subarray from index {low} to {high}: {subarray_elements}{pivot_info}"
                    step["reason"] = ""
                elif "comparing" in step:
                    comparing_indices = step['comparing']
                    comparing_values = [array_data[idx] for idx in comparing_indices]
                    step["action"] = f"Comparing value {comparing_values[0]} with pivot"
                    step["reason"] = ""
                elif "swapping" in step:
                    swapping_indices = step['swapping']
                    swapping_values = [array_data[idx] for idx in swapping_indices]
                    step["action"] = f"Swapping values: {swapping_values[0]} and {swapping_values[1]}"
                    step["reason"] = ""
                elif "sorted" in step:
                    if len(step['sorted']) == len(array_data):
                        step["action"] = "Array sorted successfully"
                        step["reason"] = ""
                    else:
                        sorted_indices = step['sorted']
                        sorted_values = [array_data[idx] for idx in sorted_indices]
                        step["action"] = f"Elements now in final position: {sorted_values}"
                        step["reason"] = ""
                else:
                    step["action"] = f"Step {i+1}"
                    step["reason"] = ""
    
    steps_json = json.dumps(steps)
    
    # Embed the D3.js visualization
    html_content = f"""
    <div id="sorting-container" class="visualization-container"></div>
    
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script>
        const arrayData = {array_json};
        const algorithmSteps = {steps_json};
        const algorithm = "{algorithm}";
        
        
        document.addEventListener("DOMContentLoaded", function() {{
            if (window.createSortingVisualization) {{
                window.createSortingVisualization(
                    arrayData, 
                    algorithmSteps, 
                    algorithm, 
                    document.getElementById("sorting-container")
                );
            }}
        }});
    </script>
    """
    
    # Include custom JavaScript and CSS
    sorting_js_path = os.path.join(STATIC_DIR, "js", "visualizations", "sorting.js")
    main_js_path = os.path.join(STATIC_DIR, "js", "main.js")
    css_path = os.path.join(STATIC_DIR, "css", "style.css")
    
    with open(sorting_js_path, "r") as f:
        sorting_js = f.read()
    
    with open(main_js_path, "r") as f:
        main_js = f.read()
    
    with open(css_path, "r") as f:
        css = f.read()
    
    full_html = f"""
    <style>{css}</style>
    {html_content}
    <script>{main_js}</script>
    <script>{sorting_js}</script>
    """
    
    components.html(full_html, height=1000, scrolling=False)

if __name__ == "__main__":
    main()