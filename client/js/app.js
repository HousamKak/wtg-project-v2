/**
 * app.js
 * Main application initialization and coordination
 */
(function() {
    'use strict';
    
    // Application state
    let initialized = false;
    
    // Manager instances
    let graphManager;
    let nodeManager;
    let edgeManager;
    let forceSimulation;
    let cameraController;
    let selectionManager;
    let eventManager;
    let uiManager;
    let sidebarManager;
    let searchManager;
    let layoutManager;
    
    /**
     * Initialize the application
     */
    function initialize() {
        if (initialized) return;
        
        console.log('Initializing Where in the Graph application...');
        
        // Create the graph manager
        graphManager = new GraphManager();
        
        // Create the node manager
        nodeManager = new NodeManager(graphManager);
        
        // Create the edge manager
        edgeManager = new EdgeManager(graphManager, nodeManager);
        
        // Create the force simulation
        forceSimulation = new ForceSimulation(graphManager, nodeManager, edgeManager);
        
        // Create the camera controller
        cameraController = new CameraController(graphManager);
        
        // Create the sidebar manager
        sidebarManager = new SidebarManager(graphManager, nodeManager, edgeManager);
        
        // Create the selection manager
        selectionManager = new SelectionManager(
            graphManager, 
            nodeManager, 
            edgeManager, 
            cameraController, 
            sidebarManager
        );
        
        // Create the event manager
        eventManager = new EventManager(
            graphManager, 
            cameraController, 
            selectionManager
        );
        
        // Create the UI manager
        uiManager = new UIManager(
            graphManager, 
            nodeManager, 
            edgeManager, 
            forceSimulation, 
            cameraController
        );
        
        // Create the search manager
        searchManager = new SearchManager(
            graphManager, 
            nodeManager, 
            selectionManager
        );
        
        // Set up references between managers
        graphManager.setManagers(nodeManager, edgeManager, selectionManager, cameraController);
        
        // Initialize the nodes
        nodeManager.initNodes(window.nodes || []);
        
        // Initialize the edges
        edgeManager.initEdges(window.edges || []);
        
        // Start the force simulation
        forceSimulation.start();
        
        // Start the animation loop
        graphManager.startAnimation(false);
        
        // Add keyboard event handling for navigation
        eventManager.addKeyPressListener(event => {
            selectionManager.handleKeyNavigation(event);
        });
        
        // Set initial dimension mode for force simulation
        forceSimulation.setDimensionMode(graphManager.is2DMode);
        
        // Log success
        console.log('Where in the Graph application initialized successfully');
        
        // Set initialization flag
        initialized = true;
    }
    
    /**
     * Cleanup application resources
     */
    function cleanup() {
        // Stop force simulation
        if (forceSimulation) {
            forceSimulation.stop();
        }
        
        // Remove event listeners
        if (eventManager) {
            // Remove any specific listeners here if needed
        }
        
        // Dispose of THREE.js resources
        if (graphManager && graphManager.renderer) {
            graphManager.renderer.dispose();
        }
        
        console.log('Where in the Graph application cleaned up');
    }
    
    /**
     * Handle window resize events
     */
    function handleResize() {
        if (graphManager) {
            // GraphManager already has a resize handler
            // Additional resize logic can be added here if needed
        }
    }
    
    /**
     * Handle window unload event
     */
    function handleUnload() {
        cleanup();
    }
    
    /**
     * Start the application when the DOM is loaded
     */
    function start() {
        // Initialize application
        initialize();
        
        // Add window event handlers
        window.addEventListener('resize', handleResize);
        window.addEventListener('unload', handleUnload);
    }
    
    // Start the application when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
    
    // Expose public API if needed
    window.WTG = {
        graphManager,
        nodeManager,
        edgeManager,
        forceSimulation,
        cameraController,
        selectionManager,
        eventManager,
        uiManager,
        sidebarManager,
        searchManager,
        layoutManager,
        
        // Helper methods
        focusOnNode: function(nodeId) {
            if (selectionManager) {
                selectionManager.selectNode(nodeId);
                return true;
            }
            return false;
        },
        
        search: function(term) {
            if (searchManager) {
                return searchManager.searchAndSelect(term);
            }
            return false;
        },
        
        toggleDimension: function() {
            if (graphManager) {
                graphManager.toggleDimension();
                if (forceSimulation) {
                    forceSimulation.setDimensionMode(graphManager.is2DMode);
                }
                return graphManager.is2DMode;
            }
            return false;
        },
        
        toggleRotation: function() {
            if (cameraController) {
                const newState = cameraController.toggleAutoRotation();
                // Update button state if it exists
                const rotationButton = document.getElementById('toggle-rotation');
                if (rotationButton) {
                    rotationButton.classList.toggle('active', newState);
                    rotationButton.textContent = newState ? 'Disable Rotation' : 'Enable Rotation';
                }
                return newState;
            }
            return false;
        },
        
        toggleForces: function() {
            if (forceSimulation) {
                return forceSimulation.toggleForces();
            }
            return false;
        },
        
        resetView: function() {
            if (cameraController) {
                cameraController.resetToDefaultPosition();
                return true;
            }
            return false;
        },
        
        resetPositions: function() {
            if (nodeManager && edgeManager) {
                nodeManager.resetPositions();
                edgeManager.updateEdgePositions();
                return true;
            }
            return false;
        },
        
        switchLayout: function(layoutType) {
            if (layoutManager) {
                return layoutManager.switchLayout(layoutType);
            }
            return false;
        }
    };
    
    // Layout and UI fixes for the WTG application
function initExpandViewButton() {
    const button = document.getElementById('expand-view');
    const infoPanel = document.getElementById('info');

    if (!button) return;

    button.addEventListener('click', () => {
        const graphContainer = document.getElementById('graph-container');
        const sidebar = document.getElementById('sidebar');

        if (!graphContainer || !sidebar) return;

        const isExpanded = sidebar.classList.contains('hidden');

        if (isExpanded) {
            sidebar.classList.remove('hidden');
            button.textContent = 'Expand View';
            button.classList.remove('active');

            if (infoPanel) {
                infoPanel.classList.remove('expandedView');
            }
        } else {
            sidebar.classList.add('hidden');
            button.textContent = 'Show Sidebar';
            button.classList.add('active');

            if (infoPanel) {
                infoPanel.classList.add('expandedView');
            }
        }

        window.dispatchEvent(new Event('resize'));
    });
}

function reorganizeUIElements() {
    const legendElement = document.querySelector('.legend');
    if (!legendElement) return;

    const nodeTypesHeading = legendElement.querySelector('h3:first-of-type');
    const edgeTypesHeading = legendElement.querySelector('.edge-legend h3');

    if (!nodeTypesHeading || !edgeTypesHeading) return;

    const nodeTypesContainer = document.createElement('div');
    nodeTypesContainer.className = 'node-types';

    let currentElement = nodeTypesHeading;
    const nodesToMove = [];

    while (currentElement && !currentElement.classList.contains('edge-legend')) {
        nodesToMove.push(currentElement);
        currentElement = currentElement.nextElementSibling;
    }

    nodesToMove.forEach(node => {
        nodeTypesContainer.appendChild(node.cloneNode(true));
    });

    const edgeTypesContainer = document.createElement('div');
    edgeTypesContainer.className = 'edge-types';

    const edgeLegend = legendElement.querySelector('.edge-legend');
    if (edgeLegend) {
        edgeTypesContainer.innerHTML = edgeLegend.innerHTML;
    }

    legendElement.remove();
    document.body.appendChild(nodeTypesContainer);
    document.body.appendChild(edgeTypesContainer);
}

function setupButtonStates() {
    const toggleButtons = document.querySelectorAll('#controls [id^="toggle"]');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });

    const rotationButton = document.getElementById('toggle-rotation');
    const forcesButton = document.getElementById('toggle-forces');

    if (rotationButton) {
        rotationButton.classList.remove('active');
        rotationButton.textContent = 'Enable Rotation';
    }

    if (forcesButton) {
        forcesButton.classList.add('active');
        forcesButton.textContent = 'Disable Forces';
    }
}

