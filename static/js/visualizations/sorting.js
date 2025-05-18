/**
 * Sorting visualization module using D3.js
 * Visualizes sorting algorithms: QuickSort
 */


function createSortingVisualization(data, steps, algorithm, container) {
    
    const width = container.clientWidth;
    const height = 900; 
    const margin = { top: 150, right: 60, bottom: 75, left: 50 }; 
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    let currentZoom = 1;
    let currentTransform = [0, 0]; 
    
    
    const isDarkMode = document.querySelector('.visualization-container').style.backgroundColor === 'rgb(18, 18, 18)' || 
                      window.getComputedStyle(document.querySelector('.visualization-container')).backgroundColor === 'rgb(18, 18, 18)';
    
    
    const colors = {
        bar: "#4f8fca", 
        pivot: "#ff5722", 
        comparing: "#ffeb3b", 
        swapping: "#9c27b0", 
        sorted: "#4caf50", 
        text: "#000000", 
        axisLine: "#ccc",  
        background: "#ffffff" 
    };
    
    
    const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .style("background-color", colors.background);
    
    
    const zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .translateExtent([[0, 0], [width, height]]) 
        .on("zoom", (event) => {
            
            const transform = event.transform;
            
            
            const graphWidth = innerWidth * transform.k;
            const graphHeight = innerHeight * transform.k;
            
            
            const xMin = width - graphWidth - margin.right;
            const xMax = margin.left;
            const yMin = height - graphHeight - margin.bottom;
            const yMax = margin.top;
            
            
            transform.x = Math.min(xMax, Math.max(xMin, transform.x));
            transform.y = Math.min(yMax, Math.max(yMin, transform.y));
            
            
            g.attr("transform", transform);
            currentZoom = transform.k;
            currentTransform = [transform.x, transform.y];
        });
    
    svg.call(zoom)
       .on("mousedown.zoom", null) 
       .on("touchstart.zoom", null); 
       
    
    svg.call(zoom.filter(event => false));
    
    
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    
    currentTransform = [margin.left, margin.top];
    
    
    const initialData = [...data];
    
    
    const xScale = d3.scaleBand()
        .domain(initialData.map((d, i) => i))
        .range([0, innerWidth])
        .padding(0.2);
    
    const maxValue = d3.max(initialData);
    
    
    const yScale = d3.scaleLinear()
        .domain([0, maxValue * 1.1]) 
        .range([innerHeight, 0]);
    
    
    g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("fill", colors.text);
    
    
    svg.selectAll(".domain, .tick line")
        .attr("stroke", colors.axisLine);
    
    svg.selectAll(".tick text")
        .attr("fill", colors.text);
    
    
    g.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .attr("fill", colors.text);
    
    
    const bars = g.selectAll(".bar")
        .data(initialData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d, i) => xScale(i))
        .attr("y", d => yScale(d))
        .attr("width", xScale.bandwidth())
        .attr("height", d => innerHeight - yScale(d))
        .attr("fill", colors.bar);
    
    
    const barLabels = g.selectAll(".bar-label")
        .data(initialData)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", (d, i) => xScale(i) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d) - 5)
        .attr("text-anchor", "middle")
        .attr("fill", colors.text)
        .attr("font-size", d => d > 999 ? "10px" : "12px") 
        .text(d => d > 9999 ? Math.round(d/1000) + "k" : d); 
    
    
    let currentArray = [...initialData];
    
    
    const explanationPanels = window.createExplanationPanels(container);
    
    
    const zoomControls = window.createZoomControls(container, zoomIn, zoomOut, resetZoom);
    
    
    const controlPanel = document.createElement('div');
    controlPanel.className = 'control-panel';
    container.appendChild(controlPanel);
    
    
    const stepCounter = document.createElement('div');
    stepCounter.className = 'step-counter';
    stepCounter.textContent = 'Step: 0 / ' + steps.length;
    controlPanel.appendChild(stepCounter);
    
    
    const playPauseButton = document.createElement('button');
    playPauseButton.className = 'play-button';
    playPauseButton.innerHTML = '<i class="fas fa-play"></i> Play';
    playPauseButton.onclick = togglePlay;
    controlPanel.appendChild(playPauseButton);
    
    
    const stepBackwardButton = document.createElement('button');
    stepBackwardButton.className = 'prev-button';
    stepBackwardButton.textContent = 'Previous';
    stepBackwardButton.onclick = stepBackward;
    controlPanel.appendChild(stepBackwardButton);
    
    
    const stepForwardButton = document.createElement('button');
    stepForwardButton.className = 'next-button';
    stepForwardButton.textContent = 'Next';
    stepForwardButton.onclick = stepForward;
    controlPanel.appendChild(stepForwardButton);
    
    
    const resetButton = document.createElement('button');
    resetButton.className = 'reset-button';
    resetButton.textContent = 'Reset';
    resetButton.onclick = resetVisualization;
    controlPanel.appendChild(resetButton);
    
    
    const speedSelector = document.createElement('div');
    speedSelector.className = 'speed-selector';
    
    const speedLabel = document.createElement('span');
    speedLabel.textContent = 'Speed: ';
    speedLabel.style.color = colors.text;
    speedSelector.appendChild(speedLabel);
    
    const speedSelect = document.createElement('select');
    const speeds = [
        { value: 1000, label: 'Slow' },
        { value: 500, label: 'Medium' },
        { value: 200, label: 'Fast' }
    ];
    
    speeds.forEach(speed => {
        const option = document.createElement('option');
        option.value = speed.value;
        option.textContent = speed.label;
        speedSelect.appendChild(option);
        
        
        if (speed.label === 'Medium') {
            option.selected = true;
        }
    });
    
    speedSelect.onchange = function() {
        animationSpeed = parseInt(this.value);
    };
    
    speedSelector.appendChild(speedSelect);
    controlPanel.appendChild(speedSelector);
    
    
    let isPlaying = false;
    let currentStepIndex = -1;
    let animationSpeed = 500; 
    let animationTimer;
    
    
    const quicksortOptions = document.createElement('div');
    quicksortOptions.className = 'quicksort-options';
    
    if (algorithm.toLowerCase().includes('quicksort')) {
        const pivotLabel = document.createElement('div');
        pivotLabel.innerHTML = `<span style="color:${colors.pivot}">■</span> Pivot`;
        pivotLabel.style.margin = '5px';
        pivotLabel.style.display = 'inline-block';
        pivotLabel.style.color = colors.text;
        
        const comparingLabel = document.createElement('div');
        comparingLabel.innerHTML = `<span style="color:${colors.comparing}">■</span> Comparing`;
        comparingLabel.style.margin = '5px';
        comparingLabel.style.display = 'inline-block';
        comparingLabel.style.color = colors.text;
        
        const swappingLabel = document.createElement('div');
        swappingLabel.innerHTML = `<span style="color:${colors.swapping}">■</span> Swapping`;
        swappingLabel.style.margin = '5px';
        swappingLabel.style.display = 'inline-block';
        swappingLabel.style.color = colors.text;
        
        const sortedLabel = document.createElement('div');
        sortedLabel.innerHTML = `<span style="color:${colors.sorted}">■</span> Sorted`;
        sortedLabel.style.margin = '5px';
        sortedLabel.style.display = 'inline-block';
        sortedLabel.style.color = colors.text;
        
        quicksortOptions.appendChild(pivotLabel);
        quicksortOptions.appendChild(comparingLabel);
        quicksortOptions.appendChild(swappingLabel);
        quicksortOptions.appendChild(sortedLabel);
        
        container.appendChild(quicksortOptions);
    }
    
    function togglePlay() {
        isPlaying = !isPlaying;
        
        if (isPlaying) {
            playPauseButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
            if (currentStepIndex >= steps.length - 1) {
                
                resetVisualization();
            }
            startAnimation();
        } else {
            playPauseButton.innerHTML = '<i class="fas fa-play"></i> Play';
            stopAnimation();
        }
    }
    
    function startAnimation() {
        
        stopAnimation();
        
        
        if (currentStepIndex >= steps.length - 1) {
            isPlaying = false;
            playPauseButton.innerHTML = '<i class="fas fa-play"></i> Play';
            return;
        }
        
        
        stepForward();
        
        
        animationTimer = setTimeout(startAnimation, animationSpeed);
    }
    
    function stopAnimation() {
        clearTimeout(animationTimer);
    }
    
    function stepForward() {
        if (currentStepIndex < steps.length - 1) {
            currentStepIndex++;
            processStep(currentStepIndex);
            stepCounter.textContent = 'Step: ' + (currentStepIndex + 1) + ' / ' + steps.length;
        }
    }
    
    function stepBackward() {
        if (currentStepIndex > 0) {
            
            currentStepIndex--;
            
            
            
            
            
            
            const step = steps[currentStepIndex];
            
            
            if (step.array) {
                currentArray = [...step.array];
                updateBars(currentArray, false); 
            }
            
            
            processStep(currentStepIndex, true);
            
            
            stepCounter.textContent = 'Step: ' + (currentStepIndex + 1) + ' / ' + steps.length;
        }
    }
    
    function resetVisualization() {
        
        stopAnimation();
        isPlaying = false;
        playPauseButton.innerHTML = '<i class="fas fa-play"></i> Play';
        
        
        currentStepIndex = -1;
        stepCounter.textContent = 'Step: 0 / ' + steps.length;
        
        
        bars.attr("fill", colors.bar);
        
        
        currentArray = [...initialData];
        updateBars(currentArray, false);
        
        
        explanationPanels.updateStepContent('');
        explanationPanels.updateReasonContent('');
        explanationPanels.updateTitleContent(`${algorithm} Visualization`);
    }
    
    function updateExplanations(step) {
        
        if (!explanationPanels || typeof explanationPanels.updateStepContent !== 'function') {
            console.warn("Explanation panels not properly initialized");
            return;
        }

        
        let algoName = 'QuickSort';
        
        
        let actionTitle = '';
        if (step.type === "pivot") {
            actionTitle = `${algoName}: Selecting Pivot (${step.array[step.pivot]})`;
        } else if (step.type === "compare") {
            actionTitle = `${algoName}: Comparing Elements`;
        } else if (step.type === "swap") {
            actionTitle = `${algoName}: Swapping Elements`;
        } else if (step.type === "sorted") {
            if (step.sorted.length === step.array.length) {
                actionTitle = `${algoName}: Array Sorted Successfully`;
            } else {
                actionTitle = `${algoName}: Partial Sorting Complete`;
            }
        } else if (step.type === "range") {
            actionTitle = `${algoName}: Processing Subarray [${step.range[0]}...${step.range[1]}]`;
        } else {
            actionTitle = `${algoName}: Step ${currentStepIndex + 1}`;
        }
        
        explanationPanels.updateTitleContent(actionTitle);
        
        
        if (step.action) {
            explanationPanels.updateStepContent(`<p><strong>${step.action}</strong></p>`);
        } else {
            explanationPanels.updateStepContent(createStepDescription(step));
        }
        
        
        if (step.reason && step.reason.trim() !== "") {
            explanationPanels.updateReasonContent(`<p>${step.reason}</p>`);
        } else if (step.type === "compare" && step.i_pointer !== undefined && step.j_pointer !== undefined) {
            const compareVal = step.array[step.j_pointer];
            let pivotVal;
            
            if (step.comparing && step.comparing.length > 1) {
                pivotVal = step.array[step.comparing[1]];
                explanationPanels.updateReasonContent(`<p>Comparing element ${compareVal} (j=${step.j_pointer}) with pivot ${pivotVal}. If ${compareVal} ≤ ${pivotVal}, i will advance and we'll swap elements.</p>`);
            } else {
                explanationPanels.updateReasonContent(`<p>Comparing element at position j=${step.j_pointer}. Current partition boundary is at i=${step.i_pointer}.</p>`);
            }
        } else if (step.type === "swap") {
            
            const values = step.swapping.map(idx => step.array[idx]);
            let pivotValue;
            
            
            if (step.comparing && step.comparing.length > 1) {
                pivotValue = step.array[step.comparing[1]];
            } else {
                
                for (let i = currentStepIndex; i >= 0; i--) {
                    if (steps[i].pivot !== undefined) {
                        pivotValue = steps[i].array[steps[i].pivot];
                        break;
                    }
                }
            }
            
            let pointerInfo = "";
            if (step.i_pointer !== undefined && step.j_pointer !== undefined) {
                if (step.swapping[0] === step.i_pointer && step.swapping[1] === step.j_pointer) {
                    pointerInfo = ` (i=${step.i_pointer}, j=${step.j_pointer})`;
                }
            }
            
            if (pivotValue !== undefined) {
                if (values[0] <= pivotValue && values[1] > pivotValue) {
                    explanationPanels.updateReasonContent(`<p>Swapped ${values[0]} and ${values[1]}${pointerInfo} because ${values[0]} ≤ pivot (${pivotValue}) and should move left.</p>`);
                } else if (values[1] <= pivotValue && values[0] > pivotValue) {
                    explanationPanels.updateReasonContent(`<p>Swapped ${values[0]} and ${values[1]}${pointerInfo} because ${values[1]} ≤ pivot (${pivotValue}) and should move left.</p>`);
                } else if (step.swapping[1] === step.range[1]) {
                    explanationPanels.updateReasonContent(`<p>Final swap: placing pivot ${pivotValue} at its correct sorted position.</p>`);
                } else {
                    explanationPanels.updateReasonContent(`<p>Swapped ${values[0]} and ${values[1]}${pointerInfo} to reposition elements around pivot (${pivotValue}).</p>`);
                }
            } else {
                explanationPanels.updateReasonContent(`<p>Swapped ${values[0]} and ${values[1]}${pointerInfo} to arrange elements in sorted order.</p>`);
            }
        } else if (step.type === "pivot") {
            explanationPanels.updateReasonContent(`<p>The pivot element is used to partition the array into two sections.</p>`);
        } else if (step.type === "sorted") {
            if (step.sorted.length === step.array.length) {
                explanationPanels.updateReasonContent(`<p>All elements are now in their correct positions.</p>`);
            } else {
                explanationPanels.updateReasonContent(`<p>This element has found its final sorted position and won't be moved again.</p>`);
            }
        } else {
            
            explanationPanels.updateReasonContent("");
        }
    }
    
    function processStep(stepIndex, animate = true) {
        const step = steps[stepIndex];
        
        
        updateExplanations(step);
        
        
        processQuicksortStep(step, animate);
    }
    
    
    function createStepDescription(step) {
        switch (step.type) {
            case 'pivot':
                return `<p><strong>Selected pivot:</strong> Value ${step.array[step.pivot]} at index ${step.pivot}</p>`;
            case 'compare':
                return `<p><strong>Comparing:</strong> Value ${step.array[step.comparing[0]]} at index ${step.comparing[0]} with pivot value ${step.array[step.comparing[1]]} at index ${step.comparing[1]}</p>`;
            case 'swap':
                return `<p><strong>Swapping elements:</strong> Value ${step.array[step.swapping[0]]} at index ${step.swapping[0]} with value ${step.array[step.swapping[1]]} at index ${step.swapping[1]}</p>`;
            case 'sorted':
                if (step.sorted.length === step.array.length) {
                    return `<p><strong>Array is now fully sorted!</strong></p>`;
                } else {
                    const elements = step.sorted.map(i => `${step.array[i]} (index ${i})`).join(', ');
                    return `<p><strong>Element(s) in final position:</strong> ${elements}</p>`;
                }
            case 'range':
                
                let pivotInfo = "";
                for (let i = 0; i < step.array.length; i++) {
                    if (i >= step.range[0] && i <= step.range[1] && step.pivotIndex === i) {
                        pivotInfo = ` (pivot at index ${i}, value ${step.array[i]})`;
                        break;
                    }
                }
                return `<p><strong>Processing subarray:</strong> From index ${step.range[0]} to ${step.range[1]}${pivotInfo}</p>`;
            default:
                return `<p>Step ${currentStepIndex + 1}</p>`;
        }
    }
    
    
    function createReasonDescription(step) {
        return "";
    }
    
    function processQuicksortStep(step, animate) {
        
        bars.attr("fill", colors.bar);
        
        
        g.selectAll(".pointer-arrow").remove();
        
        
        if (step.array) {
            currentArray = [...step.array];
            updateBars(step.array, animate);
        }
        
        
        if (step.range) {
            const [low, high] = step.range;
            bars.filter((d, i) => i >= low && i <= high)
                .attr("fill", colors.bar);
        }
        
        
        if (step.pivot !== undefined) {
            bars.filter((d, i) => i === step.pivot)
                .attr("fill", colors.pivot);
        }
        
        
        if (step.comparing) {
            step.comparing.forEach(index => {
                bars.filter((d, i) => i === index)
                    .attr("fill", colors.comparing);
            });
        }
        
        
        if (step.swapping) {
            step.swapping.forEach(index => {
                bars.filter((d, i) => i === index)
                    .attr("fill", colors.swapping);
            });
        }
        
        
        if (step.sorted) {
            step.sorted.forEach(index => {
                bars.filter((d, i) => i === index)
                    .attr("fill", colors.sorted);
            });
        }
        
        
        addPointerArrows(step);
    }
    
    
    function addPointerArrows(step) {
        
        if (step.i_pointer !== undefined || step.j_pointer !== undefined) {
            
            if (step.i_pointer !== undefined && step.i_pointer >= -1) {
                const iIndex = step.i_pointer;
                const xPos = iIndex >= 0 ? xScale(iIndex) + xScale.bandwidth() / 2 : xScale(0) - xScale.bandwidth() / 2;
                
                
                g.append("path")
                    .attr("class", "pointer-arrow")
                    .attr("d", `M${xPos},${-50} L${xPos},${-30} L${xPos-6},${-36} M${xPos},${-30} L${xPos+6},${-36}`)
                    .attr("stroke", "#FF5722")
                    .attr("stroke-width", 3)
                    .attr("fill", "none");
                
                
                g.append("text")
                    .attr("class", "pointer-arrow")
                    .attr("x", xPos)
                    .attr("y", -60)
                    .attr("text-anchor", "middle")
                    .attr("fill", "#FF5722")
                    .attr("font-weight", "bold")
                    .attr("font-size", "14px")
                    .text("i=" + iIndex);
            }
            
            
            if (step.j_pointer !== undefined) {
                const jIndex = step.j_pointer;
                const xPos = xScale(jIndex) + xScale.bandwidth() / 2;
                
                
                g.append("path")
                    .attr("class", "pointer-arrow")
                    .attr("d", `M${xPos},${-50} L${xPos},${-30} L${xPos-6},${-36} M${xPos},${-30} L${xPos+6},${-36}`)
                    .attr("stroke", "#2196F3")
                    .attr("stroke-width", 3)
                    .attr("fill", "none");
                
                
                g.append("text")
                    .attr("class", "pointer-arrow")
                    .attr("x", xPos)
                    .attr("y", -60)
                    .attr("text-anchor", "middle")
                    .attr("fill", "#2196F3")
                    .attr("font-weight", "bold")
                    .attr("font-size", "14px")
                    .text("j=" + jIndex);
            }
        }
    }
    
    function updateBars(newData, animate = true) {
        const duration = animate ? 500 : 0;
        
        
        if (newData.length !== currentArray.length) {
            xScale.domain(d3.range(newData.length));
            g.select(".x-axis")
                .call(d3.axisBottom(xScale));
        }
        
        
        
        const maxValue = d3.max(newData);
        yScale.domain([0, maxValue * 1.1]);  
        g.select(".y-axis")
            .call(d3.axisLeft(yScale));
        
        
        bars.data(newData)
            .transition()
            .duration(duration)
            .attr("x", (d, i) => xScale(i))
            .attr("y", d => yScale(d))
            .attr("width", xScale.bandwidth())
            .attr("height", d => innerHeight - yScale(d));
        
        
        barLabels.data(newData)
            .transition()
            .duration(duration)
            .attr("x", (d, i) => xScale(i) + xScale.bandwidth() / 2)
            .attr("y", d => yScale(d) - 5)
            .attr("font-size", d => d > 999 ? "10px" : "12px") 
            .text(d => d > 9999 ? Math.round(d/1000) + "k" : d); 
    }
    
    
    function zoomIn() {
        const newZoom = Math.min(currentZoom * 1.2, 3);
        
        
        const transform = d3.zoomIdentity
            .translate(currentTransform[0], currentTransform[1])
            .scale(newZoom);
            
        
        const graphWidth = innerWidth * transform.k;
        const graphHeight = innerHeight * transform.k;
        
        const xMin = width - graphWidth - margin.right;
        const xMax = margin.left;
        const yMin = height - graphHeight - margin.bottom;
        const yMax = margin.top;
        
        transform.x = Math.min(xMax, Math.max(xMin, transform.x));
        transform.y = Math.min(yMax, Math.max(yMin, transform.y));
        
        
        svg.transition().duration(300).call(
            zoom.transform,
            transform
        );
    }
    
    function zoomOut() {
        const newZoom = Math.max(currentZoom * 0.8, 0.5);
        
        
        const transform = d3.zoomIdentity
            .translate(currentTransform[0], currentTransform[1])
            .scale(newZoom);
            
        
        const graphWidth = innerWidth * transform.k;
        const graphHeight = innerHeight * transform.k;
        
        const xMin = width - graphWidth - margin.right;
        const xMax = margin.left;
        const yMin = height - graphHeight - margin.bottom;
        const yMax = margin.top;
        
        transform.x = Math.min(xMax, Math.max(xMin, transform.x));
        transform.y = Math.min(yMax, Math.max(yMin, transform.y));
        
        
        svg.transition().duration(300).call(
            zoom.transform,
            transform
        );
    }
    
    function resetZoom() {
        
        svg.transition().duration(300).call(
            zoom.transform,
            d3.zoomIdentity.translate(margin.left, margin.top)
        );
        currentZoom = 1;
        currentTransform = [margin.left, margin.top]; 
    }
    
    
    resetVisualization();
    
    
    window.handleSortingResize = function() {
        
        const newWidth = container.clientWidth;
        svg.attr("width", newWidth)
           .attr("viewBox", [0, 0, newWidth, height]); 
        
        
        const newInnerWidth = newWidth - margin.left - margin.right;
        
        
        xScale.range([0, newInnerWidth]);
        g.select(".x-axis")
            .call(d3.axisBottom(xScale));
        
        
        
        
        bars.attr("x", (d, i) => xScale(i))
            .attr("width", xScale.bandwidth());
            
        
        barLabels.attr("x", (d, i) => xScale(i) + xScale.bandwidth() / 2);

        
        resetZoom();
        
        
        if (currentStepIndex >= 0) {
            processStep(currentStepIndex, false);
        }
    };
    
    
    window.addEventListener('resize', function() {
        window.handleSortingResize();
    });
    
    
    setTimeout(function() {
        const sidebar = document.querySelector('.sidebar, .st-emotion-cache-ue6h4q, .st-emotion-cache-1n76uvr');
        if (sidebar) {
            const observer = new MutationObserver(function(mutations) {
                
                window.handleSortingResize();
            });
            
            observer.observe(sidebar, { 
                attributes: true,
                attributeFilter: ['style', 'class'],
                childList: false,
                subtree: false
            });
            
            
            if (sidebar.parentElement) {
                observer.observe(sidebar.parentElement, { 
                    attributes: true,
                    attributeFilter: ['style', 'class'],
                    childList: false,
                    subtree: false
                });
            }
        }
    }, 1000); 
    
    
    if (window.addKeyboardNavigation) {
        window.addKeyboardNavigation(container, {
            next: stepForward,
            prev: stepBackward,
            playPause: togglePlay,
            reset: resetVisualization
        });
    }
    
    return {
        
        reset: resetVisualization,
        next: stepForward,
        prev: stepBackward,
        play: function() {
            if (!isPlaying) {
                togglePlay();
            }
        },
        pause: function() {
            if (isPlaying) {
                togglePlay();
            }
        }
    };
}


window.createSortingVisualization = createSortingVisualization;