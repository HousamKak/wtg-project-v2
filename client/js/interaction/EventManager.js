/**
 * EventManager.js
 * Manages all user interaction events for the graph
 */
class EventManager {
    constructor(graphManager, cameraController, selectionManager) {
        this.graphManager = graphManager;
        this.cameraController = cameraController;
        this.selectionManager = selectionManager;
        
        // Mouse state
        this.mouse = new THREE.Vector2();
        this.isDragging = false;
        this.isPanning = false;
        this.previousMousePosition = { x: 0, y: 0 };
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    /**
     * Initialize all event listeners
     */
    initEventListeners() {
        const renderer = this.graphManager.renderer;
        
        // Mouse down event for rotation and panning
        renderer.domElement.addEventListener('mousedown', this.handleMouseDown.bind(this));
        
        // Mouse move event for rotation and panning
        renderer.domElement.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Mouse up event to stop rotation/panning
        window.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Mouse wheel event for zooming
        renderer.domElement.addEventListener('wheel', this.handleMouseWheel.bind(this));
        
        // Mouse click event for node selection
        renderer.domElement.addEventListener('click', this.handleClick.bind(this));
        
        // Prevent context menu on right-click
        renderer.domElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    /**
     * Handle mouse down events
     * @param {Event} event - Mouse event
     */
    handleMouseDown(event) {
        if (event.button === 0) { // Left click
            this.isDragging = true;
        } else if (event.button === 2) { // Right click
            this.isPanning = true;
        }
        
        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
    
    /**
     * Handle mouse move events
     * @param {Event} event - Mouse event
     */
    handleMouseMove(event) {
        if (!this.isDragging && !this.isPanning) return;
        
        const currentMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
        
        const deltaMove = {
            x: currentMousePosition.x - this.previousMousePosition.x,
            y: currentMousePosition.y - this.previousMousePosition.y
        };
        
        if (this.isDragging) {
            // Rotate camera based on mouse movement
            this.cameraController.rotateCamera(deltaMove.x, deltaMove.y);
        }
        
        if (this.isPanning) {
            // Pan camera based on mouse movement
            this.cameraController.panCamera(deltaMove.x, deltaMove.y);
        }
        
        this.previousMousePosition = currentMousePosition;
    }
    
    /**
     * Handle mouse up events
     */
    handleMouseUp() {
        this.isDragging = false;
        this.isPanning = false;
    }
    
    /**
     * Handle mouse wheel events
     * @param {Event} event - Mouse event
     */
    handleMouseWheel(event) {
        event.preventDefault();
        
        // Reduced sensitivity for more gradual zooming
        const zoomSpeed = 5;
        const delta = -Math.sign(event.deltaY) * zoomSpeed;
        
        this.cameraController.zoomCamera(delta);
    }
    
    /**
     * Updated handleClick method to ensure proper logging and fix click detection logic
     * @param {Event} event - Mouse event
     */
    handleClick(event) {
        // Prevent handling if we're in the middle of dragging
        if (this.isDragging || this.isPanning) {
            console.log('Click ignored - currently dragging or panning');
            return;
        }

        // Only process as a click if we didn't drag much since mousedown
        const dragDistance = Math.sqrt(
            Math.pow(event.clientX - this.previousMousePosition.x, 2) + 
            Math.pow(event.clientY - this.previousMousePosition.y, 2)
        );
        
        if (dragDistance > 5) {
            console.log('Click ignored - detected as drag (distance > 5px)');
            return;
        }

        // Get mouse position in normalized device coordinates
        const rect = this.graphManager.renderer.domElement.getBoundingClientRect();
        
        // IMPORTANT FIX: Check if the renderer element has valid dimensions
        if (rect.width === 0 || rect.height === 0) {
            console.error('Renderer element has zero width or height!');
            return;
        }
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // SAFETY CHECK: Ensure mouse coordinates are valid
        if (!isFinite(this.mouse.x) || !isFinite(this.mouse.y)) {
            console.error('Invalid mouse coordinates calculated:', this.mouse);
            return;
        }

        // Perform selection with added safety
        try {
            this.selectionManager.selectFromMouse(this.mouse);
        } catch (error) {
            console.error('Error during selection:', error);
        }
    }
    
    /**
     * Add event listener for a UI element
     * @param {string} elementId - Element ID
     * @param {string} eventType - Event type (e.g., 'click')
     * @param {Function} callback - Event callback function
     */
    addUIEventListener(elementId, eventType, callback) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(eventType, callback);
        }
    }
    
    /**
     * Remove event listener for a UI element
     * @param {string} elementId - Element ID
     * @param {string} eventType - Event type
     * @param {Function} callback - Event callback function
     */
    removeUIEventListener(elementId, eventType, callback) {
        const element = document.getElementById(elementId);
        if (element) {
            element.removeEventListener(eventType, callback);
        }
    }
    
    /**
     * Add key press listener with improved keyboard navigation
     * @param {Function} callback - Key press callback function
     */
    addKeyPressListener(callback) {
        const keyHandler = (event) => {
            // Call original callback
            callback(event);

            // Add additional keyboard shortcuts
            switch (event.key) {
                case 'f':
                case 'F':
                    // Focus search box
                    const searchInput = document.getElementById('search-input');
                    if (searchInput) {
                        searchInput.focus();
                        event.preventDefault();
                    }
                    break;

                case 'h':
                case 'H':
                    // Show help dialog
                    this.showHelpDialog();
                    event.preventDefault();
                    break;

                case 't':
                case 'T':
                    // Toggle theme (could be implemented)
                    this.toggleTheme();
                    event.preventDefault();
                    break;

                // Add more shortcuts as needed
            }
        };

        window.addEventListener('keydown', keyHandler);
        return keyHandler; // Return handler for removal
    }

    /**
     * Show help dialog with keyboard shortcuts
     */
    showHelpDialog() {
        // Create help dialog if it doesn't exist
        let helpDialog = document.getElementById('keyboard-help');

        if (!helpDialog) {
            helpDialog = document.createElement('div');
            helpDialog.id = 'keyboard-help';
            helpDialog.className = 'help-dialog';
            helpDialog.innerHTML = `
                <div class="help-content">
                    <h2>Keyboard Shortcuts</h2>
                    <table>
                        <tr><td><kbd>Arrow Keys</kbd></td><td>Navigate between nodes</td></tr>
                        <tr><td><kbd>Esc</kbd></td><td>Clear selection</td></tr>
                        <tr><td><kbd>F</kbd></td><td>Focus search box</td></tr>
                        <tr><td><kbd>H</kbd></td><td>Show/hide this help</td></tr>
                        <tr><td><kbd>T</kbd></td><td>Toggle theme</td></tr>
                    </table>
                    <button id="close-help">Close</button>
                </div>
            `;

            document.body.appendChild(helpDialog);

            // Add close button handler
            document.getElementById('close-help').addEventListener('click', () => {
                helpDialog.style.display = 'none';
            });

            // Add styles if not already present
            if (!document.getElementById('help-dialog-styles')) {
                const style = document.createElement('style');
                style.id = 'help-dialog-styles';
                style.textContent = `
                    .help-dialog {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0, 0, 0, 0.7);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                    }
                    .help-content {
                        background-color: rgba(30, 30, 35, 0.95);
                        border-radius: 8px;
                        padding: 20px;
                        max-width: 500px;
                        color: white;
                        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                    }
                    .help-content h2 {
                        margin-top: 0;
                        color: #3498db;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                        padding-bottom: 10px;
                    }
                    .help-content table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                    }
                    .help-content td {
                        padding: 8px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    .help-content td:first-child {
                        width: 120px;
                    }
                    .help-content kbd {
                        background-color: rgba(255, 255, 255, 0.1);
                        padding: 2px 6px;
                        border-radius: 3px;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                    }
                    #close-help {
                        padding: 8px 15px;
                        background-color: #3498db;
                        border: none;
                        border-radius: 4px;
                        color: white;
                        cursor: pointer;
                        float: right;
                        margin-top: 10px;
                    }
                    #close-help:hover {
                        background-color: #2980b9;
                    }
                `;
                document.head.appendChild(style);
            }
        }

        // Toggle dialog visibility
        helpDialog.style.display = helpDialog.style.display === 'none' ? 'flex' : 'none';
    }
}

// Make available in module and global contexts
if (typeof module !== 'undefined') {
    module.exports = EventManager;
} else {
    window.EventManager = EventManager;
}