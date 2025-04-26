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
        
        // Anti-drift parameters
        this.centerPullStrength = 0.001; // Strength of pull toward center
        this.maxDistance = 500; // Maximum distance from center
        this.stabilityCounter = 0; // Counter for tracking stability
        
        // Auto-disable parameters
        this.autoDisableTimer = null; // Timer for auto-disabling forces
        this.autoDisableTimeout = 20000; // 20 seconds before auto-disable
    }
    
    /**
     * Start the force simulation
     */
    start() {
        if (this.isSimulating) return;
        
        this.isSimulating = true;
        this.stabilityCounter = 0;
        
        // Set auto-disable timer if forces are enabled
        if (this.useForces) {
            this.resetAutoDisableTimer();
        }
        
        this.simulateStep();
    }
    
    /**
     * Stop the force simulation
     */
    stop() {
        this.isSimulating = false;
        
        // Clear auto-disable timer
        if (this.autoDisableTimer) {
            clearTimeout(this.autoDisableTimer);
            this.autoDisableTimer = null;
        }
    }
    
    /**
     * Toggle forces on/off
     * @returns {boolean} - New state of forces
     */
    toggleForces() {
        // Toggle useForces flag
        this.useForces = !this.useForces;
        
        if (this.useForces) {
            // If enabling forces and simulation is not running, start it
            if (!this.isSimulating) {
                this.start();
            }
            
            // Reset stability counter
            this.stabilityCounter = 0;
            
            // Set auto-disable timer
            this.resetAutoDisableTimer();
        } else {
            // Clear auto-disable timer
            if (this.autoDisableTimer) {
                clearTimeout(this.autoDisableTimer);
                this.autoDisableTimer = null;
            }
        }

        console.log(`Forces ${this.useForces ? 'enabled' : 'disabled'}, Simulation running: ${this.isSimulating}`);
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
     * Reset the auto-disable timer
     */
    resetAutoDisableTimer() {
        // Clear existing timer
        if (this.autoDisableTimer) {
            clearTimeout(this.autoDisableTimer);
        }
        
        // Set new timer
        this.autoDisableTimer = setTimeout(() => {
            if (this.useForces) {
                console.log('Auto-disabling forces after timeout');
                this.toggleForces();
                
                // Update button state
                const forcesButton = document.getElementById('toggle-forces');
                if (forcesButton) {
                    forcesButton.classList.remove('active');
                    forcesButton.textContent = 'Enable Forces';
                }
            }
        }, this.autoDisableTimeout);
    }
    
    /**
     * Disable forces after stability is reached
     */
    disableForcesAfterStability() {
        if (this.stabilityCounter > 60 && this.useForces) {
            console.log('Auto-disabling forces after stability');
            this.toggleForces();
            
            // Update button state
            const forcesButton = document.getElementById('toggle-forces');
            if (forcesButton) {
                forcesButton.classList.remove('active');
                forcesButton.textContent = 'Enable Forces';
            }
        }
    }
    
    /**
     * Apply boundaries to prevent nodes from going too far
     */
    applyBoundaries() {
        const maxDist = this.maxDistance;
        const nodeManager = this.nodeManager;
        
        for (const id in nodeManager.nodeObjects) {
            const node = nodeManager.nodeObjects[id];
            const dist = Math.sqrt(
                node.position.x * node.position.x + 
                node.position.y * node.position.y + 
                node.position.z * node.position.z
            );
            
            // If node is too far from center, pull it back
            if (dist > maxDist) {
                const factor = maxDist / dist;
                node.position.x *= factor;
                node.position.y *= factor;
                node.position.z *= factor;
                
                // Update position in nodePositions map
                nodeManager.nodePositions[id] = node.position.clone();
                
                // Update label position
                if (nodeManager.labelObjects[id]) {
                    const label = nodeManager.labelObjects[id];
                    label.position.set(
                        node.position.x,
                        node.position.y + node.userData.size + 5,
                        node.position.z
                    );
                }
            }
        }
    }
    
    /**
     * Single simulation step
     */
    simulateStep() {
        if (!this.isSimulating) {
            return;
        }

        if (!this.useForces) {
            // If forces are disabled but simulation is still running, keep checking
            requestAnimationFrame(() => this.simulateStep());
            return;
        }

        // Get current edge data
        const edges = this.edgeManager.getEdgeData();

        // Track total movement to detect stability
        let totalMovement = this.updatePositionsWithForcesEnhanced(edges, this.is2DMode);
        
        // Apply boundaries to prevent drifting too far
        this.applyBoundaries();

        // Update edge positions to match nodes
        this.edgeManager.updateEdgePositions();

        // Adaptive simulation - slow down when stable
        if (totalMovement < 0.5) {
            this.stabilityCounter++;
            if (this.stabilityCounter > 60) {
                // Auto-disable forces after extensive stability
                this.disableForcesAfterStability();
                
                // Reduce simulation frequency when stable
                setTimeout(() => this.simulateStep(), 500);
                return;
            }
        } else {
            this.stabilityCounter = 0;
            
            // Reset auto-disable timer when there's movement
            this.resetAutoDisableTimer();
        }

        // Continue simulation
        requestAnimationFrame(() => this.simulateStep());
    }
    
    /**
     * Enhanced version of updatePositionsWithForces that includes center pull
     * @param {Array} edges - Edge data
     * @param {boolean} is2DMode - Whether in 2D mode
     * @returns {number} - Total movement
     */
    updatePositionsWithForcesEnhanced(edges, is2DMode) {
        // Get the original node manager's updatePositionsWithForces method
        const nodesWithForces = this.nodeManager.updatePositionsWithForces(edges, is2DMode);
        
        // Apply additional center-pulling force
        for (const id in this.nodeManager.nodeObjects) {
            const node = this.nodeManager.nodeObjects[id];
            
            // Calculate pull toward center
            const dx = 0 - node.position.x;
            const dy = 0 - node.position.y;
            const dz = is2DMode ? 0 : 0 - node.position.z;
            
            // Apply force proportional to distance from center
            node.position.x += dx * this.centerPullStrength;
            node.position.y += dy * this.centerPullStrength;
            if (!is2DMode) node.position.z += dz * this.centerPullStrength;
            
            // Update position in nodePositions map
            this.nodeManager.nodePositions[id] = node.position.clone();
            
            // Update label position
            if (this.nodeManager.labelObjects[id]) {
                const label = this.nodeManager.labelObjects[id];
                label.position.set(
                    node.position.x,
                    node.position.y + node.userData.size + 5,
                    node.position.z
                );
            }
        }
        
        return nodesWithForces;
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
     * Set center pull strength
     * @param {number} strength - Center pull strength
     */
    setCenterPullStrength(strength) {
        this.centerPullStrength = strength;
    }
    
    /**
     * Set maximum distance from center
     * @param {number} distance - Maximum distance
     */
    setMaxDistance(distance) {
        this.maxDistance = distance;
    }
    
    /**
     * Set auto-disable timeout
     * @param {number} timeout - Timeout in milliseconds
     */
    setAutoDisableTimeout(timeout) {
        this.autoDisableTimeout = timeout;
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