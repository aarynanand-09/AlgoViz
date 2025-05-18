/**
 * Main JavaScript file for shared functionality
 * Used by both graph and sorting visualizations
 */
let globalAnimationSpeed = 1.0;
let globalStepSize = 1;
// Update animation speed and step size globally
function updateControlParams(speed, stepSize) {
    globalAnimationSpeed = speed;
    globalStepSize = stepSize;
    if (window.graphUpdateControlParams) {
        window.graphUpdateControlParams(speed, stepSize);
    }
    if (window.sortingUpdateControlParams) {
        window.sortingUpdateControlParams(speed, stepSize);
    }
}
window.updateControlParams = updateControlParams;
// Fullscreen functionality is disabled
function toggleFullscreen(container) {
    console.log("Fullscreen functionality has been disabled");
    return;
}
window.toggleFullscreen = toggleFullscreen;
// Dummy fullscreen button for UI compatibility
function createFullscreenButton(container) {
    return { style: {} };
}
window.createFullscreenButton = createFullscreenButton;
// Create explanation panels for step and reason
function createExplanationPanels(container) {
    const visContainer = container.closest('.visualization-container');
    let explanationContainer = visContainer.querySelector('.explanation-container');
    const visTitle = visContainer.querySelector('.vis-title') || document.createElement('div');
    if (!visContainer.querySelector('.vis-title')) {
        visTitle.className = 'vis-title';
        visTitle.textContent = 'Algorithm Visualization'; 
        if (visContainer.firstChild) {
            visContainer.insertBefore(visTitle, visContainer.firstChild);
        } else {
            visContainer.appendChild(visTitle);
        }
    }
    if (!explanationContainer) {
        explanationContainer = document.createElement('div');
        explanationContainer.className = 'explanation-container';
        visContainer.appendChild(explanationContainer); 
    }
    let stepsPanel = explanationContainer.querySelector('.steps-panel');
    if (!stepsPanel) {
        stepsPanel = document.createElement('div');
        stepsPanel.className = 'step-explanation steps-panel';
        explanationContainer.appendChild(stepsPanel);
    }
    stepsPanel.innerHTML = '<p><strong>Current Step:</strong> No steps yet.</p>';
    let reasonPanel = explanationContainer.querySelector('.reason-panel');
    if (!reasonPanel) {
        reasonPanel = document.createElement('div');
        reasonPanel.className = 'step-explanation reason-panel';
        explanationContainer.appendChild(reasonPanel);
    }
    reasonPanel.innerHTML = '<p><strong>Explanation:</strong> Details will appear here.</p>';
    return {
        updateStepContent: function(htmlContent) {
            stepsPanel.innerHTML = htmlContent;
        },
        updateReasonContent: function(htmlContent) {
            reasonPanel.innerHTML = htmlContent;
        },
        updateTitleContent: function(text) {
            visTitle.textContent = text;
        },
        stepsPanel: stepsPanel,       
        reasonPanel: reasonPanel,     
        explanationContainer: explanationContainer 
    };
}
window.createExplanationPanels = createExplanationPanels;
// Keyboard navigation for visualization controls
function addKeyboardNavigation(container, callbacks) {
    const { next, prev, playPause, reset } = callbacks;
    const handleKeyDown = function(event) {
        if (!container.offsetParent) return;
        if (["ArrowLeft", "ArrowRight", " "].includes(event.key)) {
            event.preventDefault();
        }
        switch (event.key) {
            case "ArrowRight":
                if (next && typeof next === 'function') next();
                break;
            case "ArrowLeft":
                if (prev && typeof prev === 'function') prev();
                break;
            case " ":
                if (playPause && typeof playPause === 'function') playPause();
                break;
            case "r":
                if (reset && typeof reset === 'function') reset();
                break;
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return function removeKeyboardNavigation() {
        document.removeEventListener('keydown', handleKeyDown);
    };
}
window.addKeyboardNavigation = addKeyboardNavigation;
// Create zoom controls for the visualization
function createZoomControls(container, zoomInCallback, zoomOutCallback, resetZoomCallback) {
    const visContainer = container.closest('.visualization-container');
    let zoomControls = visContainer.querySelector('.zoom-controls');
    if (!zoomControls) {
        zoomControls = document.createElement('div');
        zoomControls.className = 'zoom-controls';
        visContainer.appendChild(zoomControls);
    }
    zoomControls.innerHTML = ''; 
    const zoomInButton = document.createElement('button');
    zoomInButton.innerHTML = '+';
    zoomInButton.title = 'Zoom In';
    zoomInButton.className = 'zoom-button';
    zoomInButton.onclick = zoomInCallback;
    const zoomOutButton = document.createElement('button');
    zoomOutButton.innerHTML = '-';
    zoomOutButton.title = 'Zoom Out';
    zoomOutButton.className = 'zoom-button';
    zoomOutButton.onclick = zoomOutCallback;
    const resetZoomButton = document.createElement('button');
    resetZoomButton.innerHTML = 'R';
    resetZoomButton.title = 'Reset Zoom';
    resetZoomButton.className = 'zoom-button';
    resetZoomButton.onclick = resetZoomCallback;
    const keyboardInfoBtn = document.createElement('button');
    keyboardInfoBtn.className = 'zoom-button keyboard-info';
    keyboardInfoBtn.innerHTML = '⌨';
    keyboardInfoBtn.title = 'Keyboard Shortcuts: Space = Play/Pause, ← = Previous, → = Next, R = Reset';
    keyboardInfoBtn.onclick = function() {
        alert('Keyboard Shortcuts:\n\n' +
              'Space: Play/Pause\n' +
              '←: Previous Step\n' +
              '→: Next Step\n' +
              'R: Reset');
    };
    zoomControls.appendChild(zoomInButton);
    zoomControls.appendChild(zoomOutButton);
    zoomControls.appendChild(resetZoomButton);
    zoomControls.appendChild(keyboardInfoBtn);
    return zoomControls;
}
window.createZoomControls = createZoomControls;
// Ensure all controls are visible after resize or load
function ensureControlsVisibility(container) {
    const visContainer = container.closest('.visualization-container') || container;
    const controlsToEnsure = ['.explanation-container', '.zoom-controls', '.graph-editor-controls', '.control-panel', '.fullscreen-button', '.vis-title'];
    controlsToEnsure.forEach(selector => {
        const el = visContainer.querySelector(selector);
        if (el) {
            if (el.style.display === 'none') {
                el.style.display = '';
            }
            el.style.visibility = 'visible';
            el.style.opacity = '1';
        }
    });
}
window.ensureControlsVisibility = ensureControlsVisibility;
function setupDarkModeToggle() {}
window.addEventListener('resize', function() {
    const containers = document.querySelectorAll('.visualization-container');
    containers.forEach(container => {
        ensureControlsVisibility(container);
    });
    if (window.handleGraphResize) {
        window.handleGraphResize();
    }
    if (window.handleSortingResize) {
        window.handleSortingResize();
    }
});
window.addEventListener('load', function() {
    setTimeout(() => {
        const containers = document.querySelectorAll('.visualization-container');
        containers.forEach(container => {
            ensureControlsVisibility(container);
        });
    }, 500);
});