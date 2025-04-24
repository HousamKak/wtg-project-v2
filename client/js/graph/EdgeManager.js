/**
 * EdgeManager.js
 * Manages edge creation, positioning, and updates in the graph
 */
class EdgeManager {
    constructor(graphManager, nodeManager) {
        this.graphManager = graphManager;
        this.nodeManager = nodeManager;
        
        // Edge collection
        this.edgeObjects = [];
    }
    
    /**
     * Initialize edges from data
     * @param {Array} edgesData - Array of edge data objects
     */
    initEdges(edgesData) {
        edgesData.forEach(edge => this.createEdge(edge));
    }
    
    /**
     * Create a single edge
     * @param {Object} edgeData - Edge data object
     */
    createEdge(edgeData) {
        // Get node positions
        const nodePositions = this.nodeManager.getNodePositions();
        const source = nodePositions[edgeData.source];
        const target = nodePositions[edgeData.target];
        
        // Skip if source or target doesn't exist
        if (!source || !target) return;
        
        // Create edge material based on edge type
        const materialProps = window.themeManager.createEdgeMaterial(edgeData.type);
        const material = new THREE.LineBasicMaterial(materialProps);
        
        // Create line geometry
        const points = [source.clone(), target.clone()];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Create line and set user data
        const line = new THREE.Line(geometry, material);
        line.userData = { 
            sourceId: edgeData.source,
            targetId: edgeData.target,
            type: edgeData.type
        };
        
        // Add to scene and store reference
        this.graphManager.addToScene(line);
        this.edgeObjects.push(line);
    }
    
    /**
     * Update all edge positions based on current node positions
     */
    updateEdgePositions() {
        const nodeObjects = this.nodeManager.getAllNodes();
        
        this.edgeObjects.forEach(edge => {
            const sourceId = edge.userData.sourceId;
            const targetId = edge.userData.targetId;
            
            if (nodeObjects[sourceId] && nodeObjects[targetId]) {
                const sourcePos = nodeObjects[sourceId].position;
                const targetPos = nodeObjects[targetId].position;
                
                // Update the line geometry
                const points = [
                    sourcePos.clone(),
                    targetPos.clone()
                ];
                
                // Dispose old geometry to prevent memory leaks
                edge.geometry.dispose();
                
                // Create new geometry with updated points
                edge.geometry = new THREE.BufferGeometry().setFromPoints(points);
            }
        });
    }
    
    /**
     * Update an edge's material based on its state
     * @param {Object} edge - Edge object
     * @param {string} state - State ('default', 'selected')
     */
    updateEdgeState(edge, state) {
        const materialProps = window.themeManager.createEdgeMaterial(
            edge.userData.type, 
            state
        );
        
        Object.assign(edge.material, materialProps);
    }
    
    /**
     * Reset all edges to default state
     */
    resetEdgeStates() {
        this.edgeObjects.forEach(edge => {
            this.updateEdgeState(edge, 'default');
        });
    }
    
    /**
     * Get all edges connecting to a specific node
     * @param {string} nodeId - Node ID
     * @returns {Array} - Array of connected edge objects
     */
    getConnectedEdges(nodeId) {
        return this.edgeObjects.filter(edge => 
            edge.userData.sourceId === nodeId || edge.userData.targetId === nodeId
        );
    }
    
    /**
     * Get all nodes connected to a specific node
     * @param {string} nodeId - Node ID
     * @returns {Array} - Array of connected node IDs
     */
    getConnectedNodeIds(nodeId) {
        const connectedEdges = this.getConnectedEdges(nodeId);
        
        return connectedEdges.map(edge => 
            edge.userData.sourceId === nodeId 
                ? edge.userData.targetId 
                : edge.userData.sourceId
        );
    }
    
    /**
     * Highlight edges and connected nodes for selection
     * @param {string} nodeId - Selected node ID
     */
    highlightConnections(nodeId) {
        // Reset all nodes and edges first
        this.nodeManager.resetNodeStates();
        this.resetEdgeStates();
        
        // Highlight selected node
        this.nodeManager.updateNodeState(nodeId, 'selected');
        
        // Find connected edges
        const connectedEdges = this.getConnectedEdges(nodeId);
        
        // Highlight connected edges and nodes
        connectedEdges.forEach(edge => {
            // Highlight edge
            this.updateEdgeState(edge, 'selected');
            
            // Highlight connected node
            const connectedNodeId = edge.userData.sourceId === nodeId 
                ? edge.userData.targetId 
                : edge.userData.sourceId;
            
            this.nodeManager.updateNodeState(connectedNodeId, 'related');
        });
    }
    
    /**
     * Get edge type for a connection between two nodes
     * @param {string} sourceId - Source node ID
     * @param {string} targetId - Target node ID
     * @returns {string} - Edge type or null if no connection
     */
    getEdgeType(sourceId, targetId) {
        const edge = this.edgeObjects.find(edge => 
            (edge.userData.sourceId === sourceId && edge.userData.targetId === targetId) ||
            (edge.userData.sourceId === targetId && edge.userData.targetId === sourceId)
        );
        
        return edge ? edge.userData.type : null;
    }
    
    /**
     * Get all edges
     * @returns {Array} - Array of edge objects
     */
    getAllEdges() {
        return this.edgeObjects;
    }
    
    /**
     * Get edges by type
     * @param {string} type - Edge type
     * @returns {Array} - Array of matching edge objects
     */
    getEdgesByType(type) {
        return this.edgeObjects.filter(edge => edge.userData.type === type);
    }
    
    /**
     * Get raw edge data for use in other calculations
     * @returns {Array} - Array of edge data objects
     */
    getEdgeData() {
        return this.edgeObjects.map(edge => ({
            source: edge.userData.sourceId,
            target: edge.userData.targetId,
            type: edge.userData.type
        }));
    }
}

// Make available in module and global contexts
if (typeof module !== 'undefined') {
    module.exports = EdgeManager;
} else {
    window.EdgeManager = EdgeManager;
}