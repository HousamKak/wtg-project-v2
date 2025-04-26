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
        
        // Current theme
        this.currentTheme = 'dark';
        
        // Theme colors
        this.themeColors = {
            dark: {
                background: '#000000',
                sidebar: 'rgba(30, 30, 35, 0.95)',
                controls: 'rgba(30, 30, 35, 0.9)',
                text: '#ffffff'
            },
            light: {
                background: '#f5f5f7',
                sidebar: 'rgba(240, 240, 245, 0.95)',
                controls: 'rgba(240, 240, 245, 0.9)', 
                text: '#333333'
            }
        };
        
        // Default node colors
        this.defaultNodeColors = {
            'Axiom': '#D32F2F',
            'Definition': '#1976D2',
            'Lemma': '#388E3C',
            'Theorem': '#7B1FA2',
            'Corollary': '#F57C00'
        };
        
        // Default edge colors
        this.defaultEdgeColors = {
            'depends_on': '#42A5F5',
            'proves': '#66BB6A',
            'generalizes': '#FF7043'
        };
        
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

        // Node spacing slider
        this.initNodeSpacingSlider();
        
        // Top-right controls
        this.initTopControls();
        
        // Modals
        this.initModals();
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

        // Initialize button state based on current camera state
        const isRotating = this.cameraController.autoRotate;
        button.classList.toggle('active', isRotating);
        button.textContent = isRotating ? 'Disable Rotation' : 'Enable Rotation';

        // Attach event listener
        button.addEventListener('click', () => {
            // Use the controller's toggle method to change state
            const newState = this.cameraController.toggleAutoRotation();

            // Update button appearance
            button.classList.toggle('active', newState);
            button.textContent = newState ? 'Disable Rotation' : 'Enable Rotation';
        });
    }
    
    /**
     * Initialize toggle forces button
     */
    initToggleForcesButton() {
        const button = document.getElementById('toggle-forces');
        if (!button) return;

        // Initialize button state based on current force simulation state
        const isActive = this.forceSimulation.useForces;
        button.classList.toggle('active', isActive);
        button.textContent = isActive ? 'Disable Forces' : 'Enable Forces';

        // Attach event listener
        button.addEventListener('click', () => {
            // Use the simulation's toggle method
            const newState = this.forceSimulation.toggleForces();

            // Update button appearance
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

        // Attach event listener
        button.addEventListener('click', () => {
            // Directly call the controller's reset method
            this.cameraController.resetToDefaultPosition();
        });
    }
    
    /**
     * Initialize reset positions button
     */
    initResetPositionsButton() {
        const button = document.getElementById('reset-positions');
        if (!button) return;

        // Attach event listener
        button.addEventListener('click', () => {
            // Call the node manager's reset method
            this.nodeManager.resetPositions();
            
            // Update edge positions
            if (this.edgeManager) {
                this.edgeManager.updateEdgePositions();
            }
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
     * Initialize top controls
     */
    initTopControls() {
        // Info button
        const infoButton = document.getElementById('info-button');
        if (infoButton) {
            infoButton.addEventListener('click', () => {
                const infoModal = document.getElementById('info-modal');
                if (infoModal) {
                    infoModal.classList.add('active');
                }
            });
        }
        
        // Theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // Settings button
        const settingsButton = document.getElementById('settings-button');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                const settingsModal = document.getElementById('settings-modal');
                if (settingsModal) {
                    // Initialize settings values
                    this.initializeSettingsValues();
                    
                    // Show modal
                    settingsModal.classList.add('active');
                }
            });
        }
        
        // Top expand view button
        const expandButton = document.getElementById('top-expand-view');
        if (expandButton) {
            // Set initial state
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                expandButton.classList.toggle('active', sidebar.classList.contains('hidden'));
            }
            
            expandButton.addEventListener('click', () => {
                const sidebar = document.getElementById('sidebar');
                if (!sidebar) return;
                
                sidebar.classList.toggle('hidden');
                expandButton.classList.toggle('active', sidebar.classList.contains('hidden'));
                
                // Force resize to ensure graph renders correctly
                window.dispatchEvent(new Event('resize'));
            });
        }
    }
    
    /**
     * Initialize modals with proper event handling
     */
    initModals() {
        // Info modal
        const infoModal = document.getElementById('info-modal');
        if (infoModal) {
            // Close button
            const closeButton = infoModal.querySelector('.close');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    infoModal.classList.remove('active');
                });
            }
            
            // Close when clicking outside
            infoModal.addEventListener('click', (event) => {
                if (event.target === infoModal) {
                    infoModal.classList.remove('active');
                }
            });
        }
        
        // Settings modal
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) {
            // Close button
            const closeButton = settingsModal.querySelector('.close');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    settingsModal.classList.remove('active');
                });
            }
            
            // Close when clicking outside
            settingsModal.addEventListener('click', (event) => {
                if (event.target === settingsModal) {
                    settingsModal.classList.remove('active');
                }
            });
            
            // Apply button
            const applyButton = settingsModal.querySelector('#apply-settings');
            if (applyButton) {
                applyButton.addEventListener('click', () => {
                    this.applySettings();
                    settingsModal.classList.remove('active');
                });
            }
            
            // Reset button
            const resetButton = settingsModal.querySelector('#reset-settings');
            if (resetButton) {
                resetButton.addEventListener('click', () => {
                    this.resetSettings();
                });
            }
        }
    }
    
    /**
     * Initialize settings values in the settings modal
     */
    initializeSettingsValues() {
        // Set theme mode
        const themeMode = document.getElementById('theme-mode');
        if (themeMode) {
            themeMode.value = this.currentTheme;
        }
        
        // Set node colors
        for (const nodeType in this.defaultNodeColors) {
            const inputId = nodeType.toLowerCase() + '-color';
            const input = document.getElementById(inputId);
            if (input) {
                // Get current color from window.themeManager if available
                if (window.themeManager && window.themeManager.nodeColors) {
                    const colorInt = window.themeManager.nodeColors[nodeType];
                    if (colorInt !== undefined) {
                        input.value = this.intToHex(colorInt);
                    } else {
                        input.value = this.defaultNodeColors[nodeType];
                    }
                } else {
                    input.value = this.defaultNodeColors[nodeType];
                }
            }
        }
        
        // Set edge colors
        const edgeTypeMapping = {
            'depends_on': 'depends-color',
            'proves': 'proves-color',
            'generalizes': 'generalizes-color'
        };
        
        for (const edgeType in edgeTypeMapping) {
            const input = document.getElementById(edgeTypeMapping[edgeType]);
            if (input) {
                // Get current color from window.themeManager if available
                if (window.themeManager && window.themeManager.edgeColors) {
                    const colorInt = window.themeManager.edgeColors[edgeType];
                    if (colorInt !== undefined) {
                        input.value = this.intToHex(colorInt);
                    } else {
                        input.value = this.defaultEdgeColors[edgeType];
                    }
                } else {
                    input.value = this.defaultEdgeColors[edgeType];
                }
            }
        }
        
        // Set background color
        const backgroundInput = document.getElementById('background-color');
        if (backgroundInput) {
            if (this.graphManager && this.graphManager.scene) {
                const bgColor = this.graphManager.scene.background;
                if (bgColor) {
                    backgroundInput.value = '#' + bgColor.getHexString();
                } else {
                    backgroundInput.value = '#000000';
                }
            } else {
                backgroundInput.value = '#000000';
            }
        }
    }
    
    /**
     * Apply settings from the settings modal
     */
    applySettings() {
        // Get theme mode
        const themeMode = document.getElementById('theme-mode');
        if (themeMode) {
            this.applyTheme(themeMode.value);
        }
        
        // Apply node colors
        if (window.themeManager) {
            // Update node colors
            for (const nodeType in this.defaultNodeColors) {
                const inputId = nodeType.toLowerCase() + '-color';
                const input = document.getElementById(inputId);
                if (input) {
                    const colorHex = input.value;
                    const colorInt = parseInt(colorHex.substring(1), 16);
                    window.themeManager.nodeColors[nodeType] = colorInt;
                }
            }
            
            // Update edge colors
            const edgeTypeMapping = {
                'depends_on': 'depends-color',
                'proves': 'proves-color',
                'generalizes': 'generalizes-color'
            };
            
            for (const edgeType in edgeTypeMapping) {
                const input = document.getElementById(edgeTypeMapping[edgeType]);
                if (input) {
                    const colorHex = input.value;
                    const colorInt = parseInt(colorHex.substring(1), 16);
                    window.themeManager.edgeColors[edgeType] = colorInt;
                }
            }
            
            // Dispose of cached materials to force recreation with new colors
            if (typeof window.themeManager.disposeMaterials === 'function') {
                window.themeManager.disposeMaterials();
            }
        }
        
        // Apply background color
        const backgroundInput = document.getElementById('background-color');
        if (backgroundInput && this.graphManager && this.graphManager.scene) {
            const colorHex = backgroundInput.value;
            this.graphManager.scene.background = new THREE.Color(colorHex);
        }
        
        // Update all nodes and edges
        this.updateAllGraphElements();
        
        console.log('Settings applied');
    }
    
    /**
     * Reset settings to defaults
     */
    resetSettings() {
        // Reset node colors in UI
        for (const nodeType in this.defaultNodeColors) {
            const inputId = nodeType.toLowerCase() + '-color';
            const input = document.getElementById(inputId);
            if (input) {
                input.value = this.defaultNodeColors[nodeType];
            }
        }
        
        // Reset edge colors in UI
        const edgeTypeMapping = {
            'depends_on': 'depends-color',
            'proves': 'proves-color',
            'generalizes': 'generalizes-color'
        };
        
        for (const edgeType in edgeTypeMapping) {
            const input = document.getElementById(edgeTypeMapping[edgeType]);
            if (input) {
                input.value = this.defaultEdgeColors[edgeType];
            }
        }
        
        // Reset background color in UI
        const backgroundInput = document.getElementById('background-color');
        if (backgroundInput) {
            backgroundInput.value = '#000000';
        }
        
        console.log('Settings reset to defaults');
    }
    
    /**
     * Toggle theme between dark and light
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }
    
    /**
     * Apply a theme
     * @param {string} theme - 'dark' or 'light'
     */
    applyTheme(theme) {
        if (theme !== 'dark' && theme !== 'light') return;
        
        this.currentTheme = theme;
        const colors = this.themeColors[theme];
        
        // Apply background color to scene
        if (this.graphManager && this.graphManager.scene) {
            this.graphManager.scene.background = new THREE.Color(colors.background);
        }
        
        // Apply CSS variables for theme
        document.documentElement.style.setProperty('--background-color', colors.background);
        document.documentElement.style.setProperty('--controls-bg', colors.controls);
        document.documentElement.style.setProperty('--sidebar-bg', colors.sidebar);
        document.documentElement.style.setProperty('--text-color', colors.text);
        
        // Apply styles to sidebar
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.backgroundColor = colors.sidebar;
            sidebar.style.color = colors.text;
        }
        
        // Apply styles to controls
        const controls = document.getElementById('controls');
        if (controls) {
            controls.style.backgroundColor = colors.controls;
            controls.style.color = colors.text;
        }
        
        // Apply styles to modals
        const modals = document.querySelectorAll('.modal-content');
        modals.forEach(modal => {
            modal.style.backgroundColor = colors.sidebar;
            modal.style.color = colors.text;
        });
        
        // Apply styles to node types and edge types panels
        const typePanels = document.querySelectorAll('.node-types, .edge-types');
        typePanels.forEach(panel => {
            panel.style.backgroundColor = colors.controls;
            panel.style.color = colors.text;
        });
        
        // Update theme selector in settings if open
        const themeSelect = document.getElementById('theme-mode');
        if (themeSelect) {
            themeSelect.value = theme;
        }
        
        console.log(`Theme changed to ${theme}`);
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
     * Update all graph elements to reflect new colors
     */
    updateAllGraphElements() {
        // Only proceed if required components are available
        if (!window.themeManager) return;
        
        // Update nodes
        if (this.nodeManager) {
            const allNodes = this.nodeManager.getAllNodes();
            for (const nodeId in allNodes) {
                const node = allNodes[nodeId];
                const nodeType = node.userData.nodeType;
                
                // Get the appropriate material based on node state
                const isSelected = window.WTG.selectionManager && 
                                window.WTG.selectionManager.getSelectedNodeId() === nodeId;
                const state = isSelected ? 'selected' : 'default';
                
                // Update node material
                const oldMaterial = node.material;
                const newMaterial = window.themeManager.getNodeMaterial(nodeType, state);
                node.material = newMaterial;
                
                // Dispose of old material
                if (oldMaterial) {
                    oldMaterial.dispose();
                }
            }
        }
        
        // Update edges
        if (this.edgeManager) {
            const allEdges = this.edgeManager.getAllEdges();
            allEdges.forEach(edge => {
                const edgeType = edge.userData.type;
                
                // Update edge material
                const oldMaterial = edge.material;
                const newMaterial = window.themeManager.getEdgeMaterial(edgeType, 'default');
                edge.material = newMaterial;
                
                // Dispose of old material
                if (oldMaterial) {
                    oldMaterial.dispose();
                }
            });
        }
    }
    
    /**
     * Convert an integer color to hex string
     * @param {number} colorInt - Integer color value
     * @returns {string} - Hex color string
     */
    intToHex(colorInt) {
        if (colorInt === undefined || colorInt === null) {
            return '#000000';
        }
        
        // Convert to hex string with padding
        return '#' + colorInt.toString(16).padStart(6, '0');
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