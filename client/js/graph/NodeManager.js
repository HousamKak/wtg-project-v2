/**
 * NodeManager.js
 * Manages node creation, positioning, and updates in the graph
 */
class NodeManager {
    constructor(graphManager) {
        this.graphManager = graphManager;
        
        // Node collections
        this.nodeObjects = {}; // Maps node IDs to THREE.js objects
        this.nodePositions = {}; // Maps node IDs to positions
        this.labelObjects = {}; // Maps node IDs to label objects
        
        // Original positions for reset
        this.originalPositions = {}; // Maps node IDs to original positions
        
        // Minimum distance between nodes for force simulation
        this.minNodeDistance = 100;
    }
    
    /**
     * Initialize nodes from data
     * @param {Array} nodesData - Array of node data objects
     */
    initNodes(nodesData) {
        console.log(`Initializing ${nodesData.length} nodes`);
        
        // Calculate initial positions
        this.calculateInitialPositions(nodesData);
        
        // Create node objects
        nodesData.forEach(node => this.createNode(node));
        
        // Store original positions for reset
        for (const id in this.nodePositions) {
            this.originalPositions[id] = this.nodePositions[id].clone();
        }
    }
    
    /**
     * Calculate initial positions for all nodes
     * @param {Array} nodesData - Array of node data objects
     */
    calculateInitialPositions(nodesData) {
        nodesData.forEach(node => {
            // Create geometric positions based on level - more compact layout
            const radius = 20 + node.connections * 5; // Radius depends on connections
            const yFactor = 20; // Vertical spacing between levels
            
            let angle, x, y, z;
            
            // Different layout for each level
            if (node.id === 'zfc') {
                // ZFC at center
                x = 0; y = 0; z = 0;
            } else {
                // Position based on level and connections
                const nodesInLevel = nodesData.filter(n => n.level === node.level).length;
                const indexInLevel = nodesData.filter(n => n.level === node.level).findIndex(n => n.id === node.id);
                
                // Calculate angle evenly distributed around circle
                angle = (indexInLevel / nodesInLevel) * Math.PI * 2;
                
                // Calculate position - more connected nodes closer to center
                const radiusMultiplier = 1 - (node.connections / 10); // Connection factor
                x = radius * Math.cos(angle) * radiusMultiplier;
                z = radius * Math.sin(angle) * radiusMultiplier;
                y = -50 + node.level * yFactor; // Higher level nodes higher up
            }
            
            // Store initial position
            this.nodePositions[node.id] = new THREE.Vector3(x, y, z);
        });
    }
    
    /**
     * Create a single node with its label
     * @param {Object} nodeData - Node data object
     */
    createNode(nodeData) {
        // Get node position
        const position = this.nodePositions[nodeData.id];
        if (!position) {
            console.warn(`No position found for node ${nodeData.id}`);
            return;
        }

        // Create node geometry
        const geometry = new THREE.SphereGeometry(nodeData.size, 32, 32);
        
        // Get material from theme manager
        const material = window.themeManager.getNodeMaterial(nodeData.type, 'default');
        
        // Log material creation for debugging
        console.log(`Creating node ${nodeData.id} with type ${nodeData.type}, opacity: ${material.opacity}`);

        // Create mesh and position it
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.userData = {
            id: nodeData.id,
            type: 'node',
            label: nodeData.label,
            nodeType: nodeData.type,
            level: nodeData.level,
            connections: nodeData.connections,
            size: nodeData.size
        };

        // Add to scene and store reference
        this.graphManager.addToScene(mesh);
        this.nodeObjects[nodeData.id] = mesh;

        // Create text label for the node
        this.createLabel(nodeData, position);
    }
    
    /**
     * Create a text label for a node
     * @param {Object} nodeData - Node data object
     * @param {Object} position - THREE.js Vector3 position
     */
    createLabel(nodeData, position) {
        // Create canvas for the label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Calculate font size based on node size
        const fontSize = Math.max(Math.round(nodeData.size * 2), 16);
        const padding = 8;
        
        // Measure text width
        context.font = `bold ${fontSize}px Arial`;
        const textMetrics = context.measureText(nodeData.label);
        const textWidth = textMetrics.width + padding * 2;
        const textHeight = fontSize + padding * 2;
        
        // Size the canvas
        canvas.width = textWidth;
        canvas.height = textHeight;
        
        // Draw background
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw text
        context.font = `bold ${fontSize}px Arial`;
        context.fillStyle = '#ffffff';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(nodeData.label, canvas.width / 2, canvas.height / 2);
        
        // Create texture and sprite
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        
        // Position sprite above node
        sprite.position.set(
            position.x, 
            position.y + nodeData.size + 5, 
            position.z
        );
        
        sprite.scale.set(textWidth / 6, textHeight / 6, 1);
        sprite.userData = { id: nodeData.id, type: 'label' };
        
        // Add to scene and store reference
        this.graphManager.addToScene(sprite);
        this.labelObjects[nodeData.id] = sprite;
    }
    
