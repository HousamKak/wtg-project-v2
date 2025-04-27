/**
 * LaTeXRenderer.js
 * Provides LaTeX rendering capabilities for mathematical expressions
 */
class LaTeXRenderer {
    constructor() {
        this.initialized = false;
        this.initializationPromise = null;
        
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
    initialize() {
        if (this.initialized) return Promise.resolve();
        
        // If already initializing, return the existing promise
        if (this.initializationPromise) return this.initializationPromise;
        
        this.initializationPromise = new Promise((resolve, reject) => {
            // Check if MathJax is already loaded
            if (window.MathJax) {
                console.log('MathJax already loaded, configuring...');
                this.configureMathJax();
                this.initialized = true;
                resolve();
                return;
            }
            
            console.log('Loading MathJax from CDN...');
            
            // Configure MathJax before loading the script
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
                },
                startup: {
                    ready: () => {
                        console.log('MathJax ready');
                        window.MathJax.startup.defaultReady();
                        this.initialized = true;
                        resolve();
                    }
                }
            };
            
            // Load MathJax script
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
            script.async = true;
            
            script.onload = () => {
                console.log('MathJax script loaded');
                // Resolution is handled by MathJax.startup.ready
            };
            
            script.onerror = (error) => {
                console.error('Failed to load MathJax:', error);
                reject(new Error('Failed to load MathJax'));
                this.initializationPromise = null;
            };
            
            document.head.appendChild(script);
        });
        
        return this.initializationPromise;
    }
    
    /**
     * Configure MathJax
     * This is now done before loading MathJax
     */
    configureMathJax() {
        if (!window.MathJax) {
            window.MathJax = {};
        }
        
        window.MathJax = {
            ...window.MathJax,
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
     * @returns {Promise} - Promise resolving when processing is complete
     */
    async processElement(element) {
        if (!element) return;
        
        try {
            // Make sure MathJax is initialized
            await this.initialize();
            
            if (window.MathJax && window.MathJax.typesetPromise) {
                console.log('Processing LaTeX in element:', element);
                await window.MathJax.typesetPromise([element]);
                console.log('LaTeX processing complete');
            } else {
                console.error('MathJax.typesetPromise not available');
            }
        } catch (error) {
            console.error('Error typesetting LaTeX:', error);
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
        
        // Queue typesetting with a slight delay to ensure DOM is updated
        setTimeout(() => {
            this.processElement(container).catch(error => {
                console.error('Failed to process LaTeX element:', error);
            });
        }, 50);
        
        return container;
    }
    
    /**
     * Process all LaTeX elements in the document
     * @returns {Promise} - Promise resolving when all processing is complete
     */
    async processAllElements() {
        try {
            await this.initialize();
            
            if (window.MathJax && window.MathJax.typesetPromise) {
                await window.MathJax.typesetPromise();
                console.log('All LaTeX elements processed');
            }
        } catch (error) {
            console.error('Error processing all LaTeX elements:', error);
        }
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