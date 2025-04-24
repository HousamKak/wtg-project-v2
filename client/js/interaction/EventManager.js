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
     * Handle click events
     * @param {Event} event - Mouse event
     */
    handleClick(event) {
        // Only process as a click if we didn't drag much
        if (Math.abs(event.clientX - this.previousMousePosition.x) > 5 || 
            Math.abs(event.clientY - this.previousMousePosition.y) > 5) {
            return;
        }
        
        // Get mouse position in normalized device coordinates
        const rect = this.graphManager.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Perform selection
        this.selectionManager.selectFromMouse(this.mouse);
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
     * Add key press listener
     * @param {Function} callback - Key press callback function
     */
    addKeyPressListener(callback) {
        window.addEventListener('keydown', callback);
    }
    
    /**
     * Remove key press listener
     * @param {Function} callback - Key press callback function
     */
    removeKeyPressListener(callback) {
        window.removeEventListener('keydown', callback);
    }
}

// Make available in module and global contexts
if (typeof module !== 'undefined') {
    module.exports = EventManager;
} else {
    window.EventManager = EventManager;
}