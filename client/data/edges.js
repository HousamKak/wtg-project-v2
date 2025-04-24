/**
 * Edge data for the WTG graph
 * Each edge represents a relationship between two mathematical concepts
 * Types of relationships: 'depends_on', 'proves', 'generalizes'
 */
const edges = [
    // ZFC and axioms
    { source: 'zfc', target: 'axiom_choice', type: 'proves' },
    { source: 'zfc', target: 'axiom_infinity', type: 'proves' },
    { source: 'zfc', target: 'set_operations', type: 'depends_on' },
    { source: 'zfc', target: 'relations', type: 'depends_on' },
    { source: 'zfc', target: 'functions', type: 'depends_on' },
    { source: 'zfc', target: 'cardinality', type: 'depends_on' },
    
    // Set theory connections
    { source: 'relations', target: 'partial_order', type: 'proves' },
    { source: 'axiom_choice', target: 'zorns_lemma', type: 'proves' },
    { source: 'partial_order', target: 'zorns_lemma', type: 'depends_on' },
    
    // Building number systems
    { source: 'set_operations', target: 'natural_numbers', type: 'proves' },
    { source: 'axiom_infinity', target: 'natural_numbers', type: 'depends_on' },
    { source: 'natural_numbers', target: 'integers', type: 'generalizes' },
    { source: 'integers', target: 'rationals', type: 'generalizes' },
    { source: 'rationals', target: 'real_numbers', type: 'generalizes' },
    { source: 'real_numbers', target: 'completeness', type: 'depends_on' },
    { source: 'real_numbers', target: 'complex_numbers', type: 'generalizes' },
    
    // Analysis foundations
    { source: 'functions', target: 'sequence', type: 'generalizes' },
    { source: 'functions', target: 'limit', type: 'depends_on' },
    { source: 'limit', target: 'continuity', type: 'proves' },
    { source: 'limit', target: 'differentiation', type: 'proves' },
    { source: 'continuity', target: 'integration', type: 'depends_on' },
    { source: 'cardinality', target: 'metric_space', type: 'depends_on' },
    { source: 'real_numbers', target: 'metric_space', type: 'proves' },
    
    // Theorems based on completeness
    { source: 'completeness', target: 'bolzano_weierstrass', type: 'proves' },
    { source: 'completeness', target: 'monotone_convergence', type: 'proves' },
    { source: 'completeness', target: 'cauchy_criterion', type: 'proves' },
    { source: 'metric_space', target: 'heine_borel', type: 'proves' },
    { source: 'metric_space', target: 'banach_fixed_point', type: 'proves' },
    
    // Continuity theorems
    { source: 'continuity', target: 'intermediate_value', type: 'proves' },
    { source: 'continuity', target: 'mean_value', type: 'depends_on' },
    { source: 'banach_fixed_point', target: 'contraction_principle', type: 'generalizes' },
    
    // Calculus connections
    { source: 'mean_value', target: 'rolle', type: 'generalizes' },
    { source: 'differentiation', target: 'mean_value', type: 'depends_on' },
    { source: 'mean_value', target: 'ftc', type: 'depends_on' },
    { source: 'integration', target: 'ftc', type: 'depends_on' },
    { source: 'differentiation', target: 'taylors_theorem', type: 'proves' },
    { source: 'mean_value', target: 'lhopitals_rule', type: 'proves' },
    
    // Advanced analysis connections
    { source: 'cauchy_criterion', target: 'uniform_boundedness', type: 'depends_on' },
    { source: 'heine_borel', target: 'baire_category', type: 'depends_on' },
    { source: 'banach_fixed_point', target: 'open_mapping', type: 'depends_on' },
    { source: 'open_mapping', target: 'closed_graph', type: 'proves' },
    { source: 'heine_borel', target: 'lebesgue_number', type: 'proves' },
    
    // Complex analysis
    { source: 'complex_numbers', target: 'residue_theorem', type: 'depends_on' },
    
    // Functional analysis
    { source: 'metric_space', target: 'riesz_representation', type: 'depends_on' },
    { source: 'uniform_boundedness', target: 'riesz_representation', type: 'depends_on' }
];

// Make edges globally accessible
window.edges = edges;