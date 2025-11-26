import * as THREE from 'three';
import {PortalMesh} from '../webgl-portals/src/PortalMesh.js';

/**
 * Manages hover interactions for objects inside portal scenes.
 * Based on the ObjectPicker pattern from webgl-portals examples.
 */
class PortalHoverManager {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    this.raycaster = new THREE.Raycaster();
    this.mousePosition = { x: 0, y: 0 };

    this.hoveredObject = null;
    this.previousHovered = null;
    this.hoveredPortal = null;

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

    // Convert to normalized device coordinates (-1 to +1)
    this.mousePosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mousePosition.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  update() {
    this.pick();
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

    this.updateHoverEffects();
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

    // Handle both single material and material arrays
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];

    materials.forEach(material => {
      if (isHovered) {
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

export { PortalHoverManager };
