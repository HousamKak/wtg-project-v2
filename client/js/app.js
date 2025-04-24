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
        graphManager.setManagers(nodeManager, edgeManager, selectionManager);
        
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
                return cameraController.toggleAutoRotation();
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
        }
    };
})();