/**
 * LayoutManager.js
 * Manages different layout algorithms for the graph
 */
class LayoutManager {
    constructor(nodeManager, edgeManager) {
        this.nodeManager = nodeManager;
        this.edgeManager = edgeManager;
        
        // Available layout types
        this.layoutTypes = {
            FORCE_DIRECTED: 'force',
            HIERARCHICAL: 'hierarchical',
            RADIAL: 'radial',
            CONCENTRIC: 'concentric',
            CLUSTERED: 'clustered'
        };
        
        // Current layout type
        this.currentLayout = this.layoutTypes.FORCE_DIRECTED;
        
        // Layout configuration
        this.config = {
            hierarchical: {
                levelSeparation: 100,
                nodeSpacing: 50,
                direction: 'UD' // UD = Up-Down, LR = Left-Right
            },
            radial: {
                centerNode: 'zfc', // Node ID at the center
                radiusStep: 80,    // Distance between levels
                angleSpread: 2 * Math.PI // Full circle
            },
            concentric: {
                centerX: 0,
                centerY: 0,
                initialRadius: 50,
                radiusStep: 70
            },
            clustered: {
                clusterBy: 'type', // Cluster by node type, tags, or level
                clusterDistance: 250
            }
        };
    }
    
    /**
     * Apply the current layout
     * @param {boolean} animate - Whether to animate the transition
     */
    applyLayout(animate = true) {
        switch (this.currentLayout) {
            case this.layoutTypes.HIERARCHICAL:
                this.applyHierarchicalLayout(animate);
                break;
            case this.layoutTypes.RADIAL:
                this.applyRadialLayout(animate);
                break;
            case this.layoutTypes.CONCENTRIC:
                this.applyConcentricLayout(animate);
                break;
            case this.layoutTypes.CLUSTERED:
                this.applyClusteredLayout(animate);
                break;
            case this.layoutTypes.FORCE_DIRECTED:
            default:
                // Force-directed layout is handled by ForceSimulation
                break;
        }
        
        // Update edge positions
        if (this.edgeManager) {
            this.edgeManager.updateEdgePositions();
        }
    }
    
    /**
     * Switch to a different layout
     * @param {string} layoutType - Layout type from layoutTypes
     * @param {boolean} animate - Whether to animate the transition
     */
    switchLayout(layoutType, animate = true) {
        if (this.layoutTypes[layoutType] || Object.values(this.layoutTypes).includes(layoutType)) {
            this.currentLayout = layoutType;
            this.applyLayout(animate);
            return true;
        }
        return false;
    }
    
    /**
     * Get node data by id
     * @param {string} id - Node ID
     * @returns {Object} - Node data object or null
     */
    getNodeData(id) {
        if (!window.nodes) return null;
        return window.nodes.find(node => node.id === id);
    }
    
    /**
     * Apply hierarchical layout
     * @param {boolean} animate - Whether to animate the transition
     */
    applyHierarchicalLayout(animate = true) {
        if (!window.nodes || !this.nodeManager) return;
        
        const config = this.config.hierarchical;
        const nodesByLevel = {};
        
        // Group nodes by level
        window.nodes.forEach(nodeData => {
            if (!nodesByLevel[nodeData.level]) {
                nodesByLevel[nodeData.level] = [];
            }
            nodesByLevel[nodeData.level].push(nodeData);
        });
        
        // Calculate horizontal positions for each level
        const levels = Object.keys(nodesByLevel).sort((a, b) => a - b);
        
        levels.forEach(level => {
            const nodesInLevel = nodesByLevel[level];
            const levelWidth = nodesInLevel.length * config.nodeSpacing;
            const startX = -levelWidth / 2;
            
            nodesInLevel.forEach((nodeData, index) => {
                const node = this.nodeManager.getNode(nodeData.id);
                if (!node) return;
                
                const targetX = startX + index * config.nodeSpacing;
                let targetY;
                
                if (config.direction === 'UD') {
                    targetY = level * config.levelSeparation - (levels.length * config.levelSeparation) / 2;
                } else {
                    // Left to right layout - swap x and y
                    const temp = targetX;
                    targetY = -targetX;
                    targetX = level * config.levelSeparation - (levels.length * config.levelSeparation) / 2;
                }
                
                // Apply position
                if (animate) {
                    this.animateNodePosition(node, targetX, targetY, node.position.z);
                } else {
                    node.position.set(targetX, targetY, node.position.z);
                    
                    // Update label position
                    if (this.nodeManager.labelObjects && this.nodeManager.labelObjects[nodeData.id]) {
                        const label = this.nodeManager.labelObjects[nodeData.id];
                        label.position.set(
                            targetX,
                            targetY + node.geometry.parameters.radius + 5,
                            node.position.z
                        );
                    }
                }
            });
        });
    }
    
