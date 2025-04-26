/**
 * GraphManager.js
 * Main manager for the 3D graph visualization
 * Responsible for setting up the THREE.js scene, camera, and renderer
 */
class GraphManager {
    constructor() {
        // Core properties
        this.container = document.getElementById('graph-container');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // State variables
        this.is2DMode = false;
        this.is3DTransitioning = false;
        this.originalPositions = {}; // For reverting from 2D to 3D
        
        // Store references to other managers
        this.nodeManager = null;
        this.edgeManager = null;
        this.selectionManager = null;
        
        // Initialize
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.initLights();
        this.setupResizeHandler();
    }
    
    /**
     * Initialize the THREE.js scene
     */
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
    }
    
    /**
     * Initialize the camera
     */
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, // Field of view
            this.container.clientWidth / this.container.clientHeight, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        this.camera.position.z = 300;
    }
    
    /**
     * Initialize the renderer
     */
    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);
    }
    
    /**
     * Initialize scene lights
     */
    initLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1).normalize();
        this.scene.add(directionalLight);
        
        // Point light
        const pointLight = new THREE.PointLight(0xffffff, 1, 500);
        pointLight.position.set(0, 0, 100);
        this.scene.add(pointLight);
    }
    
    /**
     * Setup window resize handler
     */
    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });
    }
    
    /**
     * Set references to other managers
     * @param {Object} nodeManager - Node manager instance
     * @param {Object} edgeManager - Edge manager instance
     * @param {Object} selectionManager - Selection manager instance
     * @param {Object} cameraController - Camera controller instance (optional)
     */
    setManagers(nodeManager, edgeManager, selectionManager, cameraController = null) {
        this.nodeManager = nodeManager;
        this.edgeManager = edgeManager;
        this.selectionManager = selectionManager;
        if (cameraController) {
            this.cameraController = cameraController;
        }
    }
    
    /**
     * Add an object to the scene
     * @param {Object} object - THREE.js object to add
     */
    addToScene(object) {
        this.scene.add(object);
    }
    
    /**
     * Remove an object from the scene
     * @param {Object} object - THREE.js object to remove
     */
    removeFromScene(object) {
        this.scene.remove(object);
    }
    
    /**
     * Get objects in the scene
     * @returns {Array} - Array of objects in the scene
     */
    getSceneObjects() {
        return this.scene.children;
    }
    
    /**
     * Get all objects of a specific type from the scene
     * @param {string} type - Type of object to find
     * @returns {Array} - Array of matching objects
     */
    getObjectsByUserDataType(type) {
        return this.scene.children.filter(
            obj => obj.userData && obj.userData.type === type
        );
    }
    
    /**
     * Toggle between 2D and 3D views
     */
    toggleDimension() {
        this.is2DMode = !this.is2DMode;
        this.is3DTransitioning = true;
        
        if (this.is2DMode) {
            // Store original positions for reverting later
            if (this.nodeManager) {
                const nodePositions = this.nodeManager.getNodePositions();
                for (const id in nodePositions) {
                    this.originalPositions[id] = nodePositions[id].clone();
                }
                
                // Animate to 2D
                this.animateTo2D();
            }
        } else {
            // Animate back to 3D
            this.animateTo3D();
        }
    }
    
    /**
     * Animate from 3D to 2D view
     */
    animateTo2D() {
        const frames = 30;
        let frame = 0;
        
        const animate = () => {
            if (frame < frames) {
                const progress = frame / frames;
                
                // Update node positions
                if (this.nodeManager) {
                    this.nodeManager.flattenNodes(progress);
                }
                
                // Update edge positions
                if (this.edgeManager) {
                    this.edgeManager.updateEdgePositions();
                }
                
                frame++;
                requestAnimationFrame(animate);
            } else {
                this.is3DTransitioning = false;
            }
        };
        
        animate();
    }
    
    /**
     * Animate from 2D to 3D view
     */
    animateTo3D() {
        const frames = 30;
        let frame = 0;
        
        const animate = () => {
            if (frame < frames) {
                const progress = frame / frames;
                
                // Update node positions
                if (this.nodeManager) {
                    this.nodeManager.unflattenNodes(progress, this.originalPositions);
                }
                
                // Update edge positions
                if (this.edgeManager) {
                    this.edgeManager.updateEdgePositions();
                }
                
                frame++;
                requestAnimationFrame(animate);
            } else {
                this.is3DTransitioning = false;
            }
        };
        
        animate();
    }
    
    /**
     * Reset camera view to default position
     */
    resetView() {
        const targetPosition = new THREE.Vector3(0, 0, 300);
        const startPosition = this.camera.position.clone();
        const frames = 30;
        let frame = 0;
        
        const animate = () => {
            if (frame < frames) {
                const progress = frame / frames;
                const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
                
                this.camera.position.lerpVectors(startPosition, targetPosition, ease);
                this.camera.lookAt(0, 0, 0);
                
                frame++;
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    /**
     * Focus camera on a specific position
     * @param {Object} position - THREE.js Vector3 position
     */
    focusCameraOn(position) {
        // Calculate where to place camera
        const offset = new THREE.Vector3(0, 0, 50); // Offset from target
        const targetPos = new THREE.Vector3().copy(position).add(offset);
        
        // Animate camera movement
        const currentPos = this.camera.position.clone();
        const frames = 30;
        let frame = 0;
        
        const animateCamera = () => {
            if (frame < frames) {
                // Calculate position for this frame
                const t = frame / frames; // 0 to 1
                
                // Ease in-out function
                const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                
                // Update camera position
                this.camera.position.lerpVectors(currentPos, targetPos, ease);
                
                // Look at the target
                this.camera.lookAt(position);
                
                frame++;
                requestAnimationFrame(animateCamera);
            }
        };
        
        animateCamera();
    }
    
    /**
     * Log the current status of the scene
     */
    logSceneStatus() {
        console.group('Scene Status Check');
        try {
            const total = this.scene.children.length;
            console.log(`Total scene objects: ${total}`);

            const nodeCount = this.scene.children.filter(obj => obj.userData && obj.userData.type === 'node').length;
            const edgeCount = this.scene.children.filter(obj => obj.type === 'Line').length;
            const labelCount = this.scene.children.filter(obj => obj.userData && obj.userData.type === 'label').length;
            const lightCount = this.scene.children.filter(obj => obj.type.includes('Light')).length;

            console.log('Object counts by type:', {
                nodes: nodeCount,
                edges: edgeCount,
                labels: labelCount,
                lights: lightCount,
                other: total - nodeCount - edgeCount - labelCount - lightCount
            });

            const invisibleNodes = this.scene.children.filter(obj => obj.userData && obj.userData.type === 'node' && (obj.visible === false || obj.material.opacity === 0)).length;
            if (invisibleNodes > 0) {
                console.warn(`Warning: ${invisibleNodes} nodes are invisible!`);
            }

            const nodeSample = this.scene.children.filter(obj => obj.userData && obj.userData.type === 'node').slice(0, 3);
            nodeSample.forEach((node, i) => {
                console.log(`Node sample ${i}:`, {
                    id: node.userData.id,
                    position: node.position.toArray(),
                    visible: node.visible,
                    opacity: node.material ? node.material.opacity : 'N/A',
                    scale: node.scale.toArray()
                });
            });
        } catch (error) {
            console.error('Error during scene status logging:', error);
        }
        console.groupEnd();
    }

    /**
     * Start the animation loop
     * @param {boolean} enableRotation - Whether to enable automatic rotation
     */
    startAnimation(enableRotation = false) {
        const rotationSpeed = 0.005;
        let frameCounter = 0;

        // Track frame errors to prevent crashing
        let consecutiveErrors = 0;

        // If initial rotation is enabled, update the cameraController
        if (this.cameraController && enableRotation) {
            this.cameraController.setAutoRotation(true);
        }

        // Main animation loop with error boundary
        const animate = () => {
            frameCounter++;
            if (frameCounter % 300 === 0) {
                console.log(`Animation frame ${frameCounter} - Performing routine scene check`);
                this.logSceneStatus();
            }

            try {
                // Perform auto-rotation if enabled in the camera controller
                if (this.cameraController && this.cameraController.autoRotate && 
                    !this.is2DMode && !this.is3DTransitioning) {
                    this.cameraController.performAutoRotation();
                }

                // Render the scene
                this.renderer.render(this.scene, this.camera);

                // Reset error counter on successful frame
                consecutiveErrors = 0;
            } catch (error) {
                consecutiveErrors++;
                console.error('Render error:', error);

                // If too many consecutive errors, slow down or pause animation
                if (consecutiveErrors > 5) {
                    console.warn('Multiple render errors detected, slowing animation');
                    setTimeout(() => requestAnimationFrame(animate), 1000);
                    return;
                }
            }

            // Continue animation
            requestAnimationFrame(animate);
        };

        // Start animation
        animate();
    }
    
    /**
     * Rotate camera around y-axis
     * @param {number} angle - Angle to rotate by
     */
    rotateCamera(angle) {
        // Rotate around y-axis
        const x = this.camera.position.x;
        const z = this.camera.position.z;
        
        this.camera.position.x = x * Math.cos(angle) - z * Math.sin(angle);
        this.camera.position.z = x * Math.sin(angle) + z * Math.cos(angle);
        
        this.camera.lookAt(0, 0, 0);
    }
    
    /**
     * Get the raycaster for interaction
     * @param {Object} mouse - Mouse coordinates (x, y) in normalized device coordinates
     * @returns {Object} - THREE.js Raycaster
     */
    getRaycaster(mouse) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        return raycaster;
    }
    
    /**
     * Perform hit testing on scene objects
     * @param {Object} mouse - Mouse coordinates (x, y) in normalized device coordinates
     * @returns {Array} - Array of intersected objects
     */
    getIntersectedObjects(mouse) {
        const raycaster = this.getRaycaster(mouse);
        return raycaster.intersectObjects(this.scene.children);
    }
}

// Make available in module and global contexts
if (typeof module !== 'undefined') {
    module.exports = GraphManager;
} else {
    window.GraphManager = GraphManager;
}