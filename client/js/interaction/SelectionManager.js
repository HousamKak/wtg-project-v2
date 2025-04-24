/**
 * SelectionManager.js
 * Manages node selection, highlighting, and related interactions
 */
class SelectionManager {
    constructor(graphManager, nodeManager, edgeManager, cameraController, sidebarManager) {
        this.graphManager = graphManager;
        this.nodeManager = nodeManager;
        this.edgeManager = edgeManager;
        this.cameraController = cameraController;
        this.sidebarManager = sidebarManager;
        
        // Currently selected node ID
        this.selectedNodeId = null;
    }
    
    /**
     * Select a node by ID
     * @param {string} nodeId - Node ID
     */
    selectNode(nodeId) {
        if (!nodeId) return;
        
        // Save previous selection
        const previousSelection = this.selectedNodeId;
        this.selectedNodeId = nodeId;
        
        // Skip if selecting the same node
        if (previousSelection === nodeId) return;
        
        // Get the node object
        const node = this.nodeManager.getNode(nodeId);
        if (!node) return;
        
        // Highlight connections
        this.highlightConnections(nodeId);
        
        // Focus camera on node
        this.cameraController.focusOn(node.position);
        
        // Update sidebar with node details
        if (this.sidebarManager) {
            this.sidebarManager.showNodeDetails(nodeId);
        }
        
        // Notify accessibility manager if available
        if (window.accessibilityManager) {
            window.accessibilityManager.onNodeSelected(nodeId);
        }
    }
    
    /**
     * Clear the current selection
     */
    clearSelection() {
        this.selectedNodeId = null;
        this.nodeManager.resetNodeStates();
        this.edgeManager.resetEdgeStates();
        
        // Clear sidebar
        if (this.sidebarManager) {
            this.sidebarManager.clearDetails();
        }
    }
    
    /**
     * Highlight connections to a selected node
     * @param {string} nodeId - Selected node ID
     */
    highlightConnections(nodeId) {
        this.edgeManager.highlightConnections(nodeId);
    }
    
    /**
     * Select a node from mouse coordinates
     * @param {Object} mouse - Mouse coordinates in normalized device coordinates
     */
    selectFromMouse(mouse) {
        // SAFETY CHECK: Validate mouse input
        if (!mouse || !isFinite(mouse.x) || !isFinite(mouse.y)) {
            console.error('Invalid mouse coordinates provided to selectFromMouse:', mouse);
            return;
        }
        
        // Get intersections with scene objects
        try {
            const intersects = this.graphManager.getIntersectedObjects(mouse);
            
            // Check for hits on nodes
            for (let i = 0; i < intersects.length; i++) {
                const object = intersects[i].object;
                if (object && object.userData && object.userData.type === 'node') {
                    this.selectNode(object.userData.id);
                    return;
                }
            }
            
            // If no node was hit, check if we should clear selection
            if ((Math.abs(mouse.x) > 0.01 || Math.abs(mouse.y) > 0.01)) {
                // Only handle clicks inside the graph container
                const graphContainer = document.getElementById('graph-container');
                if (!graphContainer) return;
                
                const rect = graphContainer.getBoundingClientRect();
                
                // Convert normalized device coordinates back to screen coordinates
                const screenX = ((mouse.x + 1) / 2) * window.innerWidth;
                const screenY = ((1 - mouse.y) / 2) * window.innerHeight;
                
                // IMPORTANT FIX: Check if click is on UI elements
                const isOnUI = this.isClickOnUIElement(screenX, screenY);
                
                if (screenX >= rect.left && screenX <= rect.right && 
                    screenY >= rect.top && screenY <= rect.bottom && !isOnUI) {
                    // CRITICAL FIX: Carefully clear selection without affecting graph
                    this.safelyClearSelection();
                }
            }
        } catch (error) {
            console.error('Error in selectFromMouse:', error);
        }
    }