function initLayoutFixes() {
    initExpandViewButton();
    reorganizeUIElements();
    setupButtonStates();
    console.log('Layout fixes initialized');
}

document.addEventListener('DOMContentLoaded', initLayoutFixes);

/**
 * Function to create and add legend to the graph interface
 * Shows node types and edge types with their corresponding colors
 */
function createGraphLegend() {
    console.log('Creating graph legend...');

    // Check if legend already exists
    if (document.querySelector('.legend')) {
        console.log('Legend already exists, not creating duplicate');
        return;
    }

    // Create legend container
    const legend = document.createElement('div');
    legend.className = 'legend';

    // Add node types section
    let html = `
        <h3>Node Types</h3>
        <div class="legend-item">
            <div class="legend-color" style="background-color: #D32F2F;"></div>
            <span>Axiom</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: #1976D2;"></div>
            <span>Definition</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: #388E3C;"></div>
            <span>Lemma</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: #7B1FA2;"></div>
            <span>Theorem</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: #F57C00;"></div>
            <span>Corollary</span>
        </div>
    `;

    // Add edge types section
    html += `
        <div class="edge-legend">
            <h3>Edge Types</h3>
            <div class="legend-item">
                <div class="legend-color" style="background-color: #42A5F5;"></div>
                <span>Depends On</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background-color: #66BB6A;"></div>
                <span>Proves</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background-color: #FF7043;"></div>
                <span>Generalizes</span>
            </div>
        </div>
    `;

    legend.innerHTML = html;
    document.body.appendChild(legend);

    console.log('Legend created and added to document');
}

// Add this to the window load event
window.addEventListener('load', createGraphLegend);

// Also call this from initialize function in app.js
// In the initialize function, add after everything else is initialized:
// createGraphLegend();

/**
 * Update node spacing slider initialization
 * Sets the initial value to 100 and updates the UI accordingly
 */
function initializeNodeSpacing() {
    console.log('Initializing node spacing slider...');
    const nodeSpacingInput = document.getElementById('node-spacing');

    if (nodeSpacingInput) {
        // Set slider value to 100
        nodeSpacingInput.value = 100;

        // Update displayed value
        const spacingValue = document.getElementById('spacing-value');
        if (spacingValue) {
            spacingValue.textContent = '100';
        }

        // Apply to force simulation if available
        if (window.WTG && window.WTG.forceSimulation) {
            window.WTG.forceSimulation.setMinNodeDistance(100);
        }

        console.log('Node spacing initialized to 100');
    } else {
        console.warn('Node spacing slider element not found');
    }
}

// Call this immediately after DOM is loaded
document.addEventListener('DOMContentLoaded', initializeNodeSpacing);

})();