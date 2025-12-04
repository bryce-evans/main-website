import { GLTFLoader } from '../../webgl-portals/modules/three.js/examples/jsm/loaders/GLTFLoader.js';

class CornellBoxScene extends THREE.Scene {
  constructor(options = {}) {
    super(options);
    this.size = options.size || 5;

    this.init();
  }

  init() {
    // Load the Cornell Box model
    const loader = new GLTFLoader();

    loader.load(
      '../../webgl-portals/examples/rsc/models/cornell-box.glb',
      (gltf) => {
        this.add(gltf.scene);
      },
      undefined,
      (error) => {
        console.error('Error loading Cornell Box model:', error);
      }
    );
  }
}

export { CornellBoxScene };
