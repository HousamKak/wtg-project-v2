/**
 * ForceSimulation.js
 * Manages the force-directed layout for the graph
 */
class ForceSimulation {
    constructor(graphManager, nodeManager, edgeManager) {
        this.graphManager = graphManager;
        this.nodeManager = nodeManager;
        this.edgeManager = edgeManager;
        
        // State variables
        this.useForces = true;
        this.isSimulating = false;
        this.is2DMode = false;
        
        // Performance parameters
        this.dampingFactor = 0.03; // Controls how quickly nodes move
        this.repulsionStrength = 30; // Controls how strongly nodes repel each other
        this.attractionStrength = 0.01; // Controls how strongly connected nodes attract
        this.levelConstraintStrength = 0.01; // Controls how strongly nodes are pulled to their level
    }
    
    /**
     * Start the force simulation
     */
    start() {
        if (this.isSimulating) return;
        
        this.isSimulating = true;
        this.simulateStep();
    }
    
    /**
     * Stop the force simulation
     */
    stop() {
        this.isSimulating = false;
    }
    
    /**
     * Toggle forces on/off
     * @returns {boolean} - New state of forces
     */
    toggleForces() {
        this.useForces = !this.useForces;
        
        if (this.useForces && !this.isSimulating) {
            this.start();
        }
        
        return this.useForces;
    }
    
    /**
     * Set whether in 2D mode
     * @param {boolean} is2D - Whether in 2D mode
     */
    setDimensionMode(is2D) {
        this.is2DMode = is2D;
    }
    
    /**
     * Single simulation step
     */
    simulateStep() {
        if (!this.isSimulating || !this.useForces) {
            return;
        }

        // Get current edge data
        const edges = this.edgeManager.getEdgeData();
        
        // Track total movement to detect stability
        let totalMovement = this.nodeManager.updatePositionsWithForces(edges, this.is2DMode);
        
        // Update edge positions to match nodes
        this.edgeManager.updateEdgePositions();
        
        // Adaptive simulation - slow down when stable
        if (!this.stabilityCounter) this.stabilityCounter = 0;
        if (totalMovement < 0.5) {
            this.stabilityCounter++;
            if (this.stabilityCounter > 30) {
                // Reduce simulation frequency when stable
                setTimeout(() => this.simulateStep(), 500);
                return;
            }
        } else {
            this.stabilityCounter = 0;
        }
        
        // Continue simulation
        requestAnimationFrame(() => this.simulateStep());
    }
    
    /**
     * Set minimum node distance
     * @param {number} distance - Minimum distance between nodes
     */
    setMinNodeDistance(distance) {
        this.nodeManager.setMinNodeDistance(distance);
    }
    
    /**
     * Set damping factor (controls speed of movement)
     * @param {number} factor - Damping factor (0-1)
     */
    setDampingFactor(factor) {
        this.dampingFactor = Math.max(0.01, Math.min(0.1, factor));
    }
    
    /**
     * Set repulsion strength
     * @param {number} strength - Repulsion strength
     */
    setRepulsionStrength(strength) {
        this.repulsionStrength = strength;
    }
    
    /**
     * Set attraction strength
     * @param {number} strength - Attraction strength
     */
    setAttractionStrength(strength) {
        this.attractionStrength = strength;
    }
    
    /**
     * Set level constraint strength
     * @param {number} strength - Level constraint strength
     */
    setLevelConstraintStrength(strength) {
        this.levelConstraintStrength = strength;
    }
    
    /**
     * Check if simulation is active
     * @returns {boolean} - Whether simulation is active
     */
    isActive() {
        return this.isSimulating && this.useForces;
    }
}

// Make available in module and global contexts
if (typeof module !== 'undefined') {
    module.exports = ForceSimulation;
} else {
    window.ForceSimulation = ForceSimulation;
}