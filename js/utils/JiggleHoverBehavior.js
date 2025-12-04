import * as THREE from 'three';

/**
 * Helper class that provides jiggle hover behavior for scenes.
 * Scenes can instantiate this and delegate hover/animation calls to it.
 */
class JiggleHoverBehavior {
  constructor(scene, options = {}) {
    this.scene = scene;

    // Animation parameters
    this.jiggleDecayHalfLife = options.jiggleDecayHalfLife || 0.5;
    this.jiggleIncreaseAmount = options.jiggleIncreaseAmount || 0.25;
    this.maxJiggle = options.maxJiggle || 3.5;
    this.cyclesPerSecond = options.cyclesPerSecond || 2.5;

    this.clock = new THREE.Clock();
  }

  isInnerGeometry(object) {
    // Filter out room/background objects (they use BackSide material)
    if (!object.material) return false;

    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];

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
    const progressToMax = (object._jiggle - 1.0) / (this.maxJiggle - 1.0);
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

  updateAnimations(deltaTime) {
    this.scene.traverse((obj) => {
      if (obj._jiggle !== undefined) {
        this.applyJiggleAnimation(obj, deltaTime);
      }
    });
  }

  applyJiggleAnimation(object, deltaTime) {
    if (!object._originalScale) return;

    // Exponential decay using half-life
    const decayFactor = Math.pow(0.5, deltaTime / this.jiggleDecayHalfLife);
    object._jiggle = 1.0 + (object._jiggle - 1.0) * decayFactor;

    // Update phase
    object._jigglePhase += deltaTime * Math.PI * 2 * this.cyclesPerSecond;
    object._jigglePhase = object._jigglePhase % (Math.PI * 2);

    // Oscillation from -1 to +1
    const oscillation = Math.sin(object._jigglePhase);

    // Exponential scale
    const logJiggle = Math.log2(object._jiggle);
    const scaleMultiplier = Math.pow(2, logJiggle * oscillation);

    // Apply scale
    object.scale.copy(object._originalScale).multiplyScalar(scaleMultiplier);

    // Debug
    if (Math.abs(scaleMultiplier - 1.0) > 0.01) {
      console.log('Jiggle:', object._jiggle.toFixed(3), 'Scale:', scaleMultiplier.toFixed(3));
    }

    // Clean up when jiggle is very close to baseline
    if (object._jiggle <= 1.001) {
      object.scale.copy(object._originalScale);
      delete object._jiggle;
      delete object._jigglePhase;
      delete object._originalScale;
    }
  }
}

export { JiggleHoverBehavior };
