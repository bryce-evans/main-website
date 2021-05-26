import {OrbitControls} from '../webgl-portals/modules/three.js/examples/jsm/controls/OrbitControls.js';
import {CubePortalLayout} from '../webgl-portals/src/layouts/CubePortalLayout.js';
import {RandomGeometryScene} from '../webgl-portals/examples/js/utils/RandomGeometryScene.js';
import {EncoderDecoderScene} from './scenes/EncoderDecoderScene.js';
import {BoxGeometryScene} from './scenes/BoxGeometryScene.js';


class MainPortalCube {
  constructor(target) {
    target = target || document.body;
    const width = target.offsetWidth;
    const height = target.offsetHeight;

    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);

    target.appendChild(this.renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = null;
    scene.add(new THREE.AmbientLight(0xffffff));
    this.scene = scene;

    // var camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    const cam_size = 50;
    const camera = new THREE.OrthographicCamera(width / -cam_size, width / cam_size, height / cam_size, height / -cam_size, 1, 1000);

    // camera.position.set(11, 2.5, 11);

    // Best position
    // camera.position.set(12.2, 5.3, 8.6);
    // Compensate for initial turn
    camera.position.set(8.6, 5.3, 12.2);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera = camera;

    this.controls = new OrbitControls(camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.03;
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    window.controls = this.controls;

    const cube_scenes = [];

    /*
        POSITIONS OF SCENES ON THE CUBE FROM INITIAL VIEW
                       .
                   .       .
               .               .
        (1) .         2            . (5)
           .   .               .   .
           .       .       .       .
           .           .           .
           .    4      .     0     .
           .           .           .
               .       .       .
                   .   .   .
                       .
                      (3)

         */

    // Green room on right
    cube_scenes.push(new BoxGeometryScene({'size': 5, 'room_hue': 137, 'geo_hue': 80}));
    
    // opposite side
    cube_scenes.push(new RandomGeometryScene({'size': 5}));

    // Red room on top
    cube_scenes.push(new BoxGeometryScene({'size': 5, 'room_hue': 350, 'geo_hue': 53}));
    
    // opposite side
    cube_scenes.push(new RandomGeometryScene({'size': 5}));

    // Blue room on left
    cube_scenes.push(new BoxGeometryScene({'size': 5, 'room_hue': 219, 'geo_hue': 330}));

    // opposite side
    cube_scenes.push(new RandomGeometryScene({'size': 5}));

    const portal_render_resolution = 1024 * window.devicePixelRatio;
    const portal_cube = new CubePortalLayout(cube_scenes, camera, this.renderer, {size: 10, resolution_height: portal_render_resolution, resolution_height: portal_render_resolution, debug_height: 256, debug_width: 256});
    scene.add(portal_cube);
    // scene.add(portal_cube.wireGeometry());
    this.portal = portal_cube;

    // var portal = new RandomGeometryScene({ "size": 5 });
    // scene.add(portal);
    // this.portal = portal;

    const debug_window = $('#debug_uvs');
    const show_uv_debug = false;
    if (show_uv_debug) {
      this.portal.renderDebugUVs(true, debug_window);
    }
    $(document).keydown(function(event) {
      if (event.which == 32) {
        // space bar: Show debug pane.
        $('#debug_uvs').show();
        this.show_debug_uvs = true;
      }
    }.bind(this));
  }
  render() {
    const camera = this.camera;
    const renderer = this.renderer;
    const controls = this.controls;
    const scene = this.scene;
    const portal = this.portal;

    // Rotate in new scenes as the cube moves around.
    this.seen = this.portal.children.map(face => face.isVisible(this.camera));

    this.swapScenes = function() {
      let visible = this.portal.children.map(face => face.isVisible(this.camera));
      for (var i = 0; i < 6; i++) {
        if (!visible[i] && this.seen[i]) {
          let old_scene = this.portal.scenes[i];
          let new_scene = new RandomGeometryScene({'size': 5});
          this.portal.scenes[i] = new_scene;
          this.portal.children[i].material.scene = new_scene;
          //delete old;
        }
      }
      this.seen = visible;
    }

    setInterval(this.swapScenes.bind(this), 2000);

    // Used to rotate the cube automatically.
    const distance = Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z);
    let rotation = Math.atan(camera.position.x / camera.position.z);

    let first_frame = true;
    let last_frame = false;
    var start_time = 0.0;

    let turn_time = 1300;
    let turn_angle = 0.7;

    function render_loop(time_ms) {

      if (first_frame && time_ms) {
        start_time = time_ms;
        first_frame = false;
      } else if (!last_frame && time_ms >= turn_time) {
        time_ms = turn_time;
        last_frame = true;
        camera.position.set(12.2, 5.3, 8.6)
      }
      controls.update();
   
      requestAnimationFrame(render_loop);

      // TODO: this is broken due to bad linking.
      // portal.rotation.y += 0.005;

      portal.onBeforeRender();

      if (time_ms - start_time < turn_time) {
        time_ms -= start_time;
        
        // console.log(time_ms);
        // var delta = Math.sqrt(1 - time_ms / turn_time) * 0.014  ;
        // rotation += delta;
        // console.log(rotation);

        // var new_x = Math.sin(rotation) * distance;
        // var new_z = Math.cos(rotation) * distance;

        // camera.position.x = new_x;
        // camera.position.z = new_z;
        

        // Runs from 1-0, decellerating
        let progress = 1 - time_ms/turn_time;
        // cubic looks better  ¯\_(ツ)_/¯
        let deccel = progress*progress*progress;
        let end_angle = deccel * turn_angle + 0.62;
        camera.position.x = Math.cos(end_angle) * distance;
        camera.position.z = Math.sin(end_angle) * distance;
        
        camera.lookAt(new THREE.Vector3(0, 0, 0));
      }

      renderer.render(scene, camera);
    }
    render_loop();
  }
}

export {MainPortalCube};
