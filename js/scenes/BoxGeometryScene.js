import { JiggleHoverBehavior } from '../utils/JiggleHoverBehavior.js';

class BoxGeometryScene extends THREE.Scene {
  constructor(options = {}) {
    super(options);
    // Size of dummy objects
    this.size = options.size || 1;
    this.room_hue = options.room_hue || 0;
    this.geo_hue = options.geo_hue || 180;

    // Add jiggle hover behavior
    this.jiggleBehavior = new JiggleHoverBehavior(this);

    if (options.custom_objects) {
      for (var i = 0; i < options.custom_objects.length; i++) {
        let o = options.custom_objects[i];
        this.add(o);
      }
    }

    this.init();
  }

  makePhongMaterial(hue) {
    const color = new THREE.Color('hsl(' + hue + ', 100%, 60%)');
    return new THREE.MeshPhongMaterial({
      color: color,
      flatShading: false,
      specular: 0x000,
    });
  }

  addPointLight(color, position, intensity) {
    intensity = intensity || 1.0;
    const light = new THREE.PointLight(color, intensity);
    light.position.set(position[0], position[1], position[2]);
    this.add(light);
  }

  init() {
    const size = this.size;
    const room_geo = new THREE.BoxGeometry(10, 10, 10);
    const white = 0xffffff;

    const blue = 0x000FFF;

    this.addPointLight(white, [15, 3, 0], 500);
    this.addPointLight(white, [-15, 3, 0], 600);
    this.addPointLight(white, [1, 12, 0], 400);
    this.addPointLight(0x1AA8FF, [-3, 3, 10], 400);
    this.addPointLight(blue, [-3, 3, -10], 1200);
    this.add(new THREE.AmbientLight(blue));

    // // Much brighter dramatic lighting
    // this.addPointLight(white, [8, 10, 6], 178.0);
    // this.addPointLight(white, [-8, -2, -6], 30.0);

    // Low ambient to maintain contrast
    // this.add(new THREE.AmbientLight(white, 0.15));

    const room_mat = this.makePhongMaterial(this.room_hue);
    room_mat.side = THREE.BackSide;
    const room = new THREE.Mesh(room_geo, room_mat);
    this.add(room);

    const geo = new THREE.BoxGeometry(size, size, size);
    const mat = this.makePhongMaterial(this.geo_hue);
    const subject = new THREE.Mesh(geo, mat);
    this.add(subject);
  }

  // Hover interaction methods - called by PortalHoverManager
  handleHover(object, mouseMoveAmount) {
    if (this.jiggleBehavior) {
      this.jiggleBehavior.increaseJiggle(object, mouseMoveAmount);
    }
  }

  updateAnimations(deltaTime) {
    if (this.jiggleBehavior) {
      this.jiggleBehavior.updateAnimations(deltaTime);
    }
  }
}

export {
  BoxGeometryScene
};
