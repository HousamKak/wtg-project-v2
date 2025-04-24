/**
 * SearchManager.js
 * Manages search functionality for theorems and concepts
 */
class SearchManager {
    constructor(graphManager, nodeManager, selectionManager) {
        this.graphManager = graphManager;
        this.nodeManager = nodeManager;
        this.selectionManager = selectionManager;
        
        // DOM elements
        this.searchInput = document.getElementById('search-input');
        
        // Node data
        this.nodesData = window.nodes || [];
        
        // Initialize search
        this.initSearch();
    }
    
    /**
     * Initialize search functionality
     */
    initSearch() {
        if (!this.searchInput) return;
        
        // Add input event listener
        this.searchInput.addEventListener('input', this.handleSearchInput.bind(this));
        
        // Add keydown event for Enter key
        this.searchInput.addEventListener('keydown', this.handleSearchKeydown.bind(this));
    }
    
    /**
     * Handle search input events
     * @param {Event} event - Input event
     */
    handleSearchInput(event) {
        const query = event.target.value.trim().toLowerCase();
        
        // If query is empty, clear any highlighting
        if (!query) {
            this.clearSearchHighlighting();
            return;
        }
        
        // Highlight matching nodes
        this.highlightMatchingNodes(query);
    }
    
    /**
     * Handle search keydown events
     * @param {KeyboardEvent} event - Keydown event
     */
    handleSearchKeydown(event) {
        // If Enter key is pressed, select the first matching node
        if (event.key === 'Enter') {
            const query = this.searchInput.value.trim().toLowerCase();
            if (query) {
                const matchingNodes = this.getMatchingNodes(query);
                if (matchingNodes.length > 0) {
                    // Select the first matching node
                    this.selectionManager.selectNode(matchingNodes[0].id);
                    
                    // Clear the search input
                    this.searchInput.value = '';
                    this.clearSearchHighlighting();
                }
            }
        }
    }
    
    /**
     * Get matching nodes for a search query
     * @param {string} query - Search query
     * @returns {Array} - Array of matching node data objects
     */
    getMatchingNodes(query) {
        return this.nodesData.filter(node => {
            // Search in label
            if (node.label.toLowerCase().includes(query)) {
                return true;
            }
            
            // Search in description
            if (node.description && node.description.toLowerCase().includes(query)) {
                return true;
            }
            
            // Search in tags
            if (node.tags && node.tags.some(tag => tag.toLowerCase().includes(query))) {
                return true;
            }
            
            return false;
        });
    }
    
    /**
     * Highlight nodes that match the search query
     * @param {string} query - Search query
     */
    highlightMatchingNodes(query) {
        // Get matching nodes
        const matchingNodes = this.getMatchingNodes(query);
        
        // Reset all nodes to default state
        const nodeObjects = this.nodeManager.getAllNodes();
        for (const id in nodeObjects) {
            const node = nodeObjects[id];
            node.material.opacity = 0.3; // Dim all nodes
        }
        
        // Highlight matching nodes
        matchingNodes.forEach(nodeData => {
            const node = this.nodeManager.getNode(nodeData.id);
            if (node) {
                node.material.opacity = 1.0; // Make matching nodes fully opaque
            }
        });
        
        // Create and show search results dropdown if needed
        this.showSearchResultsDropdown(matchingNodes);
    }
    
    /**
     * Clear search highlighting
     */
    clearSearchHighlighting() {
        // Reset all nodes to default state
        const nodeObjects = this.nodeManager.getAllNodes();
        for (const id in nodeObjects) {
            const node = nodeObjects[id];
            node.material.opacity = 0.85; // Reset to default opacity
        }
        
        // Remove any dropdown
        this.removeSearchResultsDropdown();
    }
    
