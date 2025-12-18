import { RandomGeometryScene } from '../webgl-portals/examples/js/utils/RandomGeometryScene.js';
import { BoxGeometryScene } from './scenes/BoxGeometryScene.js';
import { CornellBoxScene } from './scenes/CornellBoxScene.js';

/**
 * Represents a single act in the scene playbook.
 * An act defines:
 * - What type of scenes to generate
 * - Minimum requirements before moving to next act
 */
class SceneAct {
  constructor(actType, options = {}) {
    this.actType = actType; // 'initial', 'random', 'cornell'

    // Minimum requirements (all must be satisfied to complete act)
    this.min_time = options.min_time || 0; // milliseconds
    this.min_sides = options.min_sides || 0; // number of scene generations
    this.min_unique = options.min_unique || 0; // number of unique cube sides requested

    // Configuration for scene generation
    this.sceneConfigs = options.sceneConfigs || [];
    this.loopScenes = options.loopScenes !== false; // whether to loop through sceneConfigs
  }

  /**
   * Generate a scene for the given side index
   */
  generateScene(sideIndex, generationCount) {
    switch (this.actType) {
      case 'initial':
        // Use specific configuration for each side
        const config = this.sceneConfigs[sideIndex];
        if (!config) return new RandomGeometryScene({ 'size': 5 });

        if (config.type === 'box') {
          return new BoxGeometryScene(config.params);
        } else {
          return new RandomGeometryScene(config.params);
        }

      case 'random':
        return new RandomGeometryScene({ 'size': 5 });

      case 'cornell':
        return new CornellBoxScene({ 'size': 5 });

      default:
        return new RandomGeometryScene({ 'size': 5 });
    }
  }
}

/**
 * Generator class that manages the sequence of scene acts for the cube.
 * Progresses through acts based on time, generation count, and unique sides.
 */
class CubePlaybook {
  constructor() {
    // Define the schedule of acts
    this.schedule = [
      // Act 1: Initial colored box scenes
      new SceneAct('initial', {
        min_sides: 6,
        min_unique: 6,
        sceneConfigs: [
          { type: 'box', params: { 'size': 5, 'room_hue': 137, 'geo_hue': 80 } },  // 0: Right (Green)
          { type: 'random', params: { 'size': 5 } },                                // 1: Left
          { type: 'box', params: { 'size': 5, 'room_hue': 350, 'geo_hue': 53 } },   // 2: Top (Red)
          { type: 'random', params: { 'size': 5 } },                                // 3: Bottom
          { type: 'box', params: { 'size': 5, 'room_hue': 219, 'geo_hue': 330 } },  // 4: Front (Blue)
          { type: 'random', params: { 'size': 5 } }                                 // 5: Back
        ]
      }),

      // Act 2: Random geometry scenes
      new SceneAct('random', {
        min_sides: 6,
        min_unique: 6
      }),

      // Act 3: Cornell box scenes
      new SceneAct('cornell', {
        min_sides: 6,
        min_unique: 6
      })

      // After this, we'll loop between random and cornell
    ];

    // Current act tracking
    this.currentActIndex = 0;
    this.actStartTime = Date.now();

    // Metrics for current act
    this.sidesGenerated = 0;
    this.uniqueSidesRequested = new Set();
  }

  /**
   * Get the initial scenes for the cube (called once at startup)
   */
  getInitialScenes() {
    const initialAct = this.schedule[0];
    return initialAct.sceneConfigs.map((config, index) => {
      return initialAct.generateScene(index, 0);
    });
  }

  /**
   * Get a scene for a specific side of the cube
   * @param {number} sideIndex - The index of the cube side (0-5)
   * @returns {THREE.Scene} The generated scene
   */
  getSceneForSide(sideIndex) {
    // Track metrics for current act
    this.sidesGenerated++;
    this.uniqueSidesRequested.add(sideIndex);

    // Check if current act is complete
    const currentAct = this.getCurrentAct();
    if (this.isActComplete(currentAct)) {
      this.moveToNextAct();
    }

    // Generate scene from current act
    return this.getCurrentAct().generateScene(sideIndex, this.sidesGenerated);
  }

  /**
   * Get the current active act
   */
  getCurrentAct() {
    return this.schedule[this.currentActIndex];
  }

  /**
   * Check if all requirements for the current act are satisfied
   */
  isActComplete(act) {
    const timeElapsed = Date.now() - this.actStartTime;

    const timeComplete = timeElapsed >= act.min_time;
    const sidesComplete = this.sidesGenerated >= act.min_sides;
    const uniqueComplete = this.uniqueSidesRequested.size >= act.min_unique;

    return timeComplete && sidesComplete && uniqueComplete;
  }

  /**
   * Move to the next act in the schedule
   */
  moveToNextAct() {
    this.currentActIndex++;

    // After reaching the end, create looping acts (random <-> cornell)
    if (this.currentActIndex >= this.schedule.length) {
      // Determine next act type (alternate between random and cornell)
      const lastAct = this.schedule[this.schedule.length - 1];
      const nextActType = lastAct.actType === 'random' ? 'cornell' : 'random';

      // Add new act to schedule
      this.schedule.push(new SceneAct(nextActType, {
        min_sides: 6,
        min_unique: 6
      }));
    }

    // Reset metrics for new act
    this.actStartTime = Date.now();
    this.sidesGenerated = 0;
    this.uniqueSidesRequested.clear();

    console.log('Moving to act:', this.currentActIndex, 'Type:', this.getCurrentAct().actType);
  }

  /**
   * Get current act information (for debugging)
   */
  getActInfo() {
    const currentAct = this.getCurrentAct();
    const timeElapsed = Date.now() - this.actStartTime;

    return {
      actIndex: this.currentActIndex,
      actType: currentAct.actType,
      timeElapsed: timeElapsed,
      sidesGenerated: this.sidesGenerated,
      uniqueSides: this.uniqueSidesRequested.size,
      requirements: {
        min_time: currentAct.min_time,
        min_sides: currentAct.min_sides,
        min_unique: currentAct.min_unique
      },
      progress: {
        time: currentAct.min_time > 0 ? (timeElapsed / currentAct.min_time * 100).toFixed(1) + '%' : 'N/A',
        sides: currentAct.min_sides > 0 ? (this.sidesGenerated / currentAct.min_sides * 100).toFixed(1) + '%' : 'N/A',
        unique: currentAct.min_unique > 0 ? (this.uniqueSidesRequested.size / currentAct.min_unique * 100).toFixed(1) + '%' : 'N/A'
      }
    };
  }
}

export { SceneAct, CubePlaybook };
