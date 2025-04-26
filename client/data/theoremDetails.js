/**
 * Detailed information about mathematical theorems and concepts
 * This data is used to populate the sidebar when a node is clicked
 */
const theoremDetails = {
    'zfc': {
        title: 'Zermelo-Fraenkel Set Theory with Choice (ZFC)',
        node_type: 'Axiom',
        statement: 'A collection of axioms that form the foundation for mathematics, including the Axiom of Extensionality, Pairing, Union, Power Set, Infinity, Replacement, Foundation, and Choice.',
        explanation: 'ZFC provides the foundational axioms from which almost all of mathematics can be derived. It formalizes the notion of sets and the operations that can be performed on them, and serves as the starting point for constructing mathematical objects and proving theorems.',
        prerequisites: 'Basic understanding of logic and axiomatic systems.',
        applications: 'Foundation for all branches of mathematics, including analysis, algebra, topology, and more.',
        papers: [
            { title: 'Investigations in the foundations of set theory', author: 'Zermelo, E.', year: '1908' },
            { title: 'On the foundations of set theory and the continuum problem', author: 'Gödel, K.', year: '1947' }
        ],
        tags: ['set theory', 'foundations', 'logic']
    },
    'completeness': {
        title: 'Completeness Axiom',
        node_type: 'Axiom',
        statement: 'Every non-empty set of real numbers that is bounded above has a least upper bound (supremum).',
        statement_latex: '\\forall S \\subset \\mathbb{R}, S \\neq \\emptyset, \\exists b \\in \\mathbb{R} \\text{ s.t. } \\forall x \\in S, x \\leq b \\Rightarrow \\exists \\sup S',
        explanation: 'The completeness axiom is what distinguishes the real numbers from the rational numbers. It ensures there are no "gaps" in the real number line and allows for the development of calculus.',
        prerequisites: 'Understanding of sets, bounds, and the concept of supremum/infimum.',
        applications: 'Foundation for proving the existence of limits, continuity properties, and integral existence.',
        papers: [
            { title: 'On the Completeness of the Real Numbers', author: 'Dedekind, R.', year: '1872' },
            { title: 'Alternative Axiomatizations of the Real Numbers', author: 'Tao, T.', year: '2011' }
        ],
        tags: ['analysis', 'real numbers', 'completeness']
    },
    'bolzano_weierstrass': {
        title: 'Bolzano-Weierstrass Theorem',
        node_type: 'Theorem',
        statement: 'Every bounded sequence of real numbers has a convergent subsequence.',
        statement_latex: '\\text{If } \\{a_n\\} \\text{ is bounded, then } \\exists \\text{ a subsequence } \\{a_{n_k}\\} \\text{ such that } \\lim_{k \\to \\infty} a_{n_k} \\text{ exists}',
        explanation: 'This theorem is a direct consequence of the completeness of the real numbers. It provides a powerful tool for proving the existence of limits in various contexts.',
        prerequisites: 'Sequences, convergence, boundedness, completeness axiom.',
        proof_sketch: 'Use the nested intervals method: repeatedly bisect intervals containing infinitely many terms of the sequence.',
        applications: 'Used to prove existence of solutions to differential equations, optimization problems, and in topology.',
        papers: [
            { title: 'A new proof of the Bolzano-Weierstrass theorem', author: 'Dini, U.', year: '1892' },
            { title: 'Applications of Bolzano-Weierstrass in functional analysis', author: 'Banach, S.', year: '1932' }
        ],
        tags: ['analysis', 'sequences', 'convergence']
    },
    'ftc': {
        title: 'Fundamental Theorem of Calculus',
        node_type: 'Theorem',
        statement: 'Part 1: If f is continuous on [a,b], then F(x) = ∫_a^x f(t)dt is differentiable on (a,b) and F\'(x) = f(x). Part 2: If f is continuous on [a,b] and F is any antiderivative of f, then ∫_a^b f(x)dx = F(b) - F(a).',
        statement_latex: '\\text{Part 1: } \\frac{d}{dx}\\int_a^x f(t)dt = f(x) \\quad \\text{Part 2: } \\int_a^b f(x)dx = F(b) - F(a)',
        explanation: 'The theorem establishes the relationship between differentiation and integration, showing they are inverse operations. It provides the basis for computing definite integrals using antiderivatives.',
        prerequisites: 'Continuity, Riemann integration, differentiation, Mean Value Theorem.',
        proof_sketch: 'For part 1, use the definition of the derivative and properties of integrals. For part 2, apply part 1 to the function F(x) - ∫_a^x f(t)dt.',
        applications: 'Basis for computational methods in calculus, physics equations, engineering applications.',
        papers: [
            { title: 'The historical development of the Fundamental Theorem of Calculus', author: 'Newton, I. & Leibniz, G.', year: '1670s' },
            { title: 'Extensions of the Fundamental Theorem to multiple integrals', author: 'Gauss, C.F.', year: '1813' }
        ],
        tags: ['calculus', 'analysis', 'integration', 'differentiation']
    },
    'zorns_lemma': {
        title: 'Zorn\'s Lemma',
        node_type: 'Lemma',
        statement: 'If every chain in a partially ordered set has an upper bound, then the set has a maximal element.',
        statement_latex: '\\text{If } (P, \\leq) \\text{ is a poset where every chain has an upper bound}, \\text{ then } P \\text{ has a maximal element}',
        explanation: 'Zorn\'s Lemma is a powerful tool in set theory, equivalent to the Axiom of Choice. It provides a way to prove the existence of maximal elements in partially ordered sets.',
        prerequisites: 'Set theory, axiom of choice, partial orders, upper and lower bounds of sets.',
        proof_sketch: 'Start with an arbitrary element. If it\'s maximal, we\'re done. Otherwise, build a chain by successively selecting larger elements. Use the axiom of choice to continue this process. Since every chain has an upper bound, this process produces a maximal element.',
        applications: 'Used in proofs across algebra, analysis, and topology. Examples include the existence of bases in vector spaces, maximal ideals in rings, and the Hahn-Banach theorem in functional analysis.',
        papers: [
            { title: 'On Zorn\'s Lemma', author: 'Kuratowski, K.', year: '1922' },
            { title: 'Equivalents of the Axiom of Choice', author: 'Rubin, H. & Rubin, J.E.', year: '1963' }
        ],
        tags: ['set theory', 'order theory', 'axiom of choice']
    },
    'taylors_theorem': {
        title: 'Taylor\'s Theorem',
        node_type: 'Theorem',
        statement: 'If f is n+1 times differentiable on an interval containing a, then for each x in the interval, f(x) can be written as a sum of terms calculated from the derivatives of f at a, plus a remainder term.',
        statement_latex: 'f(x) = \\sum_{k=0}^{n} \\frac{f^{(k)}(a)}{k!}(x-a)^k + R_n(x)',
        explanation: 'Taylor\'s Theorem allows us to approximate functions using polynomials constructed from their derivatives at a single point. It generalizes the idea of linear approximation to higher degrees.',
        prerequisites: 'Calculus, differentiation, Mean Value Theorem.',
        proof_sketch: 'Apply the Mean Value Theorem repeatedly to the difference between the function and its Taylor polynomial. The key insight is expressing the remainder in terms of an integral or using Cauchy\'s or Lagrange\'s form of the remainder.',
        applications: 'Foundational for numerical approximations, error analysis, series expansions, and asymptotic analysis. Used in physics for approximating complex functions and in computer science for algorithm analysis.',
        papers: [
            { title: 'Methodus incrementorum directa et inversa', author: 'Taylor, B.', year: '1715' },
            { title: 'On the remainder in Taylor\'s formula', author: 'Lagrange, J.L.', year: '1797' }
        ],
        tags: ['calculus', 'analysis', 'approximation theory']
    },
    'residue_theorem': {
        title: 'Residue Theorem',
        node_type: 'Theorem',
        statement: 'Let U be a simply connected open subset of the complex plane, and let f be a function holomorphic on U except for isolated singularities. Then for any closed contour γ in U that doesn\'t pass through any singularities, the contour integral equals 2πi times the sum of the residues of f at the singularities inside γ.',
        statement_latex: '\\oint_\\gamma f(z)\\,dz = 2\\pi i \\sum\\limits_{a_k \\in \\text{Int}(\\gamma)} \\text{Res}(f, a_k)',
        explanation: 'The Residue Theorem is a powerful result in complex analysis that allows us to evaluate certain integrals by analyzing the behavior of functions at their singularities, rather than directly computing the integral.',
        prerequisites: 'Complex analysis, contour integration, Laurent series, singularities of complex functions.',
        proof_sketch: 'Decompose the region into simple pieces using Cauchy\'s theorem. For each singularity, use a small circle and Laurent series to compute the residue, then apply Cauchy\'s integral formula.',
        applications: 'Used extensively in physics (quantum field theory, fluid dynamics), engineering (signal processing), and mathematics (evaluation of improper real integrals, number theory).',
        papers: [
            { title: 'Théorie des fonctions analytiques', author: 'Cauchy, A.L.', year: '1827' },
            { title: 'Applications of complex analysis in physics', author: 'Sommerfeld, A.', year: '1934' }
        ],
        tags: ['complex analysis', 'integration theory', 'singularity theory']
    },
    'uniform_boundedness': {
        title: 'Uniform Boundedness Principle',
        node_type: 'Theorem',
        statement: 'Let X be a Banach space and Y a normed vector space. If F is a collection of bounded linear operators from X to Y such that for each x in X, the set {Tx : T in F} is bounded in Y, then the set of operator norms {||T|| : T in F} is bounded.',
        statement_latex: '\\sup_{x \\in X, \\|x\\| \\leq 1} \\sup_{T \\in F} \\|Tx\\| < \\infty',
        explanation: 'Also known as the Banach-Steinhaus theorem, this principle states that a family of bounded linear operators that is pointwise bounded must be uniformly bounded. It\'s a cornerstone of functional analysis.',
        prerequisites: 'Functional analysis, Banach spaces, bounded linear operators, Baire category theorem.',
        proof_sketch: 'Define sets E_n = {x in X : ||Tx|| ≤ n for all T in F}. By pointwise boundedness, X is the union of these sets. By Baire category, one of these sets must contain a ball. Use this to establish uniform boundedness.',
        applications: 'Crucial in proving convergence theorems for Fourier series, analyzing partial differential equations, and establishing properties of Hilbert and Banach spaces.',
        papers: [
            { title: 'Sur les opérations dans les ensembles abstraits et leur application aux équations intégrales', author: 'Banach, S.', year: '1922' },
            { title: 'Über die Konvergenz von Funktionaloperatoren', author: 'Steinhaus, H.', year: '1927' }
        ],
        tags: ['functional analysis', 'operator theory', 'Banach spaces']
    }
};

// Make theoremDetails available as a module or globally
if (typeof module !== 'undefined') {
    module.exports = theoremDetails;
} else {
    window.theoremDetails = theoremDetails;
}