    /**
     * Show search results in a dropdown
     * @param {Array} results - Array of matching node data objects
     */
    showSearchResultsDropdown(results) {
        // Remove any existing dropdown
        this.removeSearchResultsDropdown();
        
        // If no results or too many, don't show dropdown
        if (!results.length || results.length > 10) return;
        
        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.id = 'search-results-dropdown';
        dropdown.style.position = 'absolute';
        dropdown.style.top = `${this.searchInput.offsetTop + this.searchInput.offsetHeight}px`;
        dropdown.style.left = `${this.searchInput.offsetLeft}px`;
        dropdown.style.width = `${this.searchInput.offsetWidth}px`;
        dropdown.style.maxHeight = '300px';
        dropdown.style.overflowY = 'auto';
        dropdown.style.backgroundColor = 'rgba(20, 20, 25, 0.95)';
        dropdown.style.color = 'white';
        dropdown.style.borderRadius = '0 0 5px 5px';
        dropdown.style.zIndex = '100';
        dropdown.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        
        // Add results to dropdown
        results.forEach(node => {
            const item = document.createElement('div');
            item.style.padding = '10px 15px';
            item.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
            item.style.cursor = 'pointer';
            
            // Highlight node type with color
            const typeSpan = document.createElement('span');
            typeSpan.style.display = 'inline-block';
            typeSpan.style.width = '12px';
            typeSpan.style.height = '12px';
            typeSpan.style.borderRadius = '50%';
            typeSpan.style.marginRight = '8px';
            
            // Set color based on node type
            switch (node.type) {
                case 'Axiom':
                    typeSpan.style.backgroundColor = '#D32F2F';
                    break;
                case 'Definition':
                    typeSpan.style.backgroundColor = '#1976D2';
                    break;
                case 'Lemma':
                    typeSpan.style.backgroundColor = '#388E3C';
                    break;
                case 'Theorem':
                    typeSpan.style.backgroundColor = '#7B1FA2';
                    break;
                case 'Corollary':
                    typeSpan.style.backgroundColor = '#F57C00';
                    break;
                default:
                    typeSpan.style.backgroundColor = '#607D8B';
            }
            
            item.appendChild(typeSpan);
            item.appendChild(document.createTextNode(node.label));
            
            // Add hover effect
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = 'rgba(52, 152, 219, 0.3)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'transparent';
            });
            
            // Add click handler
            item.addEventListener('click', () => {
                this.selectionManager.selectNode(node.id);
                this.searchInput.value = '';
                this.clearSearchHighlighting();
            });
            
            dropdown.appendChild(item);
        });
        
        // Add dropdown to page
        document.body.appendChild(dropdown);
        
        // Add event listener to close dropdown when clicking outside
        document.addEventListener('click', this.handleOutsideClick.bind(this));
    }
    
    /**
     * Remove search results dropdown
     */
    removeSearchResultsDropdown() {
        const dropdown = document.getElementById('search-results-dropdown');
        if (dropdown) {
            dropdown.remove();
            
            // Remove outside click handler
            document.removeEventListener('click', this.handleOutsideClick);
        }
    }
    
    /**
     * Handle clicks outside the search area
     * @param {MouseEvent} event - Click event
     */
    handleOutsideClick(event) {
        const dropdown = document.getElementById('search-results-dropdown');
        
        // If clicking outside dropdown and search input, remove dropdown
        if (dropdown && 
            event.target !== dropdown && 
            !dropdown.contains(event.target) &&
            event.target !== this.searchInput) {
            this.removeSearchResultsDropdown();
        }
    }
    
    /**
     * Search for a specific term and select the first result
     * @param {string} term - Search term
     * @returns {boolean} - Whether a match was found
     */
    searchAndSelect(term) {
        if (!term) return false;
        
        const query = term.trim().toLowerCase();
        const matchingNodes = this.getMatchingNodes(query);
        
        if (matchingNodes.length > 0) {
            // Select the first matching node
            this.selectionManager.selectNode(matchingNodes[0].id);
            return true;
        }
        
        return false;
    }
}

// Make available in module and global contexts
if (typeof module !== 'undefined') {
    module.exports = SearchManager;
} else {
    window.SearchManager = SearchManager;
}