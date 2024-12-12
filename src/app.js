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
import { AudioListener, Audio, AudioLoader } from 'three';
import HITHURT from './hitHurt.ogg'
import RRRHURT from './RRR.ogg'
import COFFEE from './coffeePowerup.ogg'
import GPT from './gpt.ogg'
import GRADE from './pickupGrade.ogg'
import BGMUSIC from './backgroundMusic.ogg'


// ---------------------------------------------
// Global Vars
// ---------------------------------------------
const cameraOffset = -20;
const heightOffset = 9;
// ---------------------------------------------



// Initialize core ThreeJS components
// const scene = new SeedScene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });

// Set up camera
camera.position.set(0, 15, -30);

// Set up audio
const listener = new AudioListener();
camera.add(listener);  // Attach the listener to the camera

const audioLoader = new AudioLoader();
const hitSound = new Audio(listener);
audioLoader.load(HITHURT, (buffer) => {
    hitSound.setBuffer(buffer);
    hitSound.setVolume(1);  // Adjust volume if needed
    hitSound.setLoop(false);  // Set to true if you want it to loop
});

const rrrSound = new Audio(listener);
audioLoader.load(RRRHURT, (buffer) => {
    rrrSound.setBuffer(buffer);
    rrrSound.setVolume(1);  // Adjust volume if needed
    rrrSound.setLoop(false);  // Set to true if you want it to loop
});

const coffeeSound = new Audio(listener);
audioLoader.load(COFFEE, (buffer) => {
    coffeeSound.setBuffer(buffer);
    coffeeSound.setVolume(1);  // Adjust volume if needed
    coffeeSound.setLoop(false);  // Set to true if you want it to loop
});
const gptSound = new Audio(listener);
audioLoader.load(GPT, (buffer) => {
    gptSound.setBuffer(buffer);
    gptSound.setVolume(1);  // Adjust volume if needed
    gptSound.setLoop(false);  // Set to true if you want it to loop
});
const gradeSound = new Audio(listener);
audioLoader.load(GRADE, (buffer) => {
    gradeSound.setBuffer(buffer);
    gradeSound.setVolume(1);  // Adjust volume if needed
    gradeSound.setLoop(false);  // Set to true if you want it to loop
});
// Load background music (looped indefinitely)
const backgroundMusic = new Audio(listener);
audioLoader.load(BGMUSIC, (buffer) => {
    backgroundMusic.setBuffer(buffer);
    backgroundMusic.setVolume(0.2);  // Lower the volume for background music
    backgroundMusic.setLoop(true);   // Set to loop
    backgroundMusic.play();          // Start the background music immediately
});

const scene = new SeedScene(camera, hitSound, rrrSound, coffeeSound, gptSound, gradeSound, backgroundMusic);

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
// const axesHelper = new AxesHelper(20);
// scene.add(axesHelper);

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    controls.update();
    renderer.render(scene, camera);
    scene.update && scene.update(timeStamp);

    if (scene.state.student) {
        const studentPosition = scene.state.student.state.position;
        const studentDirection = scene.state.student.state.direction;

        const cameraPosition = studentPosition
            .clone()
            .add(
                studentDirection
                    .clone()
                    .normalize()
                    .multiplyScalar(cameraOffset)
            );
        cameraPosition.y += heightOffset;

        // Smooth camera interpolation
        // TODO: adapt lerp to speed
        const smoothFactor = 0.25;
        controls.object.position.lerp(
            new Vector3(cameraPosition.x, cameraPosition.y, cameraPosition.z),
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
    }

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
