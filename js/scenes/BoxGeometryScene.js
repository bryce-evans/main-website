class BoxGeometryScene extends THREE.Scene {

    constructor(options={}) {
        super(options);
        // Size of dummy objects
        this.size = options.size || 1;
        this.room_hue = options.room_hue || 0;
        this.geo_hue = options.geo_hue || 180;

        this.init();
    }

    makePhongMaterial(hue) {
        return new THREE.MeshPhongMaterial({ color: new THREE.Color("hsl(" + hue + ", 100%, 50%)") });
    }

    addPointLight(color, position, intensity) {
        intensity = intensity || 1.0;
        var light = new THREE.PointLight(color, intensity);
        light.position.set(position[0], position[1], position[2]);
        this.add(light);
    }

    init() {
        var size = this.size;
        var room_geo = new THREE.BoxGeometry(10, 10, 10)
        var white = 0xffffff;

        this.addPointLight(white, [15, 3, 0], 0.9);
        this.addPointLight(white, [-15, 3, 0], 0.9);
        this.addPointLight(white, [1, 12, 0], 1.0);
        this.addPointLight(white, [5, 3, 10], 0.1);
        this.addPointLight(white, [-5, 3, -10], 0.1);
        
        // this.add(new THREE.AmbientLight(0x0061D6));
        this.add(new THREE.AmbientLight(0x000FFF));

        var room_mat = this.makePhongMaterial(this.room_hue);
        room_mat.side = THREE.BackSide
        var room = new THREE.Mesh(room_geo, room_mat);
        this.add(room);

        var geo = new THREE.BoxGeometry(size, size, size);
        var mat = this.makePhongMaterial(this.geo_hue);
        // var mat = new THREE.MeshPhongMaterial({ color: new THREE.Color("white") });
        var subject = new THREE.Mesh(geo, mat);
        this.add(subject);
    }
}

export { BoxGeometryScene }