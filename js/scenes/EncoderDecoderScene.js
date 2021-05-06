class EncoderDecoderScene extends THREE.Scene {

    constructor(options={}) {
        super(options);
        // Size of dummy objects
        this.size = options.size || 1;

        this.init();
    }

    init() {
        // Lights
        var light_color = 0xffffff;
        var light_intensity = 1;

        var l_pos = [[0, 3, 15], [0, 3, -15], [0, 12, 1]];
        for (var i = 0; i < l_pos.length; i++) {
            var pos = l_pos[i];
            var light = new THREE.PointLight(light_color, light_intensity);
            light.position.set(pos[0], pos[1], pos[2]);
            this.add(light);
        }
        const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
        // directionalLight.position.set(0,-4,0);
        // this.add( directionalLight );
        this.add(new THREE.AmbientLight(0xffffff, 0.5));

        // Room
        var room_geo = new THREE.BoxGeometry(this.size * 2, this.size * 2, this.size * 2);
        var room_mat = new THREE.MeshPhongMaterial({ color: new THREE.Color("#00DFFF") });
        room_mat.side = THREE.BackSide
        var room = new THREE.Mesh(room_geo, room_mat);
        this.add(room);
 
        // Encoder Decoder
        var net_size = 7;
        var sum_len = 0;
        var spacing = 0.3;
        var prev_len = 0.0;
        for (var i = 0; i < net_size; i++) {
            // length from center
            var depth = (net_size-1)/2;
            
            var max = Math.pow(2, depth);
            var hw = (Math.pow(2, Math.abs(( depth - i )))) / 2;
            // var s = Math.abs(i - (depth)) + 0.2;
            
            var len =  (max - Math.pow(2, Math.abs(( i - depth))))/max + 0.2;
            sum_len += prev_len/2 + len/2 + spacing;
            prev_len = len;
            
            var layer_geo = new THREE.BoxGeometry(hw, hw, len);
            // var hue = i * 30; // Rainbow
            var hue = Math.round(Math.random() * 30 + 13); // oranges
            var sat = Math.round(Math.random() * 10 + 90);
            var val = Math.round(Math.random() * 10 + 45);

            var mat = new THREE.MeshPhongMaterial({ color: new THREE.Color(`hsl(${hue}, ${sat}%, ${val}%)`) });
            
            var layer = new THREE.Mesh(layer_geo, mat);
            layer.position.set(0, 0, sum_len - 6.875/2);
        
            this.add(layer);
        }
        
    }
}

export { EncoderDecoderScene }