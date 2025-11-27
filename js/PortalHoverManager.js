import * as THREE from 'three';
import {
  PortalMesh
} from '../webgl-portals/src/PortalMesh.js';

/**
 * Manages hover interactions for objects inside portal scenes.
 */
class PortalHoverManager {
  constructor(renderer, scene, camera, portalCube = null) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.portalCube = portalCube;

    this.raycaster = new THREE.Raycaster();
    // Initialize mouse off-screen so nothing is highlighted on load
    this.mousePosition = {
      x: -100000,
      y: -100000
    };
    this.previousMousePosition = {
      x: -100000,
      y: -100000
    };
    this.mouseHasEntered = false;

    this.hoveredObject = null;
    this.previousHovered = null;
    this.hoveredPortal = null;

    // Animation parameters
    this.jiggleDecayHalfLife = 0.5; // Time in seconds for jiggle to halve
    this.jiggleIncreaseAmount = 0.25;
    this.maxJiggle = 3.5;
    this.cyclesPerSecond = 2.5;

    this.clock = new THREE.Clock();

    this.setupEventListeners();
  }

  setupEventListeners() {
    const canvas = this.renderer.domElement;

    canvas.addEventListener('mousemove', (e) => {
      this.onMouseMove(e);
    });

    canvas.addEventListener('mouseleave', () => {
      this.clearHover();
    });
  }

  onMouseMove(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();

    // Mark that mouse has entered the canvas
    this.mouseHasEntered = true;

    // Store previous position
    this.previousMousePosition.x = this.mousePosition.x;
    this.previousMousePosition.y = this.mousePosition.y;

    // Convert to normalized device coordinates (-1 to +1)
    this.mousePosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mousePosition.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Calculate mouse movement (only if mouse was already on canvas)
    const dx = this.mousePosition.x - this.previousMousePosition.x;
    const dy = this.mousePosition.y - this.previousMousePosition.y;
    const mouseMoveAmount = Math.sqrt(dx * dx + dy * dy);

    // Increase jiggle on hovering object if mouse is moving
    if (this.hoveredObject && mouseMoveAmount > 0.001 && mouseMoveAmount < 100) {
      this.increaseJiggle(this.hoveredObject, mouseMoveAmount);
    }
  }

  update() {
    this.pick();
    this.updateJiggleAnimations();
  }

  isInnerGeometry(object) {
    // Filter out room/background objects (they use BackSide material)
    if (!object.material) return false;

    const materials = Array.isArray(object.material) ?
      object.material : [object.material];

    // Room objects use BackSide rendering
    return !materials.some(mat => mat.side === THREE.BackSide);
  }

  initializeJiggle(object) {
    if (!object._jiggle) {
      object._jiggle = 1.0;
      object._jigglePhase = 0.0;
      object._originalScale = object.scale.clone();
    }
  }

  increaseJiggle(object, amount) {
    if (!this.isInnerGeometry(object)) return;

    this.initializeJiggle(object);

    const oldJiggle = object._jiggle;

    // Non-linear growth: easy to start, hard to max out
    // Calculate how close we are to max (0 = at baseline, 1 = at max)
    const progressToMax = (object._jiggle - 1.0) / (this.maxJiggle - 1.0);

    // Cubic falloff - gets harder to increase as jiggle grows
    const scalingFactor = Math.pow(1 - progressToMax, 3);

    // Apply scaled increase
    object._jiggle += amount * this.jiggleIncreaseAmount * scalingFactor;

    // Cap at max value
    object._jiggle = Math.min(object._jiggle, this.maxJiggle);

    // Debug
    if (object._jiggle > oldJiggle) {
      console.log('Jiggle:', object._jiggle.toFixed(2), 'scaling:', scalingFactor.toFixed(2));
    }
  }

  updateJiggleAnimations() {
    const deltaTime = this.clock.getDelta();

    // Update objects in main scene
    this.scene.traverse((obj) => {
      if (obj._jiggle !== undefined) {
        this.applyJiggleAnimation(obj, deltaTime);
      }
    });

    // Update objects in portal scenes
    if (this.portalCube && this.portalCube.scenes) {
      this.portalCube.scenes.forEach(portalScene => {
        if (portalScene && portalScene.traverse) {
          portalScene.traverse((obj) => {
            if (obj._jiggle !== undefined) {
              this.applyJiggleAnimation(obj, deltaTime);
            }
          });
        }
      });
    }
  }

  applyJiggleAnimation(object, deltaTime) {
    if (!object._originalScale) return;

    // Exponential decay using half-life
    // jiggle(t) = 1 + (jiggle(0) - 1) * 0.5^(t / halfLife)
    const decayFactor = Math.pow(0.5, deltaTime / this.jiggleDecayHalfLife);
    object._jiggle = 1.0 + (object._jiggle - 1.0) * decayFactor;

    // Update phase - completes cycles based on cyclesPerSecond
    object._jigglePhase += deltaTime * Math.PI * 2 * this.cyclesPerSecond;
    object._jigglePhase = object._jigglePhase % (Math.PI * 2);

    // Oscillation from -1 to +1
    const oscillation = Math.sin(object._jigglePhase);

    // Exponential scale: 2^(log2(jiggle) * sin(phase))
    // If jiggle=2: scale varies from 0.5 to 2.0
    // If jiggle=4: scale varies from 0.25 to 4.0
    const logJiggle = Math.log2(object._jiggle);
    const scaleMultiplier = Math.pow(2, logJiggle * oscillation);

    // Apply scale
    object.scale.copy(object._originalScale).multiplyScalar(scaleMultiplier);

    // Debug - log scale changes
    if (Math.abs(scaleMultiplier - 1.0) > 0.01) {
      console.log('Jiggle:', object._jiggle.toFixed(3), 'Scale:', scaleMultiplier.toFixed(3));
    }

    // Clean up only when jiggle is very close to baseline
    if (object._jiggle <= 1.001 && object !== this.hoveredObject) {
      object.scale.copy(object._originalScale);
      delete object._jiggle;
      delete object._jigglePhase;
      delete object._originalScale;
    }
  }

  pick() {
    this.previousHovered = this.hoveredObject;
    this.hoveredObject = null;
    this.hoveredPortal = null;

    // Raycast from camera through mouse position
    this.raycaster.setFromCamera(this.mousePosition, this.camera);
    let intersects = this.raycaster.intersectObjects(this.scene.children, true);

    // Recursive portal raycasting - step through portals
    let maxPortalDepth = 3;
    while (intersects.length && maxPortalDepth > 0) {
      const hitObject = intersects[0].object;

      if (hitObject instanceof PortalMesh) {
        // We hit a portal face - raycast into its internal scene
        this.hoveredPortal = hitObject;

        // Get the portal's internal scene
        const portalScene = hitObject.material.scene;

        // Raycast into the portal's scene
        intersects = this.raycaster.intersectObjects(portalScene.children, true);
        maxPortalDepth--;
      } else {
        // Found a non-portal object (object inside portal or in main scene)
        this.hoveredObject = hitObject;
        break;
      }
    }

    // highlight hovered objects.
    // this.updateHoverEffects();
  }

  updateHoverEffects() {
    // Remove hover effect from previously hovered object
    if (this.previousHovered && this.previousHovered !== this.hoveredObject) {
      this.setHoverState(this.previousHovered, false);
    }

    // Apply hover effect to newly hovered object
    if (this.hoveredObject) {
      this.setHoverState(this.hoveredObject, true);
    }
  }

  setHoverState(object, isHovered) {
    if (!object.material) return;

    // Only apply hover effect to inner geometry, not rooms
    if (!this.isInnerGeometry(object)) return;

    // Handle both single material and material arrays
    const materials = Array.isArray(object.material) ?
      object.material : [object.material];

    materials.forEach(material => {
      if (isHovered) {
        // Initialize jiggle on hover
        this.initializeJiggle(object);

        // Store original color
        if (!object._originalColor) {
          object._originalColor = material.color.getHex();
        }

        // Set to white
        material.color.setHex(0xffffff);
        material.needsUpdate = true;
      } else {
        // Restore original color
        if (object._originalColor !== undefined) {
          material.color.setHex(object._originalColor);
          material.needsUpdate = true;
          delete object._originalColor;
        }
      }
    });
  }

  clearHover() {
    // Move mouse position off-screen
    this.mousePosition.x = -100000;
    this.mousePosition.y = -100000;
    this.mouseHasEntered = false;

    if (this.hoveredObject) {
      this.setHoverState(this.hoveredObject, false);
      this.hoveredObject = null;
    }
    this.hoveredPortal = null;
  }

  getHoveredObject() {
    return this.hoveredObject;
  }

  getHoveredPortal() {
    return this.hoveredPortal;
  }
}

export {
  PortalHoverManager
};
