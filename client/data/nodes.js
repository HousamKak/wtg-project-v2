/**
 * Node data for the WTG graph
 * Each node represents a mathematical concept, theorem, or axiom
 */
const nodes = [
    // Axioms
    { id: 'zfc', label: 'ZFC Set Theory', type: 'Axiom', description: 'Zermelo-Fraenkel set theory with the Axiom of Choice', tags: ['set theory', 'foundations', 'logic'], level: 1, size: 12, connections: 5 },
    { id: 'axiom_choice', label: 'Axiom of Choice', type: 'Axiom', description: 'For any collection of non-empty sets, there exists a choice function', tags: ['set theory', 'foundations'], level: 1, size: 11, connections: 4 },
    { id: 'axiom_infinity', label: 'Axiom of Infinity', type: 'Axiom', description: 'There exists an infinite set', tags: ['set theory', 'foundations'], level: 1, size: 10, connections: 3 },
    
    // Definitions
    { id: 'set_operations', label: 'Set Operations', type: 'Definition', description: 'Basic operations on sets: union, intersection, complement, etc.', tags: ['set theory'], level: 2, size: 8, connections: 3 },
    { id: 'relations', label: 'Relations', type: 'Definition', description: 'Binary relations between sets and their properties', tags: ['set theory'], level: 2, size: 8, connections: 3 },
    { id: 'functions', label: 'Functions', type: 'Definition', description: 'Functions as special types of relations', tags: ['set theory'], level: 2, size: 8, connections: 4 },
    { id: 'cardinality', label: 'Cardinality', type: 'Definition', description: 'Measure of the size of a set', tags: ['set theory'], level: 2, size: 8, connections: 3 },
    { id: 'partial_order', label: 'Partial Orders', type: 'Definition', description: 'Relations that are reflexive, antisymmetric, and transitive', tags: ['set theory', 'order theory'], level: 2, size: 8, connections: 2 },
    
    // Number systems (mix of definitions and axioms)
    { id: 'natural_numbers', label: 'Natural Numbers', type: 'Definition', description: 'The set of natural numbers and Peano axioms', tags: ['number theory'], level: 3, size: 8, connections: 2 },
    { id: 'integers', label: 'Integers', type: 'Definition', description: 'Extension of natural numbers to include negative numbers', tags: ['number theory'], level: 3, size: 8, connections: 2 },
    { id: 'rationals', label: 'Rational Numbers', type: 'Definition', description: 'Numbers expressible as fractions of integers', tags: ['number theory', 'algebra'], level: 3, size: 8, connections: 2 },
    { id: 'real_numbers', label: 'Real Numbers', type: 'Definition', description: 'Complete ordered field extending rational numbers', tags: ['analysis', 'number theory'], level: 3, size: 9, connections: 5 },
    { id: 'completeness', label: 'Completeness Axiom', type: 'Axiom', description: 'Every non-empty set of real numbers bounded above has a least upper bound', tags: ['analysis'], level: 3, size: 10, connections: 4 },
    { id: 'complex_numbers', label: 'Complex Numbers', type: 'Definition', description: 'Extension of real numbers with imaginary unit i', tags: ['analysis', 'algebra'], level: 3, size: 9, connections: 3 },
    
    // Analysis foundations
    { id: 'sequence', label: 'Sequence', type: 'Definition', description: 'A function from natural numbers to another set', tags: ['analysis'], level: 4, size: 8, connections: 3 },
    { id: 'limit', label: 'Limit', type: 'Definition', description: 'The value a function or sequence approaches as input approaches a given value', tags: ['analysis'], level: 4, size: 8, connections: 3 },
    { id: 'continuity', label: 'Continuity', type: 'Definition', description: 'Property of functions preserving limits', tags: ['analysis', 'topology'], level: 4, size: 8, connections: 4 },
    { id: 'differentiation', label: 'Differentiation', type: 'Definition', description: 'The rate of change of a function at a point', tags: ['calculus', 'analysis'], level: 4, size: 8, connections: 4 },
    { id: 'integration', label: 'Integration', type: 'Definition', description: 'The accumulation of quantities over an interval', tags: ['calculus', 'analysis'], level: 4, size: 8, connections: 3 },
    { id: 'metric_space', label: 'Metric Space', type: 'Definition', description: 'A set with a distance function satisfying certain properties', tags: ['topology', 'analysis'], level: 4, size: 8, connections: 3 },
    
    // Lemmas and theorems
    { id: 'zorns_lemma', label: 'Zorn\'s Lemma', type: 'Lemma', description: 'If every chain in a partially ordered set has an upper bound, then the set has a maximal element', tags: ['set theory', 'order theory'], level: 5, size: 9, connections: 3 },
    { id: 'bolzano_weierstrass', label: 'Bolzano-Weierstrass', type: 'Theorem', description: 'Every bounded sequence has a convergent subsequence', tags: ['analysis'], level: 5, size: 9, connections: 3 },
    { id: 'monotone_convergence', label: 'Monotone Convergence', type: 'Theorem', description: 'Every bounded monotone sequence converges', tags: ['analysis'], level: 5, size: 9, connections: 2 },
    { id: 'cauchy_criterion', label: 'Cauchy Criterion', type: 'Theorem', description: 'A sequence converges if and only if it is Cauchy', tags: ['analysis'], level: 5, size: 8, connections: 3 },
    { id: 'heine_borel', label: 'Heine-Borel Theorem', type: 'Theorem', description: 'A subset of R^n is compact if and only if it is closed and bounded', tags: ['topology', 'analysis'], level: 5, size: 9, connections: 3 },
    { id: 'banach_fixed_point', label: 'Banach Fixed-Point', type: 'Theorem', description: 'A contraction mapping on a complete metric space has a unique fixed point', tags: ['analysis', 'topology'], level: 5, size: 9, connections: 2 },
    
    // Advanced theorems
    { id: 'intermediate_value', label: 'Intermediate Value', type: 'Theorem', description: 'If f is continuous on [a,b] with f(a)<c<f(b), then f(x)=c for some x in [a,b]', tags: ['analysis'], level: 6, size: 9, connections: 2 },
    { id: 'mean_value', label: 'Mean Value Theorem', type: 'Theorem', description: 'For a continuous function on a closed interval, there exists a point where the derivative equals the average rate of change', tags: ['calculus', 'analysis'], level: 6, size: 9, connections: 3 },
    { id: 'ftc', label: 'Fundamental Theorem', type: 'Theorem', description: 'The definite integral of a function can be computed using its antiderivative', tags: ['calculus', 'analysis'], level: 6, size: 10, connections: 2 },
    { id: 'taylors_theorem', label: 'Taylor\'s Theorem', type: 'Theorem', description: 'A function can be approximated by a sum of terms calculated from its derivatives at a single point', tags: ['calculus', 'analysis'], level: 6, size: 9, connections: 3 },
    { id: 'open_mapping', label: 'Open Mapping Theorem', type: 'Theorem', description: 'A continuous surjective linear map between Banach spaces is an open map', tags: ['functional analysis'], level: 6, size: 9, connections: 2 },
    { id: 'contraction_principle', label: 'Contraction Principle', type: 'Theorem', description: 'A fixed-point method for solving equations', tags: ['analysis', 'differential equations'], level: 6, size: 8, connections: 2 },
    
    // Corollaries
    { id: 'rolle', label: 'Rolle\'s Theorem', type: 'Corollary', description: 'If f is differentiable on [a,b] and f(a)=f(b), then f\'(c)=0 for some c in (a,b)', tags: ['calculus', 'analysis'], level: 6, size: 7, connections: 1 },
    { id: 'lhopitals_rule', label: 'L\'Hôpital\'s Rule', type: 'Corollary', description: 'Method for evaluating limits of indeterminate forms', tags: ['calculus', 'analysis'], level: 6, size: 7, connections: 2 },
    { id: 'closed_graph', label: 'Closed Graph Theorem', type: 'Corollary', description: 'A linear operator is continuous if and only if its graph is closed', tags: ['functional analysis'], level: 7, size: 7, connections: 1 },
    { id: 'lebesgue_number', label: 'Lebesgue Number Lemma', type: 'Lemma', description: 'For any open cover of a compact metric space, there exists a positive number such that any set with diameter less than this number is contained in some member of the cover', tags: ['topology'], level: 7, size: 7, connections: 2 },
    
    // More advanced
    { id: 'baire_category', label: 'Baire Category Theorem', type: 'Theorem', description: 'A complete metric space cannot be written as the countable union of nowhere dense sets', tags: ['topology', 'analysis'], level: 7, size: 8, connections: 2 },
    { id: 'uniform_boundedness', label: 'Uniform Boundedness', type: 'Theorem', description: 'A family of pointwise bounded continuous linear operators is uniformly bounded', tags: ['functional analysis'], level: 7, size: 8, connections: 2 },
    { id: 'residue_theorem', label: 'Residue Theorem', type: 'Theorem', description: 'The contour integral of a function equals 2πi times the sum of the residues inside the contour', tags: ['complex analysis'], level: 7, size: 9, connections: 2 },
    { id: 'riesz_representation', label: 'Riesz Representation', type: 'Theorem', description: 'A continuous linear functional on a Hilbert space is represented by inner product with a unique vector', tags: ['functional analysis'], level: 7, size: 9, connections: 3 }
];

// Make nodes globally accessible
window.nodes = nodes;