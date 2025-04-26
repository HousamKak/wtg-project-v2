// Allow Three.js Vector3 and Color to be used directly with uniform3fv
THREE.Vector3.prototype[Symbol.iterator] = function*() {
    yield this.x; yield this.y; yield this.z;
  };
  THREE.Color.prototype[Symbol.iterator] = function*() {
    yield this.r; yield this.g; yield this.b;
  };
  
  /**
   * CameraController.js
   * Manages camera movement, rotation, and zooming
   */
  class CameraController {
      constructor(graphManager) {
          this.graphManager = graphManager;
          this.camera = graphManager.camera;
          
          // Configuration parameters
          this.rotationSpeed = 0.005;
          this.panSpeed = 0.5;
          this.zoomSpeed = 1.0;
          this.minDistance = 50;
          this.maxDistance = 500;
          
          // Auto-rotation state - disabled by default
          this.autoRotate = false;
          
          // Target point that camera looks at
          this.target = new THREE.Vector3(0, 0, 0);
      }
      
      /**
       * Rotate camera around the target point
       * @param {number} deltaX - Mouse X movement
       * @param {number} deltaY - Mouse Y movement
       */
      rotateCamera(deltaX, deltaY) {
          // Rotate horizontally around the y-axis
          if (deltaX !== 0) {
              const angle = -deltaX * this.rotationSpeed;
              const x = this.camera.position.x - this.target.x;
              const z = this.camera.position.z - this.target.z;
              
              this.camera.position.x = this.target.x + x * Math.cos(angle) - z * Math.sin(angle);
              this.camera.position.z = this.target.z + x * Math.sin(angle) + z * Math.cos(angle);
          }
          
          // Rotate vertically around the x-axis
          if (deltaY !== 0) {
              const angle = -deltaY * this.rotationSpeed;
              const y = this.camera.position.y - this.target.y;
              const distanceInXZ = Math.sqrt(
                  Math.pow(this.camera.position.x - this.target.x, 2) +
                  Math.pow(this.camera.position.z - this.target.z, 2)
              );
              
              // Calculate new y position
              const newY = y * Math.cos(angle) - distanceInXZ * Math.sin(angle);
              
              // Limit vertical rotation to avoid flipping
              const maxY = 200;
              const minY = -200;
              
              if (newY <= maxY && newY >= minY) {
                  // Calculate new distance in XZ plane
                  const newDistanceInXZ = y * Math.sin(angle) + distanceInXZ * Math.cos(angle);
                  
                  // Only update if the new XZ distance is positive
                  if (newDistanceInXZ > 0) {
                      // Calculate scale factor for xz components
                      const scale = newDistanceInXZ / distanceInXZ;
                      
                      // Scale x and z components
                      const dx = this.camera.position.x - this.target.x;
                      const dz = this.camera.position.z - this.target.z;
                      
                      this.camera.position.x = this.target.x + dx * scale;
                      this.camera.position.z = this.target.z + dz * scale;
                      this.camera.position.y = this.target.y + newY;
                  }
              }
          }
          
          // Update camera to look at target
          this.camera.lookAt(this.target);
      }
      
      /**
       * Pan the camera and target point
       * @param {number} deltaX - Mouse X movement
       * @param {number} deltaY - Mouse Y movement
       */
      panCamera(deltaX, deltaY) {
          // Get camera right and up vectors
          const vRight = new THREE.Vector3();
          const vUp = new THREE.Vector3(0, 1, 0);
          
          // Get direction vector and cross product to get right vector
          const vDir = new THREE.Vector3();
          this.camera.getWorldDirection(vDir);
          vRight.crossVectors(vUp, vDir).normalize();
          
          // Apply pan to both camera and target
          const panX = -deltaX * this.panSpeed;
          const panY = deltaY * this.panSpeed;
          
          const moveX = vRight.multiplyScalar(panX);
          const moveY = vUp.multiplyScalar(panY);
          
          this.camera.position.add(moveX);
          this.camera.position.add(moveY);
          
          this.target.add(moveX);
          this.target.add(moveY);
          
          // Update camera to look at target
          this.camera.lookAt(this.target);
      }
      
      /**
       * Zoom the camera towards/away from target
       * @param {number} delta - Zoom direction and magnitude
       */
      zoomCamera(delta) {
          // Calculate direction vector from camera to target
          const direction = new THREE.Vector3()
              .subVectors(this.target, this.camera.position)
              .normalize();
          
          // Calculate current distance
          const currentDistance = this.camera.position.distanceTo(this.target);
          
          // Calculate new distance after zoom
          let newDistance = currentDistance - delta * this.zoomSpeed;
          
          // Clamp to min/max distance
          newDistance = Math.max(this.minDistance, Math.min(this.maxDistance, newDistance));
          
          // Only update if the distance is changing
          if (Math.abs(newDistance - currentDistance) > 0.1) {
              // Scale the direction vector by the new distance
              const moveVector = direction.multiplyScalar(currentDistance - newDistance);
              
              // Apply the movement to the camera
              this.camera.position.add(moveVector);
              
              // Update camera to look at target
              this.camera.lookAt(this.target);
          }
      }
      
      /**
       * Set auto-rotation state
       * @param {boolean} enabled - Whether auto-rotation is enabled
       * @returns {boolean} - New auto-rotation state
       */
      setAutoRotation(enabled) {
          this.autoRotate = enabled;
          console.log(`Auto-rotation ${enabled ? 'enabled' : 'disabled'}`);
          return this.autoRotate;
      }
      
      /**
       * Toggle auto-rotation
       * @returns {boolean} - New auto-rotation state
       */
      toggleAutoRotation() {
          return this.setAutoRotation(!this.autoRotate);
      }
      
      /**
       * Perform auto-rotation step
       * This method is called on each animation frame
       */
      performAutoRotation() {
          if (this.autoRotate) {
              // Apply a gentle rotation on each frame
              this.rotateCamera(0.002, 0);
          }
      }
      
      /**
       * Reset camera to default position
       */
      resetToDefaultPosition() {
          // Save current position for smooth transition
          const startPosition = this.camera.position.clone();
          const startTarget = this.target.clone();
          const defaultPosition = new THREE.Vector3(0, 0, 300);
          const defaultTarget = new THREE.Vector3(0, 0, 0);
          
          // Animate to default position
          const frames = 30;
          let frame = 0;
          
          const animate = () => {
              if (frame < frames) {
                  const progress = frame / frames;
                  const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
                  
                  this.camera.position.lerpVectors(startPosition, defaultPosition, ease);
                  this.target.lerpVectors(startTarget, defaultTarget, ease);
                  
                  this.camera.lookAt(this.target);
                  
                  frame++;
                  requestAnimationFrame(animate);
              }
          };
          
          animate();
      }
      
      /**
       * Focus camera on a specific position with smooth transition
       * @param {Object} position - THREE.js Vector3 position
       */
      focusOn(position) {
          const newTarget = position.clone();
          const offset = new THREE.Vector3(0, 0, 50);
          const newPosition = newTarget.clone().add(offset);
  
          const startPosition = this.camera.position.clone();
          const startTarget = this.target.clone();
  
          const frames = 30;
          let frame = 0;
  
          const animate = () => {
              if (frame < frames) {
                  const progress = frame / frames;
                  const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
  
                  this.camera.position.lerpVectors(startPosition, newPosition, ease);
                  this.target.lerpVectors(startTarget, newTarget, ease);
  
                  this.camera.lookAt(this.target);
  
                  frame++;
                  requestAnimationFrame(animate);
              }
          };
  
          animate();
      }
      
      /**
       * Set zoom limits
       * @param {number} min - Minimum distance
       * @param {number} max - Maximum distance
       */
      setZoomLimits(min, max) {
          this.minDistance = min;
          this.maxDistance = max;
      }
      
      /**
       * Set camera speeds
       * @param {number} rotation - Rotation speed
       * @param {number} pan - Pan speed
       * @param {number} zoom - Zoom speed
       */
      setSpeeds(rotation, pan, zoom) {
          this.rotationSpeed = rotation;
          this.panSpeed = pan;
          this.zoomSpeed = zoom;
      }
  }
  
  // Make available in module and global contexts
  if (typeof module !== 'undefined') {
      module.exports = CameraController;
  } else {
      window.CameraController = CameraController;
  }