    /**
     * Update a node's material based on its state
     * @param {string} nodeId - Node ID
     * @param {string} state - State ('default', 'selected', 'related')
     */
    updateNodeState(nodeId, state) {
        const nodeObj = this.nodeObjects[nodeId];
        if (!nodeObj) {
            console.warn(`Node ${nodeId} not found for state update`);
            return;
        }

        try {
            // Replace the entire material instead of updating properties
            const oldMaterial = nodeObj.material;
            const newMaterial = window.themeManager.getNodeMaterial(
                nodeObj.userData.nodeType, 
                state
            );
            
            nodeObj.material = newMaterial;
            
            // Dispose of old material to prevent memory leaks
            if (oldMaterial) {
                oldMaterial.dispose();
            }
            
            console.log(`Updated node ${nodeId} to state: ${state}, new opacity: ${newMaterial.opacity}`);
        } catch (error) {
            console.error(`Error updating node ${nodeId} state:`, error);
        }
    }
    
    /**
     * Reset all nodes to default state
     */
    resetNodeStates() {
        console.log(`Resetting states for ${Object.keys(this.nodeObjects).length} nodes`);
        for (const id in this.nodeObjects) {
            try {
                this.updateNodeState(id, 'default');
            } catch (error) {
                console.error(`Error resetting node state for ${id}:`, error);
            }
        }
    }
    
    /**
     * Get node by ID
     * @param {string} nodeId - Node ID
     * @returns {Object} - THREE.js node object
     */
    getNode(nodeId) {
        return this.nodeObjects[nodeId];
    }
    
    /**
     * Get all nodes
     * @returns {Object} - Map of node IDs to THREE.js objects
     */
    getAllNodes() {
        return this.nodeObjects;
    }
    
    /**
     * Get node positions
     * @returns {Object} - Map of node IDs to positions
     */
    getNodePositions() {
        return this.nodePositions;
    }
    
    /**
     * Set minimum distance between nodes
     * @param {number} distance - Minimum distance
     */
    setMinNodeDistance(distance) {
        this.minNodeDistance = distance;
    }
    
    /**
     * Update positions for 2D view (flatten Z coordinate)
     * @param {number} progress - Animation progress (0-1)
     */
    flattenNodes(progress) {
        for (const id in this.nodeObjects) {
            const node = this.nodeObjects[id];
            
            // Gradually reduce Z to 0
            node.position.z *= (1 - progress);
            
            // Update label position
            if (this.labelObjects[id]) {
                const label = this.labelObjects[id];
                label.position.set(
                    node.position.x,
                    node.position.y + node.userData.size + 5,
                    node.position.z
                );
            }
            
            // Update position in nodePositions map
            this.nodePositions[id] = node.position.clone();
        }
    }
    
    /**
     * Update positions when transitioning back to 3D
     * @param {number} progress - Animation progress (0-1)
     * @param {Object} originalPositions - Original 3D positions
     */
    unflattenNodes(progress, originalPositions) {
        for (const id in this.nodeObjects) {
            const node = this.nodeObjects[id];
            const original = originalPositions[id];
            
            if (original) {
                // Gradually increase Z back to original
                node.position.set(
                    original.x,
                    original.y,
                    original.z * progress
                );
                
                // Update label position
                if (this.labelObjects[id]) {
                    const label = this.labelObjects[id];
                    label.position.set(
                        node.position.x,
                        node.position.y + node.userData.size + 5,
                        node.position.z
                    );
                }
                
                // Update position in nodePositions map
                this.nodePositions[id] = node.position.clone();
            }
        }
    }
    
    /**
     * Reset nodes to their original calculated positions
     */
    resetPositions() {
        console.log('Resetting node positions to original');

        // Loop through all nodes and reset to original positions
        for (const id in this.nodeObjects) {
            const node = this.nodeObjects[id];
            const originalPosition = this.originalPositions[id];

            if (node && originalPosition) {
                // Set position directly
                node.position.copy(originalPosition);
                
                // Also update nodePositions map
                this.nodePositions[id] = originalPosition.clone();
                
                // Update label position
                if (this.labelObjects[id]) {
                    const label = this.labelObjects[id];
                    const nodeSize = node.userData.size || node.geometry.parameters.radius;
                    
                    label.position.set(
                        originalPosition.x,
                        originalPosition.y + nodeSize + 5,
                        originalPosition.z
                    );
                }
            }
        }
        
        // Force the edge manager to update if available through WTG
        if (window.WTG && window.WTG.edgeManager) {
            window.WTG.edgeManager.updateEdgePositions();
        }
        
        // Trigger a scene update
        if (window.WTG && window.WTG.graphManager && window.WTG.graphManager.renderer) {
            window.WTG.graphManager.renderer.render(
                window.WTG.graphManager.scene,
                window.WTG.graphManager.camera
            );
        }
        
        return true;
    }
    
