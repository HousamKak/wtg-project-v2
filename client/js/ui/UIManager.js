/**
 * UIManager.js
 * Manages UI controls and their interaction with the graph
 */
class UIManager {
    constructor(graphManager, nodeManager, edgeManager, forceSimulation, cameraController) {
        this.graphManager = graphManager;
        this.nodeManager = nodeManager;
        this.edgeManager = edgeManager;
        this.forceSimulation = forceSimulation;
        this.cameraController = cameraController;
        
        // Initialize UI controls
        this.initUIControls();
    }
    
    /**
     * Initialize UI controls and their event listeners
     */
    initUIControls() {
        // Toggle dimension button
        this.initToggleDimensionButton();
        
        // Toggle rotation button
        this.initToggleRotationButton();
        
        // Toggle forces button
        this.initToggleForcesButton();
        
        // Reset view button
        this.initResetViewButton();
        
        // Reset positions button
        this.initResetPositionsButton();
        
        // Expand view button
        this.initExpandViewButton();
        
        // Node spacing slider
        this.initNodeSpacingSlider();
        
        // Show title banner temporarily
        this.showTitleBanner();
    }
    
    /**
     * Initialize toggle dimension button
     */
    initToggleDimensionButton() {
        const button = document.getElementById('toggle-dimension');
        if (!button) return;
        
        button.addEventListener('click', () => {
            this.graphManager.toggleDimension();
            button.textContent = this.graphManager.is2DMode ? '3D View' : '2D View';
            
            // Update force simulation dimension mode
            if (this.forceSimulation) {
                this.forceSimulation.setDimensionMode(this.graphManager.is2DMode);
            }
        });
    }
    
    /**
     * Initialize toggle rotation button
     */
    initToggleRotationButton() {
        const button = document.getElementById('toggle-rotation');
        if (!button) return;
        
        // Initialize with dataset for state tracking
        button.dataset.active = 'false';
        
        button.addEventListener('click', () => {
            // Toggle rotation state
            const currentState = button.dataset.active === 'true';
            const newState = !currentState;
            
            button.dataset.active = newState.toString();
            button.textContent = newState ? 'Disable Rotation' : 'Enable Rotation';
            button.classList.toggle('active', newState);
            
            // Update camera controller
            if (this.cameraController) {
                this.cameraController.setAutoRotation(newState);
            }
        });
    }
    
    /**
     * Initialize toggle forces button
     */
    initToggleForcesButton() {
        const button = document.getElementById('toggle-forces');
        if (!button) return;
        
        // Initialize as active (forces enabled)
        button.classList.add('active');
        
        button.addEventListener('click', () => {
            // Toggle forces
            const newState = this.forceSimulation.toggleForces();
            
            button.classList.toggle('active', newState);
            button.textContent = newState ? 'Disable Forces' : 'Enable Forces';
        });
    }
    
    /**
     * Initialize reset view button
     */
    initResetViewButton() {
        const button = document.getElementById('reset-view');
        if (!button) return;
        
        button.addEventListener('click', () => {
            this.cameraController.resetToDefaultPosition();
        });
    }
    
    /**
     * Initialize reset positions button
     */
    initResetPositionsButton() {
        const button = document.getElementById('reset-positions');
        if (!button) return;
        
        button.addEventListener('click', () => {
            this.nodeManager.resetPositions();
            this.edgeManager.updateEdgePositions();
        });
    }
    
    /**
     * Initialize expand view button
     */
    initExpandViewButton() {
        const button = document.getElementById('expand-view');
        if (!button) return;
        
        button.addEventListener('click', () => {
            const graphContainer = document.getElementById('graph-container');
            const sidebar = document.getElementById('sidebar');
            
            if (!graphContainer || !sidebar) return;
            
            if (graphContainer.style.width === '100%') {
                graphContainer.style.width = '70%';
                sidebar.classList.remove('hidden');
                button.textContent = 'Expand View';
            } else {
                graphContainer.style.width = '100%';
                sidebar.classList.add('hidden');
                button.textContent = 'Show Sidebar';
            }
            
            // Force a resize event to update the graph
            window.dispatchEvent(new Event('resize'));
        });
    }
    
