import * as THREE from 'three';
import {OrbitControls} from '../webgl-portals/modules/three.js/examples/jsm/controls/OrbitControls.js';
import {CubePortalLayout} from '../webgl-portals/src/layouts/CubePortalLayout.js';
import {RandomGeometryScene} from '../webgl-portals/examples/js/utils/RandomGeometryScene.js';
import {EncoderDecoderScene} from './scenes/EncoderDecoderScene.js';
import {BoxGeometryScene} from './scenes/BoxGeometryScene.js';
import {PortalHoverManager} from './PortalHoverManager.js';


class MainPortalCube {
  constructor(target) {
    target = target || document.body;
    const width = target.offsetWidth;
    const height = target.offsetHeight;

    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;

    target.appendChild(this.renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = null;
    scene.add(new THREE.AmbientLight(0xffffff));
    this.scene = scene;

    // var camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    var cam_size;
    if (window.mobileAndTabletCheck()) {
      cam_size = 75;
    } else {
      cam_size = 50;
    }
    
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
    const portal_cube = new CubePortalLayout(cube_scenes, camera, this.renderer, {size: 10, resolution_width: portal_render_resolution, resolution_height: portal_render_resolution, debug_height: 256, debug_width: 256});
    scene.add(portal_cube);
    // scene.add(portal_cube.wireGeometry());
    this.portal = portal_cube;

    const debug_window = $('#debug_uvs');
    const show_uv_debug = false;
    if (show_uv_debug) {
      this.portal.renderDebugUVs(true, debug_window);
    }

    this.debug_mode = false;
    this.debug_scene_index = -1;

    this.hoverManager = new PortalHoverManager(this.renderer, scene, camera);

    $(document).keydown(function(event) {
      if (event.which == 32) {
        // space bar: Show debug pane.
        $('#debug_uvs').show();
        this.show_debug_uvs = true;
      }
      // D key: Toggle debug mode
      if (event.which == 68) {
        this.debug_mode = !this.debug_mode;
        this.debug_scene_index = -1;
        console.log('Debug mode:', this.debug_mode ? 'ON' : 'OFF');

        // Show/hide debug indicator
        if (this.debug_mode) {
          $('#debug-indicator').show();
          $('#debug-scene').text('Press 1-6 for scenes, 0 for all');
          console.log('Press 1-6 to view individual portal scenes, 0 to view all');
        } else {
          $('#debug-indicator').hide();
        }
      }
      // Number keys 0-6: Select scene to debug
      if (this.debug_mode && event.which >= 48 && event.which <= 54) {
        this.debug_scene_index = event.which - 48 - 1; // 0 key = -1 (all scenes)
        if (this.debug_scene_index === -1) {
          $('#debug-scene').text('Viewing: Portal cube (all scenes)');
          console.log('Viewing: Portal cube (all scenes)');
        } else {
          const sceneNames = ['Right (Green)', 'Random', 'Top (Red)', 'Random', 'Left (Blue)', 'Random'];
          $('#debug-scene').text('Scene ' + (this.debug_scene_index + 1) + ': ' + sceneNames[this.debug_scene_index]);
          console.log('Viewing scene', this.debug_scene_index, ':', sceneNames[this.debug_scene_index]);
        }
      }
    }.bind(this));
  }
  render() {
    const camera = this.camera;
    const renderer = this.renderer;
    const controls = this.controls;
    const scene = this.scene;
    const portal = this.portal;
    const self = this;

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

    setInterval(this.swapScenes.bind(this), 500);

    // Used to rotate the cube automatically.
    const distance = Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z);
    let rotation = Math.atan(camera.position.x / camera.position.z);

    let first_frame = true;
    let last_frame = false;
    var start_time = 0.0;

    let turn_time = 2200;
    let turn_angle = 0.7;

    function render_loop(time_ms) {

      // if (first_frame && time_ms) {
      //   // Set the start time the first time this runs.
      //   start_time = time_ms;
      //   first_frame = false;
      //   console.log("started. start time:", start_time);
      // } else if (!last_frame && time_ms - start_time >= turn_time) {
      //   last_frame = true;
      // }
      controls.update();
      self.hoverManager.update();

      requestAnimationFrame(render_loop);

      // const turn_speed = 0.007;
      // portal.rotation.y -= turn_speed;
      // for(const p of portal.scenes){
      //   p.rotation.y -= turn_speed;
      // }

      if (self.debug_mode && self.debug_scene_index >= 0 && self.debug_scene_index < 6) {
        renderer.render(portal.scenes[self.debug_scene_index], camera);
      } else {
        portal.onBeforeRender();
        renderer.render(scene, camera);
      }


      if (time_ms - start_time < turn_time) {
        console.log(time_ms);
        time_ms = Math.max(0, time_ms - start_time);
        
        
        var delta = Math.sqrt(1 - time_ms / turn_time) * 0.014  ;
        rotation += delta;
        console.log(rotation);

        var new_x = Math.sin(rotation) * distance;
        var new_z = Math.cos(rotation) * distance;

        camera.position.x = new_x;
        camera.position.z = new_z;
        

        // Runs from 1-0, decellerating
        let progress = 1 - time_ms/turn_time;
        // cubic looks better  ¯\_(ツ)_/¯
        let deccel = progress*progress*progress;
        let end_angle = deccel * turn_angle + 0.62;
        camera.position.x = Math.cos(end_angle) * distance;
        camera.position.z = Math.sin(end_angle) * distance;
        
        camera.lookAt(new THREE.Vector3(0, 0, 0));
      }

      if (!self.debug_mode || self.debug_scene_index === -1) {
        renderer.render(scene, camera);
      }
    }
    render_loop();
  }
}

export {MainPortalCube};
