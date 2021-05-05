import { Controls } from './webgl-portals/examples/js/utils/Controls.js';
import { CubePortalLayout } from './webgl-portals/src/layouts/CubePortalLayout.js';
import { RandomGeometryScene } from './webgl-portals/examples/js/utils/RandomGeometryScene.js';


class MainPortalCube {
    constructor(target) {
        target = target || document.body;
        var width = target.offsetWidth;
        var height = target.offsetHeight;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true  });
        this.renderer.setClearColor(0xffffff, 0);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        
        target.appendChild(this.renderer.domElement);

        var scene = new THREE.Scene();
        scene.background = null;
        scene.add(new THREE.AmbientLight(0xffffff));
        this.scene = scene;

        //var camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
        var cam_size = 50;
        var camera = new THREE.OrthographicCamera(width / -cam_size, width / cam_size, height / cam_size, height / -cam_size, 1, 1000);

        camera.position.set(11, 2.5, 11);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.camera = camera;

        // this.controls = new Controls(camera, this.renderer);
        // this.controls.addListeners();

        var cube_scenes = [];
        for (var i = 0; i < CubePortalLayout.maxScenes(); i++) {
            cube_scenes.push(new RandomGeometryScene({ "size": 5 }));
        }

        const portal_render_resolution = 1048 * window.devicePixelRatio;
        var portal_cube = new CubePortalLayout(cube_scenes, camera, this.renderer, { size: 10, resolution_height: portal_render_resolution, resolution_height: portal_render_resolution, debug_height: 256, debug_width: 256 });
        scene.add(portal_cube);
        // scene.add(portal_cube.wireGeometry());
        this.portal = portal_cube;

        // var portal = new RandomGeometryScene({ "size": 5 });
        // scene.add(portal);
        // this.portal = portal;

        var debug_window = $("#debug_uvs");
        var show_uv_debug = false;
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
        var camera = this.camera;
        var renderer = this.renderer;
        // var controls = this.controls;
        var scene = this.scene;
        var portal = this.portal;
        var rotation = 0.0;

        function render_loop() {
            //controls.update();
            requestAnimationFrame(render_loop)

            portal.onBeforeRender();
            var delta = 0.005;
            rotation += delta;

            
            var new_x = Math.sin(rotation) * 11;
            var new_z = Math.cos(rotation) * 11;

            camera.position.x = new_x;
            camera.position.z = new_z;
            camera.lookAt(new THREE.Vector3(0, 0, 0));
            
            renderer.render(scene, camera);
        }
        render_loop();
    }
}

export { MainPortalCube }