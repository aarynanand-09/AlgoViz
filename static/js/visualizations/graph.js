/**
 * Graph visualization module using D3.js
 * Visualizes graph algorithms: DFS, BFS, and Dijkstra
 */


function createGraphVisualization(data, steps, algorithm, container) {
    
    const width = container.clientWidth;
    const height = 500;
    const nodeRadius = 25; 
    let currentZoom = 1;
    let currentTransform = [0, 0]; 
    
    
    const extendedWidth = width * 10; 
    const extendedHeight = height * 10; 
    
    
    let isUserCreatedGraph = false;
    let editorMode = "select"; 
    let selectedNodes = []; 
    
    
    const isDarkMode = document.querySelector('.visualization-container').style.backgroundColor === 'rgb(18, 18, 18)' || 
                      window.getComputedStyle(document.querySelector('.visualization-container')).backgroundColor === 'rgb(18, 18, 18)';
    
    
    const colors = {
        node: "#4f8fca",  
        nodeStroke: "#333",  
        visitedNode: "#ff5722",  
        currentNode: "#ffeb3b",  
        discoveredNode: "#4caf50",  
        shortestPathNode: "#9c27b0",  
        edge: "#777",  
        edgeHighlight: "#ff5722",  
        text: "#000000",  
        weightBackground: "rgba(0, 0, 0, 0)"  
    };
    
    
    const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .style("background-color", "#ffffff"); 
    
    
    const zoom = d3.zoom()
        .scaleExtent([0.1, 5])
        .on("zoom", (event) => {
            graph.attr("transform", event.transform);
            currentZoom = event.transform.k;
            currentTransform = [event.transform.x, event.transform.y];
        });
    
    svg.call(zoom);
    
    
    const graph = svg.append("g");
    
    
    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-500))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(nodeRadius * 1.5));
    
    simulation.alphaDecay(0.05);

    
    
    let isNewAutoGraph = data.nodes.length > 0 && data.nodes.every(n => n.fx === undefined);
    let simulationRunning = isNewAutoGraph; 

    
    
    
    
    
    isUserCreatedGraph = data.nodes.length > 0 && !isNewAutoGraph;

    simulation.on("end", () => {
        console.log("Simulation ended.");
        simulationRunning = false;
        
        data.nodes.forEach(node => {
            if (node.fx === undefined && node.x !== undefined) node.fx = node.x;
            if (node.fy === undefined && node.y !== undefined) node.fy = node.y;
        });
    });

    if (simulationRunning) { 
        simulation.alpha(0.3).restart();
        console.log("Initial simulation started for auto-graph layout.");
    } else { 
        data.nodes.forEach(node => {
            if (node.x !== undefined) node.fx = node.x;
            if (node.y !== undefined) node.fy = node.y;
        });
        simulation.alphaTarget(0).stop(); 
        console.log("Graph is user-created or pre-laid out. Simulation stopped, nodes fixed.");
    }

    function disableSimulation() {
        console.log("Attempting to disable simulation. Current running state:", simulationRunning);
        simulation.stop(); 
        simulationRunning = false;
        data.nodes.forEach(node => {
            if (node.x !== undefined && node.y !== undefined) { 
                node.fx = node.x;
                node.fy = node.y;
            }
        });
        console.log("Simulation disabled, nodes fixed.");
    }
    
    
    
    const linkGroup = graph.append("g").attr("class", "link-group");
    
    
    if (data.directed) {
        
        svg.append("defs").selectAll("marker")
            .data(["arrow"])
            .enter().append("marker")
            .attr("id", d => d)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", nodeRadius + 9) 
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("fill", colors.edge)
            .attr("d", "M0,-5L10,0L0,5");
    }
    
    
    let link = linkGroup.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("stroke", colors.edge)
        .attr("stroke-width", 2)
        
        .attr("marker-end", data.directed ? "url(#arrow)" : "");
    
    
    let linkLabel = linkGroup.append("g")
        .attr("class", "link-labels")
        .selectAll("g")
        .data(data.links)
        .enter()
        .append("g")
        .attr("class", "link-label-group");
    
    
    linkLabel.append("rect")
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("width", 24)
        .attr("height", 20)
        .attr("x", -12)
        .attr("y", -10)
        .attr("fill", colors.weightBackground)
        .attr("stroke", "none");
    
    
    linkLabel.append("text")
        .attr("class", "link-label")
        .attr("text-anchor", "middle")
        .attr("fill", colors.text)
        .text(d => d.weight);
    
    
    const nodeGroup = graph.append("g").attr("class", "node-group");
    
    
    let node = nodeGroup.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", nodeRadius)
        .attr("fill", colors.node)
        .attr("stroke", colors.nodeStroke)
        .attr("stroke-width", 2)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    
    
    let nodeLabel = nodeGroup.append("g")
        .attr("class", "node-labels")
        .selectAll("text")
        .data(data.nodes)
        .enter()
        .append("text")
        .attr("class", "node-label")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .attr("fill", colors.text)
        .text(d => d.id);
    
    
    let distanceLabels = null;
    if (algorithm === "dijkstra") {
        
        const nodeGroup = graph.append("g").attr("class", "node-group");
        
        distanceLabels = nodeGroup.append("g")
            .attr("class", "distance-labels")
            .selectAll("g")
            .data(data.nodes)
            .enter()
            .append("g")
            .attr("class", "distance-label-group");
        
                    
            distanceLabels.append("rect")
                .attr("rx", 8)
                .attr("ry", 8)
                .attr("width", 40)
                .attr("height", 24)
                .attr("x", -20)
                .attr("y", nodeRadius * 1.4)
                .attr("fill", "rgba(255, 255, 255, 0.7)")
                .attr("stroke", "#ddd")
                .attr("stroke-width", "1px");
        
        
        distanceLabels.append("text")
            .attr("class", "distance-label")
            .attr("text-anchor", "middle")
            .attr("dy", nodeRadius * 1.8)
            .attr("fill", colors.text)
            .text("∞")
            .style("font-size", "14px");
    }
    
    
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        
        linkLabel
            .attr("transform", d => `translate(${(d.source.x + d.target.x) / 2}, ${(d.source.y + d.target.y) / 2})`);
        
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        
        nodeLabel
            .attr("x", d => d.x)
            .attr("y", d => d.y);
        
        if (distanceLabels) {
            distanceLabels
                .attr("transform", d => `translate(${d.x}, ${d.y})`);
        }
    });
    
    
    const explanationPanels = window.createExplanationPanels(container);
    
    
    window.createZoomControls(
        container,
        () => zoomIn(),
        () => zoomOut(),
        () => resetZoom()
    );
    
    
    const editorControls = document.createElement('div');
    editorControls.className = 'graph-editor-controls';
    
    const selectButton = createEditorButton('<i class="fas fa-mouse-pointer"></i> Select', 'select');
    const addNodeButton = createEditorButton('<i class="fas fa-plus-circle"></i> Add Node', 'addNode');
    const addEdgeButton = createEditorButton('<i class="fas fa-project-diagram"></i> Add Edge', 'addEdge');
    const deleteButton = createEditorButton('<i class="fas fa-trash"></i> Delete', 'delete');
    const resetGraphButton = document.createElement('button');
    resetGraphButton.className = 'editor-button';
    resetGraphButton.innerHTML = '<i class="fas fa-redo"></i> Reset Graph';
    resetGraphButton.onclick = resetGraph;
    
    editorControls.appendChild(selectButton);
    editorControls.appendChild(addNodeButton);
    editorControls.appendChild(addEdgeButton);
    editorControls.appendChild(deleteButton);
    editorControls.appendChild(resetGraphButton);

    const visTitleElement = container.querySelector('.vis-title');
    if (visTitleElement && visTitleElement.nextSibling) {
        container.insertBefore(editorControls, visTitleElement.nextSibling);
    } else if (visTitleElement) {
        container.appendChild(editorControls); 
    } else {
        container.prepend(editorControls); 
    }
    
    
    container.addEventListener('click', function(event) {
        
        if (editorMode !== "addNode") return;
        
        
        const clickedElementTag = event.target.tagName.toLowerCase();
        if (clickedElementTag === 'button' || 
            clickedElementTag === 'circle' || 
            clickedElementTag === 'line' || 
            clickedElementTag === 'text' ||
            clickedElementTag === 'rect' ||
            clickedElementTag === 'g' ||
            event.target.classList.contains('control-panel') ||
            event.target.classList.contains('graph-editor-controls') ||
            event.target.classList.contains('explanation-container')) {
            console.log("Clicked on UI element, not creating node:", clickedElementTag);
            return;
        }
        
        
        const svgElement = container.querySelector('svg');
        const svgRect = svgElement.getBoundingClientRect();
        
        
        if (event.clientX < svgRect.left || event.clientX > svgRect.right || 
            event.clientY < svgRect.top || event.clientY > svgRect.bottom) {
            console.log("Click outside SVG bounds, not creating node");
            return;
        }
        
        
        const transform = d3.zoomTransform(svgElement);
        
        
        const offsetX = event.clientX - svgRect.left;
        const offsetY = event.clientY - svgRect.top;
        
        
        let finalX = (offsetX - transform.x) / transform.k;
        let finalY = (offsetY - transform.y) / transform.k;
        
        console.log("Creating node at:", finalX, finalY);
        
        
        addNode(finalX, finalY);
    });
    
    
    node.on("click", function(event, d) {
        event.stopPropagation();
        
        if (editorMode === "addEdge") {
            handleNodeSelectForEdge(d);
        } else if (editorMode === "delete") {
            deleteNode(d);
        }
    });
    
    
    link.on("click", function(event, d) {
        event.stopPropagation();
        
        if (editorMode === "delete") {
            deleteEdge(d);
        }
    });
    
    
    const controlPanel = d3.select(container)
        .append("div")
        .attr("class", "control-panel");
    
    const stepCounter = controlPanel
        .append("div")
        .attr("class", "step-counter")
        .text("Step: 0 / " + steps.length);
    
    const playButton = controlPanel
        .append("button")
        .attr("class", "play-button")
        .text("Play")
        .on("click", togglePlay);
    
    const prevButton = controlPanel
        .append("button")
        .attr("class", "prev-button")
        .text("Previous")
        .on("click", () => stepBackward());
    
    const nextButton = controlPanel
        .append("button")
        .attr("class", "next-button")
        .text("Next")
        .on("click", () => stepForward());
    
    const resetButton = controlPanel
        .append("button")
        .attr("class", "reset-button")
        .text("Reset")
        .on("click", () => resetVisualization());
    
    
    let currentStep = 0;
    let isPlaying = false;
    let animationSpeed = 1000; 
    let animationInterval = null;
    
    
    window.updateControlParams = function(speed, stepSize) {
        animationSpeed = 1000 / speed;
        
        if (isPlaying) {
            stopAnimation();
            startAnimation();
        }
    };
    
    
    window.handleGraphResize = function() {
        const visContainer = container.closest('.visualization-container') || container;
        const newWidth = visContainer.clientWidth;
        const newHeight = 500; 
        
        svg.attr('width', newWidth).attr('height', newHeight);
        
        
        svg.on('.zoom', null); 
        svg.call(zoom.transform, d3.zoomIdentity.translate(currentTransform[0], currentTransform[1]).scale(currentZoom));
        svg.call(zoom); 
        
        if (editorMode === 'select') {
            svg.style("cursor", "grab");
        }
        
        
        simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
        if (simulationRunning) {
            simulation.alpha(0.3).restart(); 
        }
        
    };
    
    
    function togglePlay() {
        isPlaying = !isPlaying;
        playButton.text(isPlaying ? "Pause" : "Play");
        
        if (isPlaying) {
            startAnimation();
        } else {
            stopAnimation();
        }
    }
    
    function startAnimation() {
        if (currentStep >= steps.length) {
            resetVisualization();
        }
        
        animationInterval = setInterval(() => {
            if (currentStep < steps.length) {
                processStep(currentStep);
                currentStep++;
                stepCounter.text("Step: " + currentStep + " / " + steps.length);
            } else {
                stopAnimation();
                playButton.text("Play");
                isPlaying = false;
            }
        }, animationSpeed);
    }
    
    function stopAnimation() {
        clearInterval(animationInterval);
    }
    
    function stepForward() {
        if (currentStep < steps.length) {
            processStep(currentStep);
            currentStep++;
            stepCounter.text("Step: " + currentStep + " / " + steps.length);
        }
    }
    
    function stepBackward() {
        if (currentStep > 0) {
            currentStep--;
            
            
            
            
            
            const targetStep = currentStep;
            
            
            currentStep = 0;
            
            
            node.attr("fill", colors.node)
                .attr("stroke", colors.nodeStroke);
            
            
            link.attr("stroke", colors.edge)
                .attr("stroke-width", 2);
            
            
            if (algorithm === "dijkstra" && distanceLabels) {
                distanceLabels.selectAll("text").text("∞");
            }
            
            
            for (let i = 0; i < targetStep; i++) {
                processStep(i, false); 
            }
            
            
            stepCounter.text("Step: " + currentStep + " / " + steps.length);
            
            
            if (targetStep > 0) {
                processStep(targetStep - 1, true);
            }
        }
    }
    
    function resetVisualization() {
        currentStep = 0;
        stepCounter.text("Step: " + currentStep + " / " + steps.length);
        
        
        node.attr("fill", colors.node)
            .attr("stroke", colors.nodeStroke);
        
        
        link.attr("stroke", colors.edge)
            .attr("stroke-width", 2);
        
        
        if (algorithm === "dijkstra" && distanceLabels) {
            distanceLabels.selectAll("text").text("∞");
        }
        
        
        explanationPanels.updateStepContent('');
        explanationPanels.updateReasonContent('');
    }
    
    
    function updateExplanations(step) {
        
        if (!explanationPanels) {
            console.error("Explanation panels not initialized");
            return;
        }

        
        let stepText = "Processing algorithm step";
        let reasonText = "No explanation available";

        
        if (step.action) {
            stepText = step.action;
        }

        if (step.reason) {
            reasonText = step.reason;
        }

        
        try {
            
            if (typeof explanationPanels.updateStepContent === 'function') {
                explanationPanels.updateStepContent(`<p><strong>${stepText}</strong></p>`);
            }
            
            
            if (typeof explanationPanels.updateReasonContent === 'function') {
                explanationPanels.updateReasonContent(`<p>${reasonText}</p>`);
            }
            
            
            if (typeof explanationPanels.updateTitleContent === 'function') {
                let algoName = '';
                if (algorithm === "dfs") algoName = "Depth-First Search";
                else if (algorithm === "bfs") algoName = "Breadth-First Search";
                else if (algorithm === "dijkstra") algoName = "Dijkstra's Algorithm";
                
                
                let actionTitle = '';
                switch (step.type) {
                    case 'visit':
                        actionTitle = `${algoName}: Visiting Node ${step.node}`;
                        break;
                    case 'explore':
                        actionTitle = `${algoName}: Exploring Edge from ${step.from} to ${step.to}`;
                        break;
                    case 'complete':
                        actionTitle = `${algoName}: Completed Node ${step.node}`;
                        break;
                    case 'backtrack':
                        actionTitle = `${algoName}: Backtracking to Node ${step.to}`;
                        break;
                    case 'distance':
                        actionTitle = `${algoName}: Setting Distance for Node ${step.node}`;
                        break;
                    case 'relax':
                        actionTitle = `${algoName}: ${step.success ? 'Relaxing' : 'Checking'} Edge from ${step.from} to ${step.to}`;
                        break;
                    case 'path':
                        actionTitle = `${algoName}: Final Shortest Paths`;
                        break;
                    default:
                        actionTitle = `${algoName}: Processing Algorithm`;
                }
                
                explanationPanels.updateTitleContent(actionTitle);
            }
        } catch (error) {
            console.error("Error updating explanations:", error);
        }
    }
    
    function processStep(stepIndex, animate = true) {
        const step = steps[stepIndex];
        
        if (algorithm === "dfs" || algorithm === "bfs") {
            processGraphTraversalStep(step, animate);
        } else if (algorithm === "dijkstra") {
            processDijkstraStep(step, animate);
        }
        
        
        updateExplanations(step);
    }
    
    function processGraphTraversalStep(step, animate) {
        const duration = animate ? 500 : 0;
        
        if (step.type === "visit") {
            
            node.filter(d => d.id === step.node)
                .transition()
                .duration(duration)
                .attr("fill", colors.visitedNode);
        } else if (step.type === "explore") {
            
            if (data.directed) {
                
                link.filter(d => d.source.id === step.from && d.target.id === step.to)
                    .transition()
                    .duration(duration)
                    .attr("stroke", colors.edgeHighlight)
                    .attr("stroke-width", 3);
            } else {
                
                link.filter(d => 
                    (d.source.id === step.from && d.target.id === step.to) || 
                    (d.source.id === step.to && d.target.id === step.from))
                    .transition()
                    .duration(duration)
                    .attr("stroke", colors.edgeHighlight)
                    .attr("stroke-width", 3);
            }
        } else if (step.type === "complete") {
            
            node.filter(d => d.id === step.node)
                .transition()
                .duration(duration)
                .attr("fill", colors.currentNode);
        } else if (step.type === "backtrack") {
            
            if (data.directed) {
                
                link.filter(d => d.source.id === step.from && d.target.id === step.to)
                    .transition()
                    .duration(duration)
                    .attr("stroke", colors.edgeHighlight)
                    .attr("stroke-width", 2);
            } else {
                
                link.filter(d => 
                    (d.source.id === step.from && d.target.id === step.to) || 
                    (d.source.id === step.to && d.target.id === step.from))
                    .transition()
                    .duration(duration)
                    .attr("stroke", colors.edgeHighlight)
                    .attr("stroke-width", 2);
            }
        }
    }
    
    function processDijkstraStep(step, animate) {
        const duration = animate ? 500 : 0;
        
        if (step.type === "distance") {
            
            if (distanceLabels) {
                distanceLabels.selectAll("text").text(step.distance === Infinity ? "∞" : step.distance);
            }
        } else if (step.type === "visit") {
            
            node.filter(d => d.id === step.node)
                .transition()
                .duration(duration)
                .attr("fill", colors.visitedNode);
        } else if (step.type === "relax") {
            
            link.filter(d => 
                    (d.source.id === step.from && d.target.id === step.to))
                .transition()
                .duration(duration)
                .attr("stroke", colors.edgeHighlight)
                .attr("stroke-width", 3);
            
            
            if (step.success && distanceLabels) {
                distanceLabels.selectAll("text").text(step.newDistance === Infinity ? "∞" : step.newDistance);
            }
        } else if (step.type === "complete") {
            
            node.filter(d => d.id === step.node)
                .transition()
                .duration(duration)
                .attr("fill", colors.currentNode);
        } else if (step.type === "path") {
            
            link.filter(d => 
                    step.edges.some(edge => 
                        (d.source.id === edge[0] && d.target.id === edge[1]) ||
                        (d.source.id === edge[1] && d.target.id === edge[0])
                    ))
                    .transition()
                    .duration(duration)
                .attr("stroke", colors.shortestPathNode)
                .attr("stroke-width", 4);
        }
    }
    
    
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        
        
        d.fx = d.x;
        d.fy = d.y;
    }
    
    
    function zoomIn() {
        currentZoom = Math.min(currentZoom * 1.2, 5);
        svg.transition().duration(300).call(
            zoom.transform,
            d3.zoomIdentity.translate(currentTransform[0], currentTransform[1]).scale(currentZoom)
        );
    }
    
    function zoomOut() {
        currentZoom = Math.max(currentZoom / 1.2, 0.1);
        svg.transition().duration(300).call(
            zoom.transform,
            d3.zoomIdentity.translate(currentTransform[0], currentTransform[1]).scale(currentZoom)
        );
    }
    
    function resetZoom() {
        currentZoom = 1;
        currentTransform = [0, 0];
        svg.transition().duration(300).call(
            zoom.transform,
            d3.zoomIdentity
        );
    }
    
    
    function createEditorButton(text, mode) {
        const button = document.createElement('button');
        button.className = 'editor-button' + (mode === editorMode ? ' active' : '');
        button.innerHTML = text; 
        button.onclick = () => {
            
            setEditorMode(mode);
            
            
            document.querySelectorAll('.editor-button').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            
            let modeDescription = '';
            switch(mode) {
                case 'select':
                    modeDescription = 'You can select and drag nodes to reposition them.';
                    break;
                case 'addNode':
                    modeDescription = 'Click anywhere on the white space to add new nodes.';
                    break;
                case 'addEdge':
                    modeDescription = 'First click a source node, then click a target node to create an edge.';
                    break;
                case 'delete':
                    modeDescription = 'Click on nodes or edges to delete them.';
                    break;
                default:
                    modeDescription = 'Mode activated.';
            }
            
            
            if (typeof explanationPanels.updateTitleContent === 'function') {
                explanationPanels.updateTitleContent(`Graph Editor: ${mode} Mode`);
            }
            explanationPanels.updateStepContent(`<strong>${mode} Mode Activated</strong>`);
            explanationPanels.updateReasonContent(`<p>${modeDescription}</p>`);
            
            console.log("Editor mode changed to:", mode);
        };
        return button;
    }
    
    function setEditorMode(mode, isInitialCall = false) {
        editorMode = mode;
        selectedNodes = [];

        console.log(`Setting editor mode to: ${mode}, Initial call: ${isInitialCall}, Sim running: ${simulationRunning}, User created: ${isUserCreatedGraph}`);

        
        
        
        
        if (simulationRunning && (isUserCreatedGraph || (!isInitialCall && mode === 'select') || mode !== 'select')) {
            disableSimulation();
        }

        
        svg.call(zoom); 
        if (node && typeof node.call === 'function' && typeof d3.drag === 'function') {
            node.call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
            );
        } else {
            console.warn("Node selection or d3.drag not available for re-binding drag events.");
        }

        
        if (mode === "addNode") {
            svg.on('.zoom', null); 
            if (node && typeof node.on === 'function') node.on('.drag', null);
            svg.style("cursor", "crosshair");
            updateExplanationForMode(mode, "Click on the white space to add a new node.");
        } else if (mode === "addEdge") {
            svg.on('.zoom', null);
            if (node && typeof node.on === 'function') node.on('.drag', null);
            svg.style("cursor", "default");
            updateExplanationForMode(mode, "Click a source node, then a target node to create an edge.");
        } else if (mode === "delete") {
            
            if (node && typeof node.on === 'function') node.on('.drag', null); 
            svg.style("cursor", "default"); 
            updateExplanationForMode(mode, "Click on a node or an edge to delete it.");
        } else { 
            svg.style("cursor", "grab");
            
            updateExplanationForMode(mode, "Drag nodes to reposition. Drag the background to pan the view.");
        }
        console.log("Editor mode set to:", mode, "SVG cursor:", svg.style("cursor"));

        
        document.querySelectorAll('.graph-editor-controls .editor-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
    }

    
    function updateExplanationForMode(mode, description) {
        if (explanationPanels && typeof explanationPanels.updateTitleContent === 'function') {
            let modeName = mode.charAt(0).toUpperCase() + mode.slice(1);
            explanationPanels.updateTitleContent(`Graph Editor: ${modeName} Mode`);
        }
        if (explanationPanels && typeof explanationPanels.updateStepContent === 'function') {
            explanationPanels.updateStepContent(`<strong>${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode Activated</strong>`);
        }
        if (explanationPanels && typeof explanationPanels.updateReasonContent === 'function') {
            explanationPanels.updateReasonContent(`<p>${description}</p>`);
        }
    }

    
    
    const selectButtonForInit = editorControls.querySelector('.editor-button'); 
    if (selectButtonForInit) selectButtonForInit.dataset.mode = 'select'; 

    setEditorMode('select', true); 
    
    function handleNodeSelectForEdge(node) {
        if (selectedNodes.length === 0) {
            
            selectedNodes.push(node);
            
            d3.select(event.currentTarget)
                .attr("stroke", colors.edgeHighlight)
                    .attr("stroke-width", 3);
            
            
            let directedMessage = data.directed ? " (directed)" : " (undirected)";
            if (typeof explanationPanels.updateStepContent === 'function') {
                explanationPanels.updateStepContent(`<strong>Edge Creation${directedMessage}:</strong> Selected node ${node.id} as source. Now click another node to create an edge.`);
            }
            if (typeof explanationPanels.updateTitleContent === 'function') {
                explanationPanels.updateTitleContent(`Graph Editor: Creating Edge from Node ${node.id}`);
            }
        } else if (selectedNodes[0] !== node) {
            
            createWeightDialog(node);
        }
    }
    
    
    function createWeightDialog(targetNode) {
        
        const existingDialog = container.querySelector('.weight-dialog');
        if (existingDialog) {
            container.removeChild(existingDialog);
        }
        
        
        const dialog = document.createElement('div');
        dialog.className = 'weight-dialog';
        dialog.style.position = 'absolute';
        dialog.style.top = '50%';
        dialog.style.left = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.background = window.isDarkMode ? '#333' : '#fff';
        dialog.style.padding = '20px';
        dialog.style.borderRadius = '8px';
        dialog.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        dialog.style.zIndex = '1000';
        dialog.style.width = '300px';
        dialog.style.color = window.isDarkMode ? '#f0f0f0' : '#333';
        
        
        const directionInfo = data.directed ? "Directed " : "";
        
        
        dialog.innerHTML = `
            <h3 style="margin-top:0;margin-bottom:15px;text-align:center;">Add ${directionInfo}Edge Weight</h3>
            <p style="margin-bottom:15px;">Enter weight for ${directionInfo.toLowerCase()}edge from node ${selectedNodes[0].id} to node ${targetNode.id}:</p>
            <div style="display:flex;margin-bottom:20px;">
                <input type="number" id="edge-weight" value="1" min="1" style="flex:1;padding:8px;border-radius:4px;border:1px solid #ddd;" />
            </div>
            <div style="display:flex;justify-content:flex-end;gap:10px;">
                <button id="cancel-edge" style="padding:8px 15px;border:none;border-radius:4px;background:#f44336;color:white;cursor:pointer;">Cancel</button>
                <button id="add-edge" style="padding:8px 15px;border:none;border-radius:4px;background:#4CAF50;color:white;cursor:pointer;">Add Edge</button>
            </div>
        `;
        
        
        container.appendChild(dialog);
        
        
        const weightInput = document.getElementById('edge-weight');
        weightInput.focus();
        
        
        document.getElementById('add-edge').addEventListener('click', function() {
            const weight = parseInt(weightInput.value) || 1;
            addEdgeWithWeight(targetNode, weight);
            container.removeChild(dialog);
        });
        
        document.getElementById('cancel-edge').addEventListener('click', function() {
            resetEdgeSelection();
            container.removeChild(dialog);
        });
        
        
        weightInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const weight = parseInt(this.value) || 1;
                addEdgeWithWeight(targetNode, weight);
                container.removeChild(dialog);
            }
        });
    }
    
    function addEdgeWithWeight(targetNode, weight) {
        console.log("Adding edge from", selectedNodes[0].id, "to", targetNode.id, "with weight", weight);
        
        
        if (simulationRunning) {
            disableSimulation();
        }
        
        
        
        let edgeExists;
        if (data.directed) {
            edgeExists = data.links.some(link => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                return sourceId === selectedNodes[0].id && targetId === targetNode.id;
            });
        } else {
            edgeExists = data.links.some(link => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                return (sourceId === selectedNodes[0].id && targetId === targetNode.id) ||
                       (sourceId === targetNode.id && targetId === selectedNodes[0].id);
            });
        }
        
        if (!edgeExists) {
            try {
                
                const nodePositions = {};
                data.nodes.forEach(n => {
                    nodePositions[n.id] = {x: n.x, y: n.y};
                });
                
                
                data.links.push({
                    source: selectedNodes[0].id,
                    target: targetNode.id,
                    weight: weight
                });
                
                
                updateGraph(false);
                
                
                isUserCreatedGraph = true;
                
                
                data.nodes.forEach(n => {
                    if (nodePositions[n.id]) {
                        n.fx = nodePositions[n.id].x;
                        n.fy = nodePositions[n.id].y;
                        n.x = nodePositions[n.id].x;
                        n.y = nodePositions[n.id].y;
                    }
                });
                
                
                let directionInfo = data.directed ? "directed " : "";
                if (typeof explanationPanels.updateStepContent === 'function') {
                    explanationPanels.updateStepContent(`<strong>Edge Added:</strong> Created ${directionInfo}edge from node ${selectedNodes[0].id} to node ${targetNode.id} with weight ${weight}.`);
                }
                if (typeof explanationPanels.updateTitleContent === 'function') {
                    explanationPanels.updateTitleContent(`Graph Editor: Edge Added`);
                }
            } catch (error) {
                
                console.error("Error adding edge:", error);
                if (typeof explanationPanels.updateStepContent === 'function') {
                    explanationPanels.updateStepContent(`<strong>Error:</strong> Failed to create edge. ${error.message}`);
                }
            }
        } else {
            
            let directionInfo = data.directed ? "directed " : "";
            if (typeof explanationPanels.updateStepContent === 'function') {
                explanationPanels.updateStepContent(`<strong>Error:</strong> A ${directionInfo}edge already exists from node ${selectedNodes[0].id} to node ${targetNode.id}.`);
            }
        }
        
        
        resetEdgeSelection();
    }
    
    function resetEdgeSelection() {
        selectedNodes = [];
        node.attr("stroke", colors.edge).attr("stroke-width", 2);
    }
    
    function addNode(x, y) {
        try {
            
            const nodeId = data.nodes.length > 0 ? Math.max(...data.nodes.map(n => parseInt(n.id))) + 1 : 0;
            
            
            if (data.nodes.length === 0) {
                x = width / 2;
                y = height / 2;
            }
            
            
            const newNode = { 
                id: nodeId, 
                x: x, 
                y: y,
                fx: x, 
                fy: y  
            };
            
            
            console.log("Creating node with ID:", nodeId, "at fixed position:", x, y);
            
            
            if (simulationRunning) {
                disableSimulation();
            }
            
            
            data.nodes.push(newNode);
            
            
            updateGraph(false);
            
            
            isUserCreatedGraph = true;
            
            
            if (typeof explanationPanels.updateTitleContent === 'function') {
                explanationPanels.updateTitleContent(`Graph Editor: Node ${nodeId} Added`);
            }
            
            
            explanationPanels.updateStepContent(`<strong>Node Added:</strong> Created node ${nodeId} at position (${Math.round(x)}, ${Math.round(y)}).`);
            explanationPanels.updateReasonContent(`<p>Click anywhere on the white space to add more nodes, or switch to a different editing mode.</p>`);
            
            
            if (data.nodes.length === 1) {
                
                centerViewAtPosition(width/2, height/2, 1);
            }
        } catch (error) {
            console.error("Error creating node:", error);
            
            if (typeof explanationPanels.updateTitleContent === 'function') {
                explanationPanels.updateTitleContent(`Graph Editor: Error`);
            }
            explanationPanels.updateStepContent(`<strong>Error:</strong> Failed to create node. ${error.message}`);
            explanationPanels.updateReasonContent(`<p>Please try clicking in a different location or report this issue.</p>`);
        }
    }
    
    
    function centerViewOnNode(node) {
        
        if (!node || node.x === undefined || node.y === undefined) return;
        
        
        const transform = d3.zoomIdentity
            .translate(width/2 - node.x * currentZoom, height/2 - node.y * currentZoom)
            .scale(currentZoom);
        
        
        svg.transition().duration(300)
            .call(zoom.transform, transform);
            
        
        currentTransform = [width/2 - node.x * currentZoom, height/2 - node.y * currentZoom];
    }
    
    
    function centerViewAtPosition(x, y, zoomLevel = null) {
        
        const newZoom = zoomLevel !== null ? zoomLevel : currentZoom;
        
        
        const transform = d3.zoomIdentity
            .translate(width/2 - x * newZoom, height/2 - y * newZoom)
            .scale(newZoom);
        
        
        svg.transition().duration(300)
            .call(zoom.transform, transform);
        
        
        currentZoom = newZoom;
        currentTransform = [width/2 - x * newZoom, height/2 - y * newZoom];
    }
    
    function deleteNode(nodeToDelete) {
        try {
            
            data.links = data.links.filter(link => {
                
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                return sourceId !== nodeToDelete.id && targetId !== nodeToDelete.id;
            });
            
            
            const deletedNodeId = nodeToDelete.id;
            
            
            data.nodes = data.nodes.filter(n => n.id !== nodeToDelete.id);
            
            
            updateGraph(false);
            
            
            isUserCreatedGraph = true;
            
            
            explanationPanels.updateStepContent(`<strong>Node Deleted:</strong> Removed node ${deletedNodeId} and all connected edges.`);
        } catch (error) {
            
            explanationPanels.updateStepContent(`<strong>Error:</strong> Failed to delete node. ${error.message}`);
            console.error("Error deleting node:", error);
        }
    }
    
    function deleteEdge(edgeToDelete) {
        try {
            
            const sourceId = typeof edgeToDelete.source === 'object' ? edgeToDelete.source.id : edgeToDelete.source;
            const targetId = typeof edgeToDelete.target === 'object' ? edgeToDelete.target.id : edgeToDelete.target;
            
            
            data.links = data.links.filter(link => {
                const linkSourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const linkTargetId = typeof link.target === 'object' ? link.target.id : link.target;
                return !(linkSourceId === sourceId && linkTargetId === targetId);
            });
            
            
            updateGraph(false);
            
            
            isUserCreatedGraph = true;
            
            
            explanationPanels.updateStepContent(`<strong>Edge Deleted:</strong> Removed edge between nodes ${sourceId} and ${targetId}.`);
        } catch (error) {
            
            explanationPanels.updateStepContent(`<strong>Error:</strong> Failed to delete edge. ${error.message}`);
            console.error("Error deleting edge:", error);
        }
    }
    
    function updateGraph(animate = true) {
        
        link.remove();
        linkLabel.remove();
        node.remove();
        nodeLabel.remove();
        if (distanceLabels) distanceLabels.remove();
        
        
        data.nodes.forEach(node => {
            if (node.x !== undefined && node.y !== undefined) {
                node.fx = node.x;
                node.fy = node.y;
            }
        });
        
        
        simulation.nodes(data.nodes);
        simulation.force("link").links(data.links);
        
        
        if (isUserCreatedGraph || !animate) {
            
            for (let i = 0; i < 10; i++) {
                simulation.tick();
            }
            simulation.stop();
            simulationRunning = false;
        } else {
            
            simulation.alpha(0.3).restart();
            simulationRunning = true;
        }
        
        
        if (!graph.select('.link-group').size()) {
            graph.append("g").attr("class", "link-group");
        }
        if (!graph.select('.node-group').size()) {
            graph.append("g").attr("class", "node-group");
        }
        
        const linkGroup = graph.select('.link-group');
        const nodeGroup = graph.select('.node-group');
        
        
        svg.selectAll("defs").remove();
        
        if (data.directed) {
            
            svg.append("defs").selectAll("marker")
                .data(["arrow"])
                .enter().append("marker")
                .attr("id", d => d)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", nodeRadius + 9) 
                .attr("refY", 0)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
                .append("path")
                .attr("fill", colors.edge)
                .attr("d", "M0,-5L10,0L0,5");
        }
        
        
        link = linkGroup.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(data.links)
            .enter()
            .append("line")
            .attr("stroke", colors.edge)
            .attr("stroke-width", 2)
            
            .attr("marker-end", data.directed ? "url(#arrow)" : "")
            .on("click", function(event, d) {
                event.stopPropagation();
                if (editorMode === "delete") {
                    deleteEdge(d);
                }
            });
        
        
        linkLabel = linkGroup.append("g")
            .attr("class", "link-labels")
            .selectAll("g")
            .data(data.links)
            .enter()
            .append("g")
            .attr("class", "link-label-group");
        
        
        linkLabel.append("rect")
            .attr("rx", 6)
            .attr("ry", 6)
            .attr("width", 24)
            .attr("height", 20)
            .attr("x", -12)
            .attr("y", -10)
            .attr("fill", colors.weightBackground)
            .attr("stroke", "none");
        
        
        linkLabel.append("text")
            .attr("class", "link-label")
            .attr("text-anchor", "middle")
            .attr("fill", colors.text)
            .text(d => d.weight);
        
        
        node = nodeGroup.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(data.nodes)
            .enter()
            .append("circle")
            .attr("r", nodeRadius)
            .attr("fill", colors.node)
            .attr("stroke", colors.nodeStroke)
            .attr("stroke-width", 2)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("click", function(event, d) {
                event.stopPropagation();
                if (editorMode === "addEdge") {
                    handleNodeSelectForEdge(d);
                } else if (editorMode === "delete") {
                    deleteNode(d);
                }
            });
        
        
        nodeLabel = nodeGroup.append("g")
            .attr("class", "node-labels")
            .selectAll("text")
            .data(data.nodes)
            .enter()
            .append("text")
            .attr("class", "node-label")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .attr("fill", colors.text)
            .text(d => d.id);
        
        
        if (algorithm === "dijkstra") {
            distanceLabels = nodeGroup.append("g")
                .attr("class", "distance-labels")
                .selectAll("g")
                .data(data.nodes)
                .enter()
                .append("g")
                .attr("class", "distance-label-group");
            
            
            distanceLabels.append("rect")
                .attr("rx", 8)
                .attr("ry", 8)
                .attr("width", 40)
                .attr("height", 24)
                .attr("x", -20)
                .attr("y", nodeRadius * 1.4)
                .attr("fill", "rgba(255, 255, 255, 0.7)")
                .attr("stroke", "#ddd")
                .attr("stroke-width", "1px");
            
            
            distanceLabels.append("text")
                .attr("class", "distance-label")
                .attr("text-anchor", "middle")
                .attr("dy", nodeRadius * 1.8)
                .attr("fill", colors.text)
                .text("∞")
                .style("font-size", "14px");
        }
        
        
        simulation.tick();
        
        
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        
        linkLabel
            .attr("transform", d => `translate(${(d.source.x + d.target.x) / 2}, ${(d.source.y + d.target.y) / 2})`);
        
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        
        nodeLabel
            .attr("x", d => d.x)
            .attr("y", d => d.y);
        
        if (distanceLabels) {
            distanceLabels
                .attr("transform", d => `translate(${d.x}, ${d.y})`);
        }
    }
    
    function resetGraph() {
        if (confirm("Are you sure you want to reset the graph?")) {
            
            simulation.stop();
            simulationRunning = false;
            
            if (isUserCreatedGraph) {
                
                data.nodes = [];
                data.links = [];
                
                updateGraph(true);
                isUserCreatedGraph = false;
                
                
                resetZoom();
            } else {
                
                
                data.nodes.forEach(node => {
                    node.fx = null;
                    node.fy = null;
                });
                updateGraph(true);
                simulationRunning = true;
                
                
                simulation.on("end", () => {
                    simulationRunning = false;
                    data.nodes.forEach(node => {
                        node.fx = node.x;
                        node.fy = node.y;
                    });
                });
            }
            
            
    resetVisualization();
        }
    }
    
    
    window.graphUpdateControlParams = updateControlParams;
    
    
    if (window.addKeyboardNavigation) {
        window.addKeyboardNavigation(container, {
            next: stepForward,
            prev: stepBackward,
            playPause: togglePlay,
            reset: resetVisualization
        });
    }
}


window.createGraphVisualization = createGraphVisualization;