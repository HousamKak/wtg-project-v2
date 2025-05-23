/**
 * ThemeManager.js
 * Manages colors and visual themes for the graph
 */
class ThemeManager {
    constructor() {
        // Default colors for node types
        this.nodeColors = {
            'Axiom': 0xD32F2F,       // Bright red
            'Definition': 0x1976D2,   // Bright blue
            'Lemma': 0x388E3C,        // Bright green
            'Theorem': 0x7B1FA2,      // Bright purple
            'Corollary': 0xF57C00     // Bright orange
        };
        
        // Default color for unknown node types
        this.defaultNodeColor = 0x607D8B; // Gray
        
        // Colors for edge types
        this.edgeColors = {
            'depends_on': 0x42A5F5,    // Light blue
            'proves': 0x66BB6A,         // Light green
            'generalizes': 0xFF7043     // Light orange
        };
        
        // Default color for unknown edge types
        this.defaultEdgeColor = 0xBDBDBD; // Light gray
        
        // Node material properties - FIXED: Added complete set of properties
        this.nodeMaterialProps = {
            emissiveIntensity: 0.4,
            shininess: 60,
            opacity: 0.85,
            transparent: true,
            depthWrite: true,
            side: THREE.FrontSide,
            flatShading: false
        };
        
        // Selected node material properties
        this.selectedNodeMaterialProps = {
            emissiveIntensity: 0.8,
            opacity: 1.0,
            transparent: true,
            shininess: 70
        };
        
        // Related node material properties
        this.relatedNodeMaterialProps = {
            emissiveIntensity: 0.6,
            opacity: 0.95,
            transparent: true,
            shininess: 65
        };
        
        // Edge material properties
        this.edgeMaterialProps = {
            opacity: 0.6,
            transparent: true,
            linewidth: 2
        };
        
        // Selected edge material properties
        this.selectedEdgeMaterialProps = {
            opacity: 1.0,
            transparent: true,
            linewidth: 2.5
        };

        // Material caches
        this.nodeMaterials = {}; // Cache for node materials
        this.edgeMaterials = {}; // Cache for edge materials
    }

    /**
     * Get or create a node material with caching
     * @param {string} type - The node type
     * @param {string} state - The node state
     * @returns {THREE.MeshPhongMaterial} - Cached or new material
     */
    getNodeMaterial(type, state = 'default') {
        const key = `${type}-${state}`;
        if (!this.nodeMaterials[key]) {
            const materialProps = this.createNodeMaterial(type, state);
            this.nodeMaterials[key] = new THREE.MeshPhongMaterial(materialProps);
        }
        return this.nodeMaterials[key].clone(); // Return a clone to avoid shared state
    }

    /**
     * Get or create an edge material with caching
     * @param {string} type - The edge type
     * @param {string} state - The edge state
     * @returns {THREE.LineBasicMaterial} - Cached or new material
     */
    getEdgeMaterial(type, state = 'default') {
        const key = `${type}-${state}`;
        if (!this.edgeMaterials[key]) {
            const materialProps = this.createEdgeMaterial(type, state);
            this.edgeMaterials[key] = new THREE.LineBasicMaterial(materialProps);
        }
        return this.edgeMaterials[key].clone(); // Return a clone to avoid shared state
    }

    /**
     * Dispose of all cached materials
     */
    disposeMaterials() {
        for (const key in this.nodeMaterials) {
            this.nodeMaterials[key].dispose();
        }
        for (const key in this.edgeMaterials) {
            this.edgeMaterials[key].dispose();
        }
        this.nodeMaterials = {};
        this.edgeMaterials = {};
    }
    
    /**
     * Get color for a node based on its type
     * @param {string} type - The node type
     * @returns {number} - Hexadecimal color value
     */
    getNodeColor(type) {
        return this.nodeColors[type] || this.defaultNodeColor;
    }
    
    /**
     * Get color for an edge based on its type
     * @param {string} type - The edge type
     * @returns {number} - Hexadecimal color value
     */
    getEdgeColor(type) {
        return this.edgeColors[type] || this.defaultEdgeColor;
    }
    
    /**
     * Get node material properties based on state
     * @param {string} state - The node state ('default', 'selected', 'related')
     * @returns {Object} - Material properties
     */
    getNodeMaterialProps(state = 'default') {
        // Start with base properties
        const baseProps = JSON.parse(JSON.stringify(this.nodeMaterialProps));
        
        // Merge with state-specific properties
        let stateProps = {};
        switch (state) {
            case 'selected':
                stateProps = this.selectedNodeMaterialProps;
                break;
            case 'related':
                stateProps = this.relatedNodeMaterialProps;
                break;
            default:
                // Use base properties
                break;
        }
        
        // Merge properties, ensuring all required properties exist
        return { ...baseProps, ...stateProps };
    }
    
    /**
     * Get edge material properties based on state
     * @param {string} state - The edge state ('default', 'selected')
     * @returns {Object} - Material properties
     */
    getEdgeMaterialProps(state = 'default') {
        // Start with base properties
        const baseProps = JSON.parse(JSON.stringify(this.edgeMaterialProps));
        
        // Merge with state-specific properties
        if (state === 'selected') {
            return { ...baseProps, ...this.selectedEdgeMaterialProps };
        }
        
        return baseProps;
    }
    
    /**
     * Create a node material with the appropriate color and properties
     * @param {string} type - The node type
     * @param {string} state - The node state
     * @returns {Object} - THREE.js material properties
     */
    createNodeMaterial(type, state = 'default') {
        const color = this.getNodeColor(type);
        const props = this.getNodeMaterialProps(state);
        
        // Return complete configuration object
        return {
            color: color,
            emissive: color,
            emissiveIntensity: props.emissiveIntensity,
            shininess: props.shininess,
            transparent: props.transparent,
            opacity: props.opacity,
            depthWrite: props.depthWrite,
            side: props.side,
            flatShading: props.flatShading
        };
    }
    
    /**
     * Create an edge material with the appropriate color and properties
     * @param {string} type - The edge type
     * @param {string} state - The edge state
     * @returns {Object} - THREE.js material properties
     */
    createEdgeMaterial(type, state = 'default') {
        const color = this.getEdgeColor(type);
        const props = this.getEdgeMaterialProps(state);
        
        // Return complete configuration object
        return {
            color: color,
            transparent: props.transparent,
            opacity: props.opacity,
            linewidth: props.linewidth
        };
    }
    
    /**
     * Update an existing material with new properties
     * @param {THREE.Material} material - The material to update
     * @param {Object} props - New properties to apply
     */
    updateMaterial(material, props) {
        if (!material) return;
        
        // Apply each property carefully
        for (const prop in props) {
            if (props.hasOwnProperty(prop) && material.hasOwnProperty(prop)) {
                material[prop] = props[prop];
            }
        }
        
        // Ensure needed flags are set
        material.needsUpdate = true;
    }
}

// Create a singleton instance
const themeManager = new ThemeManager();

// Make available in module and global contexts
if (typeof module !== 'undefined') {
    module.exports = themeManager;
} else {
    window.themeManager = themeManager;
}