    /**
     * Apply radial layout
     * @param {boolean} animate - Whether to animate the transition
     */
    applyRadialLayout(animate = true) {
        if (!window.nodes || !this.nodeManager) return;
        
        const config = this.config.radial;
        const nodesByLevel = {};
        
        // Find center node
        const centerNodeData = this.getNodeData(config.centerNode) || window.nodes[0];
        const centerNode = this.nodeManager.getNode(centerNodeData.id);
        
        if (!centerNode) return;
        
        // Place center node at origin
        if (animate) {
            this.animateNodePosition(centerNode, 0, 0, 0);
        } else {
            centerNode.position.set(0, 0, 0);
            
            // Update label position
            if (this.nodeManager.labelObjects && this.nodeManager.labelObjects[centerNodeData.id]) {
                const label = this.nodeManager.labelObjects[centerNodeData.id];
                label.position.set(
                    0,
                    centerNode.geometry.parameters.radius + 5,
                    0
                );
            }
        }
        
        // Group other nodes by their distance from center (using level as proxy)
        window.nodes.forEach(nodeData => {
            if (nodeData.id === centerNodeData.id) return; // Skip center node
            
            if (!nodesByLevel[nodeData.level]) {
                nodesByLevel[nodeData.level] = [];
            }
            nodesByLevel[nodeData.level].push(nodeData);
        });
        
        // Position nodes in concentric circles based on level
        const levels = Object.keys(nodesByLevel).sort((a, b) => a - b);
        
        levels.forEach(level => {
            const nodesInLevel = nodesByLevel[level];
            const radius = level * config.radiusStep;
            
            nodesInLevel.forEach((nodeData, index) => {
                const node = this.nodeManager.getNode(nodeData.id);
                if (!node) return;
                
                // Calculate angle based on position in level
                const angle = (index / nodesInLevel.length) * config.angleSpread;
                
                // Calculate position based on angle and radius
                const targetX = radius * Math.cos(angle);
                const targetZ = radius * Math.sin(angle);
                const targetY = 0; // Keep all nodes on same Y plane for this layout
                
                // Apply position
                if (animate) {
                    this.animateNodePosition(node, targetX, targetY, targetZ);
                } else {
                    node.position.set(targetX, targetY, targetZ);
                    
                    // Update label position
                    if (this.nodeManager.labelObjects && this.nodeManager.labelObjects[nodeData.id]) {
                        const label = this.nodeManager.labelObjects[nodeData.id];
                        label.position.set(
                            targetX,
                            targetY + node.geometry.parameters.radius + 5,
                            targetZ
                        );
                    }
                }
            });
        });
    }
    
    /**
     * Apply concentric layout
     * @param {boolean} animate - Whether to animate the transition
     */
    applyConcentricLayout(animate = true) {
        if (!window.nodes || !this.nodeManager) return;
        
        const config = this.config.concentric;
        const nodesByLevel = {};
        
        // Group nodes by level
        window.nodes.forEach(nodeData => {
            if (!nodesByLevel[nodeData.level]) {
                nodesByLevel[nodeData.level] = [];
            }
            nodesByLevel[nodeData.level].push(nodeData);
        });
        
        // Place nodes in concentric circles
        const levels = Object.keys(nodesByLevel).sort((a, b) => a - b);
        
        levels.forEach(level => {
            const nodesInLevel = nodesByLevel[level];
            const radius = config.initialRadius + (level - 1) * config.radiusStep;
            
            nodesInLevel.forEach((nodeData, index) => {
                const node = this.nodeManager.getNode(nodeData.id);
                if (!node) return;
                
                // Calculate angle based on position in level
                const angle = (index / nodesInLevel.length) * 2 * Math.PI;
                
                // Calculate position based on angle and radius
                const targetX = config.centerX + radius * Math.cos(angle);
                const targetY = config.centerY + radius * Math.sin(angle);
                
                // Apply position
                if (animate) {
                    this.animateNodePosition(node, targetX, targetY, 0);
                } else {
                    node.position.set(targetX, targetY, 0);
                    
                    // Update label position
                    if (this.nodeManager.labelObjects && this.nodeManager.labelObjects[nodeData.id]) {
                        const label = this.nodeManager.labelObjects[nodeData.id];
                        label.position.set(
                            targetX,
                            targetY + node.geometry.parameters.radius + 5,
                            0
                        );
                    }
                }
            });
        });
    }
    
