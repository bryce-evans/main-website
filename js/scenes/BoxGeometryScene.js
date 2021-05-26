class BoxGeometryScene extends THREE.Scene {
  constructor(options={}) {
    super(options);
    // Size of dummy objects
    this.size = options.size || 1;
    this.room_hue = options.room_hue || 0;
    this.geo_hue = options.geo_hue || 180;

    if (options.custom_objects) {
      for (var i = 0; i < options.custom_objects.length; i++) {
        let o = options.custom_objects[i];
        this.add(o);
      }
    }

    this.init();
  }

  makePhongMaterial(hue) {
    return new THREE.MeshPhongMaterial({color: new THREE.Color('hsl(' + hue + ', 100%, 50%)')});
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

    this.addPointLight(white, [15, 3, 0], 0.9);
    this.addPointLight(white, [-15, 3, 0], 0.9);
    this.addPointLight(white, [1, 12, 0], 1.0);
    this.addPointLight(0x1AA8FF, [-3, 3, 10], 0.4);
    this.addPointLight(white, [-3, 3, -10], .4 );

    // this.add(new THREE.AmbientLight(0x0061D6));
    this.add(new THREE.AmbientLight(blue));

    const room_mat = this.makePhongMaterial(this.room_hue);
    room_mat.side = THREE.BackSide;
    const room = new THREE.Mesh(room_geo, room_mat);
    this.add(room);

    const geo = new THREE.BoxGeometry(size, size, size);
    const mat = this.makePhongMaterial(this.geo_hue);
    // var mat = new THREE.MeshPhongMaterial({ color: new THREE.Color("white") });
    const subject = new THREE.Mesh(geo, mat);
    this.add(subject);
  }
}

export {BoxGeometryScene};
