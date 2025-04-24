/**
 * LaTeXRenderer.js
 * Provides LaTeX rendering capabilities for mathematical expressions
 */
class LaTeXRenderer {
    constructor() {
        this.initialized = false;
        
        // MathJax configuration
        this.config = {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false}
            ]
        };
    }
    
    /**
     * Initialize MathJax
     * @returns {Promise} - Promise resolving when MathJax is loaded
     */
    async initialize() {
        if (this.initialized) return Promise.resolve();
        
        return new Promise((resolve, reject) => {
            // Check if MathJax is already loaded
            if (window.MathJax) {
                this.configureMathJax();
                this.initialized = true;
                resolve();
                return;
            }
            
            // Load MathJax script
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.0/es5/tex-mml-chtml.js';
            script.async = true;
            
            script.onload = () => {
                this.configureMathJax();
                this.initialized = true;
                resolve();
            };
            
            script.onerror = () => {
                console.error('Failed to load MathJax');
                reject(new Error('Failed to load MathJax'));
            };
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * Configure MathJax
     */
    configureMathJax() {
        window.MathJax = {
            tex: {
                inlineMath: [["$", "$"]],
                displayMath: [["$$", "$$"]],
                processEscapes: true,
                processEnvironments: true
            },
            options: {
                skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
                ignoreHtmlClass: 'tex2jax_ignore',
                processHtmlClass: 'tex2jax_process'
            }
        };
    }
    
    /**
     * Process LaTeX in an element
     * @param {HTMLElement} element - Element containing LaTeX
     */
    async processElement(element) {
        if (!element) return;
        
        await this.initialize();
        
        if (window.MathJax && window.MathJax.typesetPromise) {
            try {
                await window.MathJax.typesetPromise([element]);
            } catch (error) {
                console.error('Error typesetting LaTeX:', error);
            }
        }
    }
    
    /**
     * Convert LaTeX string to HTML
     * @param {string} latexString - LaTeX string to convert
     * @returns {string} - HTML string with LaTeX processing
     */
    processLatexString(latexString) {
        if (!latexString) return '';
        
        // Wrap formula in display or inline delimiters if not already present
        let processedString = latexString;
        if (!latexString.includes('$')) {
            processedString = `$$${latexString}$$`;
        }
        
        return processedString;
    }
    
    /**
     * Create a prerendered LaTeX element
     * @param {string} latexString - LaTeX string
     * @returns {HTMLElement} - Element with rendered LaTeX
     */
    createLatexElement(latexString) {
        const container = document.createElement('div');
        container.className = 'latex-container';
        container.innerHTML = this.processLatexString(latexString);
        
        // Queue typesetting
        setTimeout(() => this.processElement(container), 0);
        
        return container;
    }
}

// Create singleton instance
const latexRenderer = new LaTeXRenderer();

// Make available in module and global contexts
if (typeof module !== 'undefined') {
    module.exports = latexRenderer;
} else {
    window.latexRenderer = latexRenderer;
}