    /**
     * Update positions based on forces (for force-directed layout)
     * @param {Array} edges - Array of edge data objects
     * @param {boolean} is2DMode - Whether in 2D mode
     * @returns {number} Total movement
     */
    updatePositionsWithForces(edges, is2DMode) {
        // Apply forces to nodes
        let totalMovement = 0;
        
        for (const id in this.nodeObjects) {
            const obj = this.nodeObjects[id];
            let forceX = 0;
            let forceY = 0;
            let forceZ = 0;
            
            // Repulsion force between all nodes
            for (const otherId in this.nodeObjects) {
                if (id === otherId) continue;
                
                const otherObj = this.nodeObjects[otherId];
                const dx = obj.position.x - otherObj.position.x;
                const dy = obj.position.y - otherObj.position.y;
                const dz = is2DMode ? 0 : obj.position.z - otherObj.position.z;
                
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (distance > 0 && distance < this.minNodeDistance * 3) {
                    // Stronger repulsion when nodes get closer than minNodeDistance
                    let repulsionFactor;
                    if (distance < this.minNodeDistance) {
                        repulsionFactor = (this.minNodeDistance * 2) / (distance * distance);
                    } else {
                        repulsionFactor = 30 / (distance * distance);
                    }
                    
                    forceX += dx * repulsionFactor;
                    forceY += dy * repulsionFactor;
                    if (!is2DMode) forceZ += dz * repulsionFactor;
                }
            }
            
            // Attraction force for connected nodes
            edges.forEach(edge => {
                if (edge.source === id || edge.target === id) {
                    const otherId = edge.source === id ? edge.target : edge.source;
                    const otherObj = this.nodeObjects[otherId];
                    
                    if (otherObj) {
                        const dx = otherObj.position.x - obj.position.x;
                        const dy = otherObj.position.y - obj.position.y;
                        const dz = is2DMode ? 0 : otherObj.position.z - obj.position.z;
                        
                        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        
                        // The higher the connections count, the stronger the attraction
                        const connectionStrength = obj.userData.connections * 0.01 || 0.03;
                        
                        if (distance > 20) {
                            const attractionFactor = distance * connectionStrength;
                            forceX += dx * attractionFactor;
                            forceY += dy * attractionFactor;
                            if (!is2DMode) forceZ += dz * attractionFactor;
                        }
                    }
                }
            });
            
            // Apply the forces with gentle damping
            const dampingFactor = 0.03; // Slower movement for less jittering
            const oldX = obj.position.x;
            const oldY = obj.position.y;
            const oldZ = obj.position.z;
            
            obj.position.x += forceX * dampingFactor;
            obj.position.y += forceY * dampingFactor;
            if (!is2DMode) obj.position.z += forceZ * dampingFactor;
            else obj.position.z = 0;
            
            // Keep Z at 0 in 2D mode
            if (is2DMode) {
                obj.position.z = 0;
            }
            
            // Level constraint - keep nodes near their hierarchical level
            const targetY = -50 + obj.userData.level * 20;
            obj.position.y += (targetY - obj.position.y) * 0.01;
            
            // Update position in nodePositions map
            this.nodePositions[id] = obj.position.clone();
            
            // Update label position
            if (this.labelObjects[id]) {
                const label = this.labelObjects[id];
                label.position.set(
                    obj.position.x,
                    obj.position.y + obj.userData.size + 5,
                    obj.position.z
                );
            }
            
            // Calculate movement for stability detection
            const dx = obj.position.x - oldX;
            const dy = obj.position.y - oldY;
            const dz = obj.position.z - oldZ;
            totalMovement += Math.sqrt(dx*dx + dy*dy + dz*dz);
        }
        
        return totalMovement;
    }
    
    /**
     * Get a node by position (nearest node to a given position)
     * @param {Object} position - THREE.js Vector3 position
     * @param {number} threshold - Distance threshold
     * @returns {Object} - Node object or null
     */
    getNodeByPosition(position, threshold = 10) {
        let nearestNode = null;
        let minDistance = threshold;
        
        for (const id in this.nodeObjects) {
            const node = this.nodeObjects[id];
            const distance = position.distanceTo(node.position);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestNode = node;
            }
        }
        
        return nearestNode;
    }
}

// Make available in module and global contexts
if (typeof module !== 'undefined') {
    module.exports = NodeManager;
} else {
    window.NodeManager = NodeManager;
}