    /**
     * Initialize node spacing slider
     */
    initNodeSpacingSlider() {
        const slider = document.getElementById('node-spacing');
        const valueDisplay = document.getElementById('spacing-value');
        
        if (!slider || !valueDisplay) return;
        
        // Update displayed value when slider changes
        slider.addEventListener('input', () => {
            const value = parseInt(slider.value);
            valueDisplay.textContent = value;
            
            // Update minimum node distance in force simulation
            if (this.forceSimulation) {
                this.forceSimulation.setMinNodeDistance(value);
            }
        });
    }
    
    /**
     * Show title banner temporarily
     */
    showTitleBanner() {
        const titleBanner = document.getElementById('title-banner');
        if (!titleBanner) return;
        
        // Make visible
        titleBanner.classList.add('visible');
        
        // Hide after 3 seconds
        setTimeout(() => {
            titleBanner.classList.remove('visible');
        }, 3000);
    }
    
    /**
     * Set a status message
     * @param {string} message - Status message
     * @param {number} duration - Display duration in milliseconds (0 for permanent)
     */
    setStatusMessage(message, duration = 0) {
        // Create status element if it doesn't exist
        let statusElement = document.getElementById('status-message');
        
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'status-message';
            statusElement.style.position = 'absolute';
            statusElement.style.bottom = '20px';
            statusElement.style.right = '20px';
            statusElement.style.padding = '10px';
            statusElement.style.backgroundColor = 'rgba(20, 20, 25, 0.8)';
            statusElement.style.color = 'white';
            statusElement.style.borderRadius = '5px';
            statusElement.style.zIndex = '100';
            statusElement.style.transition = 'opacity 0.3s ease';
            
            document.body.appendChild(statusElement);
        }
        
        // Set message
        statusElement.textContent = message;
        statusElement.style.opacity = '1';
        
        // Clear previous timeout
        if (this.statusTimeout) {
            clearTimeout(this.statusTimeout);
        }
        
        // Set timeout to clear message if duration is not 0
        if (duration > 0) {
            this.statusTimeout = setTimeout(() => {
                statusElement.style.opacity = '0';
            }, duration);
        }
    }
    
    /**
     * Clear status message
     */
    clearStatusMessage() {
        const statusElement = document.getElementById('status-message');
        if (statusElement) {
            statusElement.style.opacity = '0';
        }
    }
    
    /**
     * Initialize layout controls
     * @param {Object} layoutManager - The layout manager instance
     */
    initLayoutControls(layoutManager) {
        if (!layoutManager) return;
        
        // Create layout selector dropdown
        const controls = document.getElementById('controls');
        if (!controls) return;
        
        const layoutSection = document.createElement('div');
        layoutSection.style.marginTop = '15px';
        layoutSection.style.borderTop = '1px solid rgba(255,255,255,0.2)';
        layoutSection.style.paddingTop = '15px';
        
        layoutSection.innerHTML = `
            <label for="layout-selector" style="display: block; margin-bottom: 5px;">Layout</label>
            <select id="layout-selector" style="width: 100%; margin-bottom: 8px; background-color: rgba(52, 152, 219, 0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 4px;">
                <option value="force">Force-Directed</option>
                <option value="hierarchical">Hierarchical</option>
                <option value="radial">Radial</option>
                <option value="concentric">Concentric</option>
                <option value="clustered">Clustered</option>
            </select>
        `;
        
        controls.appendChild(layoutSection);
        
        // Add event listener
        const selector = document.getElementById('layout-selector');
        if (selector) {
            selector.addEventListener('change', () => {
                const layout = selector.value;
                layoutManager.switchLayout(layout);
                
                // Toggle forces off if not using force layout
                if (layout !== 'force' && this.forceSimulation) {
                    this.forceSimulation.useForces = false;
                    const forcesButton = document.getElementById('toggle-forces');
                    if (forcesButton) {
                        forcesButton.classList.remove('active');
                        forcesButton.textContent = 'Enable Forces';
                    }
                }
            });
        }
    }
}

// Make available in module and global contexts
if (typeof module !== 'undefined') {
    module.exports = UIManager;
} else {
    window.UIManager = UIManager;
}