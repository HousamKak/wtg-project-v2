/**
 * MathUtils.js
 * Utility functions for mathematical operations used in the graph
 */
class MathUtils {
    constructor() {
        // Constants that might be used in calculations
        this.EPSILON = 0.00001;
    }
    
    /**
     * Calculate distance between two 3D points
     * @param {Object} point1 - First point with x, y, z properties
     * @param {Object} point2 - Second point with x, y, z properties
     * @returns {number} - Euclidean distance
     */
    distance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        const dz = point2.z - point1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    /**
     * Calculate 2D distance (ignoring z-coordinate)
     * @param {Object} point1 - First point with x, y properties
     * @param {Object} point2 - Second point with x, y properties
     * @returns {number} - 2D Euclidean distance
     */
    distance2D(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Calculate the midpoint between two points
     * @param {Object} point1 - First point with x, y, z properties
     * @param {Object} point2 - Second point with x, y, z properties
     * @returns {Object} - Midpoint with x, y, z properties
     */
    midpoint(point1, point2) {
        return {
            x: (point1.x + point2.x) / 2,
            y: (point1.y + point2.y) / 2,
            z: (point1.z + point2.z) / 2
        };
    }
    
    /**
     * Linear interpolation between two points
     * @param {Object} point1 - First point with x, y, z properties
     * @param {Object} point2 - Second point with x, y, z properties
     * @param {number} t - Interpolation parameter (0-1)
     * @returns {Object} - Interpolated point with x, y, z properties
     */
    lerp(point1, point2, t) {
        return {
            x: point1.x + (point2.x - point1.x) * t,
            y: point1.y + (point2.y - point1.y) * t,
            z: point1.z + (point2.z - point1.z) * t
        };
    }
    
    /**
     * Ease in-out function for smoother animations
     * @param {number} t - Input parameter (0-1)
     * @returns {number} - Eased value (0-1)
     */
    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    /**
     * Calculate normalized direction vector from point1 to point2
     * @param {Object} point1 - Source point with x, y, z properties
     * @param {Object} point2 - Target point with x, y, z properties
     * @returns {Object} - Normalized direction vector with x, y, z properties
     */
    direction(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        const dz = point2.z - point1.z;
        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (length < this.EPSILON) {
            return { x: 0, y: 0, z: 0 };
        }
        
        return {
            x: dx / length,
            y: dy / length,
            z: dz / length
        };
    }
    
    /**
     * Add two vectors
     * @param {Object} vec1 - First vector with x, y, z properties
     * @param {Object} vec2 - Second vector with x, y, z properties
     * @returns {Object} - Sum vector with x, y, z properties
     */
    addVectors(vec1, vec2) {
        return {
            x: vec1.x + vec2.x,
            y: vec1.y + vec2.y,
            z: vec1.z + vec2.z
        };
    }
    
    /**
     * Subtract vec2 from vec1
     * @param {Object} vec1 - First vector with x, y, z properties
     * @param {Object} vec2 - Second vector with x, y, z properties
     * @returns {Object} - Difference vector with x, y, z properties
     */
    subtractVectors(vec1, vec2) {
        return {
            x: vec1.x - vec2.x,
            y: vec1.y - vec2.y,
            z: vec1.z - vec2.z
        };
    }
    
    /**
     * Scale a vector by a scalar
     * @param {Object} vec - Vector with x, y, z properties
     * @param {number} scalar - Scaling factor
     * @returns {Object} - Scaled vector with x, y, z properties
     */
    scaleVector(vec, scalar) {
        return {
            x: vec.x * scalar,
            y: vec.y * scalar,
            z: vec.z * scalar
        };
    }
    
    /**
     * Calculate the magnitude (length) of a vector
     * @param {Object} vec - Vector with x, y, z properties
     * @returns {number} - Magnitude of the vector
     */
    magnitude(vec) {
        return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
    }
    
    /**
     * Normalize a vector (make it unit length)
     * @param {Object} vec - Vector with x, y, z properties
     * @returns {Object} - Normalized vector with x, y, z properties
     */
    normalizeVector(vec) {
        const mag = this.magnitude(vec);
        
        if (mag < this.EPSILON) {
            return { x: 0, y: 0, z: 0 };
        }
        
        return {
            x: vec.x / mag,
            y: vec.y / mag,
            z: vec.z / mag
        };
    }
    
    /**
     * Calculate the dot product of two vectors
     * @param {Object} vec1 - First vector with x, y, z properties
     * @param {Object} vec2 - Second vector with x, y, z properties
     * @returns {number} - Dot product
     */
    dotProduct(vec1, vec2) {
        return vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
    }
    
    /**
     * Calculate the cross product of two vectors
     * @param {Object} vec1 - First vector with x, y, z properties
     * @param {Object} vec2 - Second vector with x, y, z properties
     * @returns {Object} - Cross product vector with x, y, z properties
     */
    crossProduct(vec1, vec2) {
        return {
            x: vec1.y * vec2.z - vec1.z * vec2.y,
            y: vec1.z * vec2.x - vec1.x * vec2.z,
            z: vec1.x * vec2.y - vec1.y * vec2.x
        };
    }
}

// Create a singleton instance
const mathUtils = new MathUtils();

// Make available in module and global contexts
if (typeof module !== 'undefined') {
    module.exports = mathUtils;
} else {
    window.mathUtils = mathUtils;
}