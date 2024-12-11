import * as Dat from 'dat.gui';
import {
    Scene,
    Color,
    Vector3,
    TextureLoader,
    Sprite,
    SpriteMaterial,
} from 'three';
import { RoadChunk, Student, Cone, Oak, Bush } from 'objects';
import { BasicLights } from 'lights';
import ProceduralRoad from '../objects/ProceduralRoad/ProceduralRoad';
import Clouds from '../objects/Clouds/Clouds';
import DAYSKY from './dayv7.png';
import NIGHTSKY from './night2.png';
import STORMSKY from './stormv2.png';

import COFFEE from './coffee.png';

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
            clouds: null,
            roadWidth: 20,
            // cameraPos: new Vector3(),
            studentPos: new Vector3(),
            obstaclePos: new Vector3(),
            startTime: Date.now(), // track the game start time
            timeElapsed: 0,
            roadColor: null,
            sidewalkColor: 0xa0522d,
            progressBar: null,
            coffesPerSprint: 1,
            currentBackground: 'day',
            gpa: 3.0,
            gradescollected: 1,
            distance: 0,
        };

        // Set background to a nice color
        //this.background = new Color(0xaaaaee);
        this.loadBackgroundImage(DAYSKY);

        // create start screen
        this.createStartScreen();
    }

    loadBackgroundImage(imagePath) {
        const loader = new TextureLoader();
        loader.load(imagePath, (texture) => {
            this.background = texture; // Set the background to the loaded image
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

        this.state.clouds = new Clouds(this);
        this.add(this.state.clouds); // Add clouds to the scene

        this.state.lights = new BasicLights();
        this.add(this.state.lights, this.state.roadChunk, this.state.student);

        this.createTimerElement();
        this.createGPTElement();
        this.createDistanceElement();
        this.createProgressBar(COFFEE);
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

    createGPTElement() {
        const gpa = document.createElement('div');
        gpa.id = 'game-gpa';
        gpa.style.position = 'absolute';
        gpa.style.top = '60px';
        gpa.style.right = '10px';
        gpa.style.color = 'white';
        gpa.style.fontSize = '20px';
        gpa.style.fontFamily = 'Arial, sans-serif';
        gpa.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        gpa.style.padding = '10px';
        gpa.style.borderRadius = '5px';
        gpa.innerText = 'GPA: 3.00';
        document.body.appendChild(gpa);
    }

    updateGPAElement() {
        const gpa = document.getElementById('game-gpa');
        if (gpa) {
            gpa.innerText = `GPA: ${this.state.gpa.toFixed(2)}`; // Show elapsed time with 1 decimal place
        }
    }

    createDistanceElement() {
        const gpa = document.createElement('div');
        gpa.id = 'game-dis';
        gpa.style.position = 'absolute';
        gpa.style.top = '110px';
        gpa.style.right = '10px';
        gpa.style.color = 'white';
        gpa.style.fontSize = '20px';
        gpa.style.fontFamily = 'Arial, sans-serif';
        gpa.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        gpa.style.padding = '10px';
        gpa.style.borderRadius = '5px';
        gpa.innerText = 'Distance: 0m';
        document.body.appendChild(gpa);
    }

    updateDistanceElement() {
        const gpa = document.getElementById('game-dis');
        if (gpa) {
            let realDistance = this.state.student.state.distance / 10;
            gpa.innerText = `Distance: ${realDistance.toFixed(0)}m`; // Show elapsed time with 1 decimal place
        }
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    // *** Collision Detection Method ***
    checkCollisions() {
        if (!this.state.roadChunk || !this.state.roadChunk.state.obstacles) {
            console.warn('No obstacles found!');
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
            if (
                this.state.student &&
                this.state.student.boundingBox &&
                obstacle.state.boundingBox
            ) {
                // Perform intersection test
                if (
                    this.state.student.boundingBox.intersectsBox(
                        obstacle.state.boundingBox
                    )
                ) {
                    // HERE: add to coffee count
                    if (obstacle.name == 'coffee') {
                        if (
                            obstacle.marked ||
                            this.state.student.state.powerrun
                        ) {
                            break;
                        } else {
                            obstacle.marked = true;
                            obstacle.collect();
                            this.state.tracker += 1;
                            this.updateProgressBar();
                        }
                    } else if (obstacle.name == 'grade') {
                        if (obstacle.marked) {
                            break;
                        } else {
                            obstacle.marked = true;
                            obstacle.collect();
                            let totalgrades =
                                this.state.gpa * this.state.gradescollected;
                            totalgrades += obstacle.state.numericgrade;
                            this.state.gradescollected += 1;
                            this.state.gpa =
                                totalgrades / this.state.gradescollected;
                            this.updateGPAElement();
                        }
                    } else {
                        // ---------------------------------------------------- //
                        // ---------------------------------------------------- //
                        if (this.state.student.state.powerrun) {
                            break;
                        }

                        // Stop the student
                        this.state.student.state.speed = 0;

                        // Display a big error message on the screen
                        // this.showCollisionMessage();

                        // TODO: Add more collision handling logic here
                        // for example: trigger game over screen, reduce health, etc.
                    }

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

    createProgressBar(iconSrc) {
        // Create main container for progress bar and icon
        const container = document.createElement('div');
        container.id = 'loading-container';
        container.style.position = 'absolute';
        container.style.top = '160px';
        container.style.right = '10px';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '10px';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        container.style.borderRadius = '8px';
        container.style.padding = '8px 12px';
        container.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';

        // Create icon (if provided)
        if (iconSrc) {
            const icon = document.createElement('img');
            icon.id = 'loading-icon';
            icon.src = iconSrc;
            icon.style.width = '30px';
            icon.style.height = '30px';
            icon.style.objectFit = 'contain';
            container.appendChild(icon);
        }

        // Create progress bar container
        const progressBarContainer = document.createElement('div');
        progressBarContainer.id = 'progress-bar-container';
        progressBarContainer.style.width = '150px';
        progressBarContainer.style.height = '10px';
        progressBarContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        progressBarContainer.style.borderRadius = '5px';
        progressBarContainer.style.overflow = 'hidden';

        // Create the progress bar fill
        const progressBarFill = document.createElement('div');
        progressBarFill.id = 'progress-bar-fill';
        progressBarFill.style.width = '0%';
        progressBarFill.style.height = '100%';
        progressBarFill.style.backgroundColor = '#4CAF50';
        progressBarFill.style.transition =
            'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

        // Append elements
        progressBarContainer.appendChild(progressBarFill);
        container.appendChild(progressBarContainer);
        document.body.appendChild(container);

        // Method to update progress
        this.state.progressBar = progressBarContainer;

        const style = document.createElement('style');
        style.innerHTML = `
    .pulse {
        -webkit-animation-name: pulsate;
        -webkit-animation-duration: 0.7s;
        -webkit-animation-timing-function: ease-in-out;
        -webkit-animation-iteration-count: infinite;
    }

    @-webkit-keyframes pulsate {
        0% { opacity: 0.0; }
        10% { opacity: 0.20; }
        20% { opacity: 0.40; }
        30% { opacity: 0.60; }
        40% { opacity: 0.80; }
        50% { opacity: 1.0; }
        60% { opacity: 0.80; }
        70% { opacity: 0.60; }
        80% { opacity: 0.40; }
        90% { opacity: 0.20; }
        100% { opacity: 0.0; }
    }
`;
        document.head.appendChild(style);
    }

    updateProgressBar() {
        // Calculate the progress percentage (0 to 100%)
        const progressPercentage = Math.min(
            (this.state.tracker / this.state.coffesPerSprint) * 100,
            100
        );

        // Update the progress bar width
        const progressBarFill = document.getElementById('progress-bar-fill');
        if (progressBarFill) {
            progressBarFill.style.width = `${progressPercentage}%`;
        }

        if (progressPercentage === 100) {
            if (!this.state.student.state.readyToStrint) {
                this.state.student.state.readyToStrint = true;
            }
            progressBarFill.classList.add('pulse');
            progressBarFill.style.backgroundColor = '#FF0000'; // red
        } else {
            progressBarFill.classList.remove('pulse');
            progressBarFill.style.backgroundColor = '#4CAF50';
        }

        // if (this.state.student.state.powerrun) {
        //     progressBarFill.style.width = `${0}%`;
        // }
    }

    update(timeStamp) {
        const { updateList } = this.state;

        if (!this.state.tracker) {
            this.state.tracker = 0;
        }

        if (this.state.student) {
            const stPos = this.state.student.state.position;
            this.state.studentPos.set(stPos.x, stPos.y, stPos.z);
        }
        // calculate time elapsed
        const timeElapsed = (Date.now() - this.state.startTime) / 1000; // time in seconds
        //  console.log('Time Elapsed (Update method):', timeElapsed);
        this.state.timeElapsed = timeElapsed;

        // Switch the background every 60 seconds (1 minute)
        if (Math.floor(timeElapsed / 15) % 2 === 0) {
            if (this.state.currentBackground === 'night') {
                // Generate a random number to simulate a low chance
                const randomChance = Math.random(); // Returns a number between 0 and 1

                if (randomChance < 0.5) {
                    // 10% chance (adjust this value as needed)
                    // Switch to storm background
                    this.loadBackgroundImage(STORMSKY);
                    this.state.currentBackground = 'storm';
                    //   this.state.lights.updateLighting('storm');
                } else {
                    // Switch to regular day background
                    this.loadBackgroundImage(DAYSKY);
                    this.state.currentBackground = 'day';
                    //  this.state.lights.updateLighting('day');
                }
            }
        } else {
            if (this.state.currentBackground !== 'night') {
                this.loadBackgroundImage(NIGHTSKY);
                this.state.currentBackground = 'night';
                //  this.state.lights.updateLighting('night');
            }
        }

        // Update the timer display
        this.updateTimerElement(timeElapsed);
        this.updateGPAElement();
        this.updateDistanceElement();

        for (const obj of updateList) {
            if (obj.constructor.name === 'ProceduralRoad') {
                obj.update(timeStamp, this.state.student, timeElapsed);
            } else {
                obj.update(timeStamp);
            }
        }

        this.checkCollisions();
        // Update clouds, if present
        if (this.clouds) {
            this.clouds.update(timeElapsed); // Call the clouds update function
        }
    }
}

export default SeedScene;