    /**
     * Apply clustered layout
     * @param {boolean} animate - Whether to animate the transition
     */
    applyClusteredLayout(animate = true) {
        if (!window.nodes || !this.nodeManager) return;
        
        const config = this.config.clustered;
        const clusters = {};
        
        // Group nodes by cluster property
        window.nodes.forEach(nodeData => {
            let clusterKey;
            
            switch (config.clusterBy) {
                case 'type':
                    clusterKey = nodeData.type || 'Unknown';
                    break;
                case 'tags':
                    // Use first tag as cluster key
                    clusterKey = (nodeData.tags && nodeData.tags.length) ? 
                        nodeData.tags[0] : 'Untagged';
                    break;
                case 'level':
                    clusterKey = `Level ${nodeData.level}`;
                    break;
                default:
                    clusterKey = 'Default';
            }
            
            if (!clusters[clusterKey]) {
                clusters[clusterKey] = [];
            }
            clusters[clusterKey].push(nodeData);
        });
        
        // Calculate cluster centers
        const clusterKeys = Object.keys(clusters);
        const clusterPositions = {};
        
        clusterKeys.forEach((key, index) => {
            // Position clusters in a circle
            const angle = (index / clusterKeys.length) * 2 * Math.PI;
            clusterPositions[key] = {
                x: config.clusterDistance * Math.cos(angle),
                y: config.clusterDistance * Math.sin(angle),
                z: 0
            };
        });
        
        // Position nodes within clusters
        clusterKeys.forEach(key => {
            const nodesInCluster = clusters[key];
            const clusterPos = clusterPositions[key];
            
            // Calculate grid dimensions for the cluster
            const nodesCount = nodesInCluster.length;
            const gridSize = Math.ceil(Math.sqrt(nodesCount));
            const spacing = 20;
            
            nodesInCluster.forEach((nodeData, index) => {
                const node = this.nodeManager.getNode(nodeData.id);
                if (!node) return;
                
                // Calculate grid position
                const row = Math.floor(index / gridSize);
                const col = index % gridSize;
                
                // Calculate final position
                const targetX = clusterPos.x + (col - gridSize/2) * spacing;
                const targetY = clusterPos.y + (row - gridSize/2) * spacing;
                const targetZ = clusterPos.z;
                
                // Apply position
                if (animate) {
                    this.animateNodePosition(node, targetX, targetY, targetZ);
                } else {
                    node.position.set(targetX, targetY, targetZ);
                    
                    // Update label position
                    if (this.nodeManager.labelObjects && this.nodeManager.labelObjects[nodeData.id]) {
                        const label = this.nodeManager.labelObjects[nodeData.id];
                        label.position.set(
                            targetX,
                            targetY + node.geometry.parameters.radius + 5,
                            targetZ
                        );
                    }
                }
            });
        });
    }
    
    /**
     * Animate a node to a new position
     * @param {Object} node - THREE.js node object
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @param {number} targetZ - Target Z position
     */
    animateNodePosition(node, targetX, targetY, targetZ) {
        if (!node) return;
        
        // Store original positions
        const startPos = {
            x: node.position.x,
            y: node.position.y,
            z: node.position.z
        };
        
        const targetPos = { x: targetX, y: targetY, z: targetZ };
        
        // Animation settings
        const duration = 1000; // ms
        const startTime = Date.now();
        
        // Create animation
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Apply easing function for smooth animation
            const easedProgress = this.easeInOutCubic(progress);
            
            // Calculate new position
            const newX = startPos.x + (targetPos.x - startPos.x) * easedProgress;
            const newY = startPos.y + (targetPos.y - startPos.y) * easedProgress;
            const newZ = startPos.z + (targetPos.z - startPos.z) * easedProgress;
            
            // Update node position
            node.position.set(newX, newY, newZ);
            
            // Update label position
            if (this.nodeManager.labelObjects && this.nodeManager.labelObjects[node.userData.id]) {
                const label = this.nodeManager.labelObjects[node.userData.id];
                label.position.set(
                    newX,
                    newY + node.geometry.parameters.radius + 5,
                    newZ
                );
            }
            
            // Continue animation if not complete
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Ensure final position is exact
                node.position.set(targetPos.x, targetPos.y, targetPos.z);
                
                // Update edge positions
                if (this.edgeManager) {
                    this.edgeManager.updateEdgePositions();
                }
            }
        };
        
        // Start animation
        animate();
    }
    
    /**
     * Easing function for smooth animations
     * @param {number} t - Progress (0-1)
     * @returns {number} - Eased value
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    /**
     * Set configuration for a specific layout
     * @param {string} layoutType - Layout type
     * @param {Object} config - Configuration object
     */
    setLayoutConfig(layoutType, config) {
        if (this.config[layoutType]) {
            this.config[layoutType] = { ...this.config[layoutType], ...config };
            
            // Apply immediately if current layout
            if (this.currentLayout === layoutType) {
                this.applyLayout(true);
            }
            
            return true;
        }
        return false;
    }
}

// Make available in module and global contexts
if (typeof module !== 'undefined') {
    module.exports = LayoutManager;
} else {
    window.LayoutManager = LayoutManager;
}