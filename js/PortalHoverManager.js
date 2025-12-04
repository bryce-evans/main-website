import * as THREE from 'three';
import {PortalMesh} from '../webgl-portals/src/PortalMesh.js';

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
    this.mousePosition = { x: -100000, y: -100000 };
    this.previousMousePosition = { x: -100000, y: -100000 };
    this.mouseHasEntered = false;

    this.hoveredObject = null;
    this.previousHovered = null;
    this.hoveredPortal = null;

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

    // Delegate hover handling to the object's scene if it has handleHover method
    if (this.hoveredObject && mouseMoveAmount > 0.001 && mouseMoveAmount < 100) {
      const objectScene = this.findSceneForObject(this.hoveredObject);
      if (objectScene && typeof objectScene.handleHover === 'function') {
        objectScene.handleHover(this.hoveredObject, mouseMoveAmount);
      }
    }
  }

  update() {
    this.pick();
    this.updateJiggleAnimations();
  }

  findSceneForObject(object) {
    // Check if object is in main scene
    if (this.scene.getObjectById(object.id)) {
      return this.scene;
    }

    // Check portal scenes
    if (this.portalCube && this.portalCube.scenes) {
      for (const portalScene of this.portalCube.scenes) {
        if (portalScene && portalScene.getObjectById && portalScene.getObjectById(object.id)) {
          return portalScene;
        }
      }
    }

    return null;
  }

  updateJiggleAnimations() {
    const deltaTime = this.clock.getDelta();

    // Delegate animation updates to main scene if it has the method
    if (typeof this.scene.updateAnimations === 'function') {
      this.scene.updateAnimations(deltaTime);
    }

    // Delegate animation updates to portal scenes if they have the method
    if (this.portalCube && this.portalCube.scenes) {
      this.portalCube.scenes.forEach(portalScene => {
        if (portalScene && typeof portalScene.updateAnimations === 'function') {
          portalScene.updateAnimations(deltaTime);
        }
      });
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
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];

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

export { PortalHoverManager };
