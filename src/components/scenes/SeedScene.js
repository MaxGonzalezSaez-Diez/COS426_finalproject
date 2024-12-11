import * as Dat from 'dat.gui';
import {
    Scene,
    Color,
    Vector3,
    TextureLoader,
    Sprite,
    SpriteMaterial,
} from 'three';
import { RoadChunk, Student, Cone, Oak, Bush} from 'objects';
import { BasicLights } from 'lights';
import ProceduralRoad from '../objects/ProceduralRoad/ProceduralRoad';
import Obstacle from '../objects/Cone/Cone';
import CLOUD from './cloud.png';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            // gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
            roadLength: 1000,
            totalLength: 5000,
            laneCount: 5,
            roadWidth: 20,
            student: null,
            obstacle: null,
            roadChunk: null,
            lights: null,
            roadWidth: 20,
            // cameraPos: new Vector3(),
            studentPos: new Vector3(),
            obstaclePos: new Vector3(),
            startTime: Date.now(), // track the game start time
            timeElapsed: 0,
            roadColor: null,
            sidewalkColor: 0xa0522d,
        };

        // Set background to a nice color
        this.background = new Color(0xaaaaee);

        // add clouds (just at the beginning for now)
        this.loadClouds();

        // create start screen
        this.createStartScreen();
    }

    loadClouds() {
        const loader = new TextureLoader();

        loader.load(CLOUD, (texture) => {
            const cloudMaterial = new SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: 0.8,
            });

            // Create cloud sprites and position them in the scene
            for (let i = 0; i < 20; i++) {
                const cloud = new Sprite(cloudMaterial);

                cloud.position.set(
                    Math.random() * 20 - 10, // left to right
                    Math.random() * 4 + 3, // height
                    Math.random() * -20 // since negative is on top of player at start
                );

                cloud.scale.set(
                    Math.random() * 5 + 10,
                    Math.random() * 5 + 10,
                    1
                ); // Random sizes
                this.add(cloud);
            }
        });
    }

    createStartScreen() {
        // Create a full-screen overlay for the start screen
        const startScreen = document.createElement('div');
        startScreen.id = 'start-screen';
        startScreen.style.position = 'absolute';
        startScreen.style.top = '0';
        startScreen.style.left = '0';
        startScreen.style.width = '100%';
        startScreen.style.height = '100%';
        startScreen.style.backgroundColor = 'rgba(88, 27, 0, 0.7)';
        startScreen.style.color = 'white';
        startScreen.style.display = 'flex';
        startScreen.style.justifyContent = 'center';
        startScreen.style.alignItems = 'center';
        startScreen.style.flexDirection = 'column';
        startScreen.style.zIndex = '10';
        document.body.appendChild(startScreen);

        // Add title text
        const title = document.createElement('h1');
        const welcomeText = document.createElement('span');
        welcomeText.innerHTML = 'WELCOME TO';
        welcomeText.style.fontFamily = 'Impact, sans-serif';
        welcomeText.style.fontSize = '60px';
        const princetonText = document.createElement('span');
        princetonText.innerHTML =
            '<br><span style="font-size: 120px;color: #FF6600;">PRINCETON RUN</span>';
        princetonText.style.fontFamily = 'Impact, sans-serif';
        title.appendChild(welcomeText);
        title.appendChild(princetonText);
        title.style.textAlign = 'center';
        startScreen.appendChild(title);

        // Add instructions (can change to make it more fun later)
        const instructionText = document.createElement('p');
        instructionText.innerHTML =
            'Use WASD or arrow keys to avoid the obstacles as you run!';
        instructionText.style.fontFamily = 'Courier New, Courier, monospace';
        instructionText.style.fontSize = '35px';
        startScreen.appendChild(instructionText);

        // Add start button
        const startButton = document.createElement('button');
        startButton.innerText = 'CLICK HERE TO START';
        startButton.style.padding = '30px';
        startButton.style.fontSize = '30px';
        startButton.style.fontFamily = 'Courier New, Courier, monospace';
        startButton.style.fontWeight = 'bold';
        startButton.style.backgroundColor = '##ffffff';
        startButton.style.border = 'none';
        startButton.style.cursor = 'pointer';
        startButton.style.marginTop = '40px';
        startScreen.appendChild(startButton);

        // click the start button to start the game
        startButton.addEventListener('click', () => {
            this.startGame();
            startScreen.style.display = 'none'; // Hide the start screen when clicked
        });
    }

    startGame() {
        this.state.laneWidth =
            this.state.roadWidth / (this.state.laneCount - 1);

        // Add meshes to scene
        this.state.roadChunk = new ProceduralRoad(this, {
            laneCount: this.state.laneCount,
            roadWidth: this.state.roadWidth,
            laneWidth: this.state.laneWidth,
        });

        this.state.student = new Student(this, {
            laneCount: this.state.laneCount,
            roadWidth: this.state.roadWidth,
            laneWidth: this.state.laneWidth,
        });

        this.state.lights = new BasicLights();
        this.add(this.state.lights, this.state.roadChunk, this.state.student);

        this.createTimerElement();
    }
    createTimerElement() {
        const timerElement = document.createElement('div');
        timerElement.id = 'game-timer';
        timerElement.style.position = 'absolute';
        timerElement.style.top = '10px';
        timerElement.style.right = '10px';
        timerElement.style.color = 'white';
        timerElement.style.fontSize = '20px';
        timerElement.style.fontFamily = 'Arial, sans-serif';
        timerElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        timerElement.style.padding = '10px';
        timerElement.style.borderRadius = '5px';
        timerElement.innerText = 'Time: 0s';
        document.body.appendChild(timerElement);
    }

    updateTimerElement(timeElapsed) {
        const timerElement = document.getElementById('game-timer');
        if (timerElement) {
            timerElement.innerText = `Time: ${timeElapsed.toFixed(1)}s`; // Show elapsed time with 1 decimal place
        }
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    // *** Collision Detection Method ***
    checkCollisions() {
        if (!this.state.roadChunk || !this.state.roadChunk.state.obstacles) {
            console.warn("No obstacles found!");
            return;
        }

        // Ensure the student and obstacles have updated bounding boxes
        if (this.state.student) {
            this.state.student.updateBoundingBox();
        }

        // Check each obstacle for collision
        for (const obstacle of this.state.roadChunk.state.obstacles) {
            // Update obstacle bounding box
            obstacle.updateBoundingBox();

            // Check if obstacle and student have bounding boxes
            if (this.state.student && this.state.student.boundingBox && obstacle.state.boundingBox) {
                // Perform intersection test
                if (this.state.student.boundingBox.intersectsBox(obstacle.state.boundingBox)) {
                    console.log(`Collision detected with a ${obstacle.name}!`);

                    // Stop the student
                    this.state.student.state.speed = 0;

                    // Display a big error message on the screen
                    this.showCollisionMessage();

                    // TODO: Add more collision handling logic here
                    // for example: trigger game over screen, reduce health, etc.

                    break; // Stop checking after the first collision
                }
            }
        }
    }

    showCollisionMessage() {
        const collisionMessage = document.createElement('div');
        collisionMessage.id = 'collision-message';
        collisionMessage.style.position = 'absolute';
        collisionMessage.style.top = '50%';
        collisionMessage.style.left = '50%';
        collisionMessage.style.transform = 'translate(-50%, -50%)';
        collisionMessage.style.color = 'white';
        collisionMessage.style.fontSize = '60px';
        collisionMessage.style.fontFamily = 'Impact, sans-serif';
        collisionMessage.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        collisionMessage.style.padding = '40px';
        collisionMessage.style.borderRadius = '20px';
        collisionMessage.style.zIndex = '9999';
        collisionMessage.innerText = 'COLLISION OCCURRED!';

        document.body.appendChild(collisionMessage);

        // TODO: Add more collision handling logic here
        // For example, end the game, restart level, reduce player health, etc.
    }

    update(timeStamp) {
        const { updateList } = this.state;

        if (this.state.student) {
            const stPos = this.state.student.state.position;
            this.state.studentPos.set(stPos.x, stPos.y, stPos.z);
        }
        // calculate time elapsed
        const timeElapsed = (Date.now() - this.state.startTime) / 1000; // time in seconds
        // console.log('Time Elapsed (Update method):', timeElapsed);
        this.state.timeElapsed = timeElapsed;

        // Update the timer display
        this.updateTimerElement(timeElapsed);

        for (const obj of updateList) {
            if (obj.constructor.name === 'ProceduralRoad') {
                obj.update(timeStamp, this.state.student, timeElapsed);
            } else {
                obj.update(timeStamp);
            }
        }

        this.checkCollisions();
    }
}

export default SeedScene;
