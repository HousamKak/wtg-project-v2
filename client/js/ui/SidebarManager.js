/**
 * SidebarManager.js
 * Manages the sidebar that displays theorem details
 */
class SidebarManager {
    constructor(graphManager, nodeManager, edgeManager) {
        this.graphManager = graphManager;
        this.nodeManager = nodeManager;
        this.edgeManager = edgeManager;
        
        // DOM elements
        this.sidebar = document.getElementById('sidebar');
        this.titleElement = document.getElementById('theorem-title');
        this.contentElement = document.getElementById('theorem-content');
        
        // Theorem details data
        this.theoremDetails = window.theoremDetails || {};
        
        // Node data
        this.nodesData = window.nodes || [];
    }
    
    /**
     * Show details for a specific node
     * @param {string} nodeId - Node ID
     */
    showNodeDetails(nodeId) {
        if (!this.sidebar || !this.titleElement || !this.contentElement) return;
        
        // Find node data
        const node = this.nodesData.find(n => n.id === nodeId);
        if (!node) return;
        
        // Get detailed info if available, otherwise use basic node info
        const theorem = this.theoremDetails[nodeId] || {
            title: node.label || 'Unknown',
            node_type: node.type || 'Unknown',
            statement: node.description || 'No statement available.',
            explanation: 'Full details not available yet.',
            prerequisites: 'Not specified.',
            applications: 'Not specified.',
            tags: node.tags || []
        };
        
        // Update sidebar content
        this.titleElement.textContent = theorem.title;
        
        // Build content HTML
        let content = this.buildTheoremContent(theorem, nodeId);
        
        // Update content and show sidebar
        this.contentElement.innerHTML = content;
        this.sidebar.classList.remove('hidden');
    }
    
    /**
     * Build HTML content for theorem details
     * @param {Object} theorem - Theorem details object
     * @param {string} nodeId - Node ID
     * @returns {string} - HTML content
     */
    buildTheoremContent(theorem, nodeId) {
        let content = '';
        
        // Node type
        content += `<div class="node-type">${theorem.node_type}</div>`;
        
        // Tags if available
        if (theorem.tags && theorem.tags.length > 0) {
            content += '<div class="tags">';
            theorem.tags.forEach(tag => {
                content += `<span class="tag">${tag}</span>`;
            });
            content += '</div>';
        }
        
        // Statement
        content += '<div class="theorem-statement">';
        content += '<h3>Statement</h3>';
        content += `<p>${theorem.statement}</p>`;
        content += '</div>';
        
        // LaTeX statement if available
        if (theorem.statement_latex) {
            content += '<div class="latex-statement">';
            content += `<p>LaTeX: <code>${theorem.statement_latex}</code></p>`;
            content += '</div>';
        }
        
        // Explanation
        content += '<h3>Explanation</h3>';
        content += `<p>${theorem.explanation}</p>`;
        
        // Prerequisites
        content += '<h3>Prerequisites</h3>';
        content += `<p>${theorem.prerequisites}</p>`;
        
        // Proof sketch if available
        if (theorem.proof_sketch) {
            content += '<h3>Proof Sketch</h3>';
            content += `<p>${theorem.proof_sketch}</p>`;
        }
        
        // Applications
        content += '<div class="applications">';
        content += '<h3>Applications</h3>';
        content += `<p>${theorem.applications}</p>`;
        content += '</div>';
        
        // Related Papers
        if (theorem.papers && theorem.papers.length > 0) {
            content += '<div class="papers">';
            content += '<h3>Related Papers</h3>';
            content += '<ul>';
            theorem.papers.forEach(paper => {
                content += `<li><a href="#">${paper.title}</a> (${paper.author}, ${paper.year})</li>`;
            });
            content += '</ul>';
            content += '</div>';
        }
        
        // Add relationships section
        content += this.buildRelationshipsSection(nodeId);
        
        return content;
    }
    
    /**
     * Build HTML for relationships section
     * @param {string} nodeId - Node ID
     * @returns {string} - HTML content
     */
    buildRelationshipsSection(nodeId) {
        let content = '<h3>Relationships</h3>';
        
        // Find incoming edges (dependencies)
        const incomingEdges = window.edges.filter(e => e.target === nodeId);
        if (incomingEdges.length > 0) {
            content += '<div><strong>Depends on:</strong> ';
            content += incomingEdges.map(e => {
                const sourceNode = this.nodesData.find(n => n.id === e.source);
                return `<span class="edge-type">${e.type}</span> ${sourceNode ? sourceNode.label : e.source}`;
            }).join(', ');
            content += '</div>';
        }
        
        // Find outgoing edges (uses)
        const outgoingEdges = window.edges.filter(e => e.source === nodeId);
        if (outgoingEdges.length > 0) {
            content += '<div><strong>Used in:</strong> ';
            content += outgoingEdges.map(e => {
                const targetNode = this.nodesData.find(n => n.id === e.target);
                return `<span class="edge-type">${e.type}</span> ${targetNode ? targetNode.label : e.target}`;
            }).join(', ');
            content += '</div>';
        }
        
        return content;
    }
    
    /**
     * Hide the sidebar
     */
    hideSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.add('hidden');
        }
    }
    
    /**
     * Show the sidebar
     */
    showSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.remove('hidden');
        }
    }
    
    /**
     * Clear sidebar details
     */
    clearDetails() {
        if (this.titleElement) {
            this.titleElement.textContent = 'Select a theorem';
        }
        
        if (this.contentElement) {
            this.contentElement.innerHTML = '<p>Click on a node in the graph to learn more about that theorem or concept.</p>';
        }
    }
    
    /**
     * Check if sidebar is visible
     * @returns {boolean} - Whether sidebar is visible
     */
    isVisible() {
        return this.sidebar && !this.sidebar.classList.contains('hidden');
    }
    
    /**
     * Toggle sidebar visibility
     * @returns {boolean} - New visibility state
     */
    toggleVisibility() {
        if (this.sidebar) {
            this.sidebar.classList.toggle('hidden');
            return !this.sidebar.classList.contains('hidden');
        }
        return false;
    }
}

// Make available in module and global contexts
if (typeof module !== 'undefined') {
    module.exports = SidebarManager;
} else {
    window.SidebarManager = SidebarManager;
}