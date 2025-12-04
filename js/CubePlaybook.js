import { RandomGeometryScene } from '../webgl-portals/examples/js/utils/RandomGeometryScene.js';
import { BoxGeometryScene } from './scenes/BoxGeometryScene.js';
import { CornellBoxScene } from './scenes/CornellBoxScene.js';

/**
 * Generator class that manages the sequence of scenes for the cube.
 * Sequence:
 * 1. Initial BoxGeometryScenes (the original colored rooms)
 * 2. 6 RandomGeometryScenes
 * 3. 6 CornellBoxScenes
 * 4. Loops back to RandomGeometryScenes, then CornellBoxScenes indefinitely
 */
class CubePlaybook {
  constructor() {
    // Track current phase: 'initial', 'random', 'cornell'
    this.phase = 'initial';

    // Counter for how many scenes have been generated in current phase
    this.phaseCount = 0;

    // Define initial scene configurations (from the original BoxGeometryScenes)
    this.initialScenes = [
      { type: 'box', params: { 'size': 5, 'room_hue': 137, 'geo_hue': 80 } },  // 0: Right (Green)
      { type: 'random', params: { 'size': 5 } },                                // 1: Left
      { type: 'box', params: { 'size': 5, 'room_hue': 350, 'geo_hue': 53 } },   // 2: Top (Red)
      { type: 'random', params: { 'size': 5 } },                                // 3: Bottom
      { type: 'box', params: { 'size': 5, 'room_hue': 219, 'geo_hue': 330 } },  // 4: Front (Blue)
      { type: 'random', params: { 'size': 5 } }                                 // 5: Back
    ];

    this.initialSceneIndex = 0;
  }

  /**
   * Get the initial scenes for the cube (called once at startup)
   */
  getInitialScenes() {
    return this.initialScenes.map(sceneConfig => {
      if (sceneConfig.type === 'box') {
        return new BoxGeometryScene(sceneConfig.params);
      } else {
        return new RandomGeometryScene(sceneConfig.params);
      }
    });
  }

  /**
   * Get the next scene in the sequence
   */
  getNextScene() {
    let scene;

    switch (this.phase) {
      case 'initial':
        // During initial phase, cycle through initial scenes
        const sceneConfig = this.initialScenes[this.initialSceneIndex];
        if (sceneConfig.type === 'box') {
          scene = new BoxGeometryScene(sceneConfig.params);
        } else {
          scene = new RandomGeometryScene(sceneConfig.params);
        }

        this.initialSceneIndex++;
        if (this.initialSceneIndex >= this.initialScenes.length) {
          this.initialSceneIndex = 0;
          this.phaseCount++;
        }

        // After one full cycle of initial scenes (6 scenes), move to random phase
        if (this.phaseCount >= 1) {
          this.phase = 'random';
          this.phaseCount = 0;
        }
        break;

      case 'random':
        scene = new RandomGeometryScene({ 'size': 5 });
        this.phaseCount++;

        // After 6 random scenes, move to cornell phase
        if (this.phaseCount >= 6) {
          this.phase = 'cornell';
          this.phaseCount = 0;
        }
        break;

      case 'cornell':
        scene = new CornellBoxScene({ 'size': 5 });
        this.phaseCount++;

        // After 6 cornell scenes, loop back to random phase
        if (this.phaseCount >= 6) {
          this.phase = 'random';
          this.phaseCount = 0;
        }
        break;
    }

    return scene;
  }

  /**
   * Get current phase information (for debugging)
   */
  getPhaseInfo() {
    return {
      phase: this.phase,
      count: this.phaseCount,
      total: this.phase === 'initial' ? this.initialScenes.length : 6
    };
  }
}

export { CubePlaybook };
