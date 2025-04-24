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
        
        // Node material properties
        this.nodeMaterialProps = {
            emissiveIntensity: 0.4,
            shininess: 60,
            opacity: 0.85,
            transparent: true
        };
        
        // Selected node material properties
        this.selectedNodeMaterialProps = {
            emissiveIntensity: 0.8,
            opacity: 1.0
        };
        
        // Related node material properties
        this.relatedNodeMaterialProps = {
            emissiveIntensity: 0.6,
            opacity: 0.95
        };
        
        // Edge material properties
        this.edgeMaterialProps = {
            opacity: 0.6,
            transparent: true,
            linewidth: 2
        };
        
        // Selected edge material properties
        this.selectedEdgeMaterialProps = {
            opacity: 1.0
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
        return this.nodeMaterials[key];
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
        return this.edgeMaterials[key];
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
        switch (state) {
            case 'selected':
                return this.selectedNodeMaterialProps;
            case 'related':
                return this.relatedNodeMaterialProps;
            default:
                return this.nodeMaterialProps;
        }
    }
    
    /**
     * Get edge material properties based on state
     * @param {string} state - The edge state ('default', 'selected')
     * @returns {Object} - Material properties
     */
    getEdgeMaterialProps(state = 'default') {
        return state === 'selected' 
            ? this.selectedEdgeMaterialProps 
            : this.edgeMaterialProps;
    }
    
    /**
     * Create a node material with the appropriate color and properties
     * @param {string} type - The node type
     * @param {string} state - The node state
     * @returns {Object} - THREE.js material
     */
    createNodeMaterial(type, state = 'default') {
        const color = this.getNodeColor(type);
        const props = this.getNodeMaterialProps(state);
        
        // Return configuration object to be used with THREE.MeshPhongMaterial
        return {
            color: color,
            emissive: color,
            emissiveIntensity: props.emissiveIntensity,
            shininess: props.shininess,
            transparent: props.transparent,
            opacity: props.opacity
        };
    }
    
    /**
     * Create an edge material with the appropriate color and properties
     * @param {string} type - The edge type
     * @param {string} state - The edge state
     * @returns {Object} - THREE.js material
     */
    createEdgeMaterial(type, state = 'default') {
        const color = this.getEdgeColor(type);
        const props = this.getEdgeMaterialProps(state);
        
        // Return configuration object to be used with THREE.LineBasicMaterial
        return {
            color: color,
            transparent: props.transparent,
            opacity: props.opacity,
            linewidth: props.linewidth
        };
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