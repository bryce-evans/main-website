class EncoderDecoderScene extends THREE.Scene {
  constructor(options={}) {
    super(options);
    // Size of dummy objects
    this.size = options.size || 1;

    this.init();
  }

  init() {
    // Lights
    const light_color = 0xffffff;
    const light_intensity = 1;

    const l_pos = [[0, 3, 15], [0, 3, -15], [0, 12, 1]];
    for (var i = 0; i < l_pos.length; i++) {
      const pos = l_pos[i];
      const light = new THREE.PointLight(light_color, light_intensity);
      light.position.set(pos[0], pos[1], pos[2]);
      this.add(light);
    }
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    // directionalLight.position.set(0,-4,0);
    // this.add( directionalLight );
    this.add(new THREE.AmbientLight(0xffffff, 0.5));

    // Room
    const room_geo = new THREE.BoxGeometry(this.size * 2, this.size * 2, this.size * 2);
    const room_mat = new THREE.MeshPhongMaterial({color: new THREE.Color('#00DFFF')});
    room_mat.side = THREE.BackSide;
    const room = new THREE.Mesh(room_geo, room_mat);
    this.add(room);

    // Encoder Decoder
    const net_size = 7;
    let sum_len = 0;
    const spacing = 0.3;
    let prev_len = 0.0;
    for (var i = 0; i < net_size; i++) {
      // length from center
      const depth = (net_size-1)/2;

      const max = Math.pow(2, depth);
      const hw = (Math.pow(2, Math.abs(( depth - i )))) / 2;
      // var s = Math.abs(i - (depth)) + 0.2;

      const len = (max - Math.pow(2, Math.abs(( i - depth))))/max + 0.2;
      sum_len += prev_len/2 + len/2 + spacing;
      prev_len = len;

      const layer_geo = new THREE.BoxGeometry(hw, hw, len);
      // var hue = i * 30; // Rainbow
      const hue = Math.round(Math.random() * 30 + 13); // oranges
      const sat = Math.round(Math.random() * 10 + 90);
      const val = Math.round(Math.random() * 10 + 45);

      const mat = new THREE.MeshPhongMaterial({color: new THREE.Color(`hsl(${hue}, ${sat}%, ${val}%)`)});

      const layer = new THREE.Mesh(layer_geo, mat);
      layer.position.set(0, 0, sum_len - 6.875/2);

      this.add(layer);
    }
  }
}

export {EncoderDecoderScene};
