/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SeedScene } from 'scenes';
import { AxesHelper } from 'three';

// ---------------------------------------------
// Global Vars
// ---------------------------------------------
const cameraOffset = -20; 
const heightOffset = 9;  
// ---------------------------------------------

// Initialize core ThreeJS components
const scene = new SeedScene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });

// Set up camera
camera.position.set(0, 15, -30);

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// Set up controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 1000000;
controls.update();

// Create and add axes helper to the scene
const axesHelper = new AxesHelper(20);
scene.add(axesHelper);

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    controls.update();
    renderer.render(scene, camera);
    scene.update && scene.update(timeStamp);

    const studentPosition = scene.state.student.state.position;
    const studentDirection = scene.state.student.state.direction;

    const cameraPosition = studentPosition.clone().add(
        studentDirection.clone().normalize().multiplyScalar(cameraOffset)
    );
    cameraPosition.y += heightOffset;

    // Smooth camera interpolation
    // TODO: adapt lerp to speed
    const smoothFactor = 0.25; 
    controls.object.position.lerp(
        new Vector3(
            cameraPosition.x,
            cameraPosition.y,
            cameraPosition.z
        ), 
        smoothFactor
    );

    controls.target.lerp(
        new Vector3(
            studentPosition.x,
            studentPosition.y,
            studentPosition.z
        ), 
        smoothFactor
    );

    window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);
