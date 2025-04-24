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
        console.log('Selecting node from mouse position:', mouse);
        // Get intersections with scene objects
        const intersects = this.graphManager.getIntersectedObjects(mouse);

        console.log('Intersected objects:', intersects);
        // Check for hits on nodes
        for (let i = 0; i < intersects.length; i++) {
            const object = intersects[i].object;
            if (object.userData && object.userData.type === 'node') {
                console.log('Node selected:', object.userData.id);
                this.selectNode(object.userData.id);
                return;
            }
        }

        console.log('No node selected, clearing selection.');
        // If no node was hit, ensure the click is not on the graph container background
        if (intersects.length === 0 && mouse.x !== 0 && mouse.y !== 0) {
            this.clearSelection();
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