    /**
     * Helper to check if click is on UI elements
     * @param {number} x - Screen X coordinate
     * @param {number} y - Screen Y coordinate
     * @returns {boolean} - True if click is on a UI element
     */
    isClickOnUIElement(x, y) {
        const uiElements = [
            'controls', 'search-bar', 'info', 'sidebar', 'legend', 
            'node-types', 'edge-types'
        ];
        
        for (const id of uiElements) {
            const element = document.getElementById(id);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                    console.log(`Click detected on UI element: ${id}`);
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Safely clear the current selection
     */
    safelyClearSelection() {
        console.log('Safely clearing selection...');
        
        // Store old selection ID before clearing
        const previousSelection = this.selectedNodeId;
        this.selectedNodeId = null;
        
        // CRITICAL FIX: Check node existence before resetting states
        if (this.nodeManager) {
            // Verify nodes still exist before resetting
            const nodeCount = Object.keys(this.nodeManager.nodeObjects).length;
            console.log(`Resetting states for ${nodeCount} nodes`);
            
            if (nodeCount > 0) {
                try {
                    this.nodeManager.resetNodeStates();
                } catch (error) {
                    console.error('Error resetting node states:', error);
                    // Attempt to restore previous selection if reset fails
                    this.selectedNodeId = previousSelection;
                }
            } else {
                console.error('No nodes found in nodeManager! Graph may be missing.');
            }
        }
        
        // Reset edge states only if edgeManager exists and has edges
        if (this.edgeManager) {
            const edgeCount = this.edgeManager.edgeObjects ? 
                this.edgeManager.edgeObjects.length : 0;
                
            console.log(`Resetting states for ${edgeCount} edges`);
            
            if (edgeCount > 0) {
                try {
                    this.edgeManager.resetEdgeStates();
                } catch (error) {
                    console.error('Error resetting edge states:', error);
                }
            }
        }
        
        // Clear sidebar if needed
        if (this.sidebarManager) {
            try {
                this.sidebarManager.clearDetails();
            } catch (error) {
                console.error('Error clearing sidebar:', error);
            }
        }
    }
    
    /**
     * Get currently selected node ID
     * @returns {string} - Selected node ID or null
     */
    getSelectedNodeId() {
        return this.selectedNodeId;
    }
    
    /**
     * Get selected node object
     * @returns {Object} - Selected node object or null
     */
    getSelectedNode() {
        if (!this.selectedNodeId) return null;
        return this.nodeManager.getNode(this.selectedNodeId);
    }
    
    /**
     * Get IDs of nodes connected to the currently selected node
     * @returns {Array} - Array of connected node IDs
     */
    getConnectedNodeIds() {
        if (!this.selectedNodeId) return [];
        return this.edgeManager.getConnectedNodeIds(this.selectedNodeId);
    }
    
    /**
     * Select next node in a specific direction
     * @param {string} direction - Direction ('up', 'down', 'left', 'right')
     */
    selectNextNode(direction) {
        if (!this.selectedNodeId) return;
        
        const currentNode = this.nodeManager.getNode(this.selectedNodeId);
        if (!currentNode) return;
        
        const currentPos = currentNode.position;
        const nodeObjects = this.nodeManager.getAllNodes();
        let bestMatch = null;
        let bestDistance = Infinity;
        
        // Find the closest node in the specified direction
        for (const id in nodeObjects) {
            if (id === this.selectedNodeId) continue;
            
            const node = nodeObjects[id];
            const pos = node.position;
            
            // Check if node is in the right direction
            let isRightDirection = false;
            
            switch (direction) {
                case 'up':
                    isRightDirection = pos.y > currentPos.y;
                    break;
                case 'down':
                    isRightDirection = pos.y < currentPos.y;
                    break;
                case 'left':
                    isRightDirection = pos.x < currentPos.x;
                    break;
                case 'right':
                    isRightDirection = pos.x > currentPos.x;
                    break;
            }
            
            if (isRightDirection) {
                // Calculate distance
                const dx = pos.x - currentPos.x;
                const dy = pos.y - currentPos.y;
                const dz = pos.z - currentPos.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                // Check if this is the closest node so far
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = id;
                }
            }
        }
        
        // Select the best match if found
        if (bestMatch) {
            this.selectNode(bestMatch);
        }
    }
    
    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyNavigation(event) {
        switch (event.key) {
            case 'ArrowUp':
                this.selectNextNode('up');
                event.preventDefault();
                break;
            case 'ArrowDown':
                this.selectNextNode('down');
                event.preventDefault();
                break;
            case 'ArrowLeft':
                this.selectNextNode('left');
                event.preventDefault();
                break;
            case 'ArrowRight':
                this.selectNextNode('right');
                event.preventDefault();
                break;
            case 'Escape':
                this.clearSelection();
                event.preventDefault();
                break;
        }
    }
}

// Make available in module and global contexts
if (typeof module !== 'undefined') {
    module.exports = SelectionManager;
} else {
    window.SelectionManager = SelectionManager;
}