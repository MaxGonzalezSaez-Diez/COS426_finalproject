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
            coffesPerSprint: 10,
            currentBackground: 'day',
            gpa: 3.0,
            lives: 3,
            gradescollected: 1,
            distance: 0,
            notgpt: 1,
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

        startButton.addEventListener('mouseover', () => {
            startButton.style.backgroundColor = '#FF6600';
            startButton.style.color = '#ffffff';
        });
        startButton.addEventListener('mouseout', () => {
            startButton.style.backgroundColor = '#ffffff';
            startButton.style.color = '#000000';
        });

        // Add functionality to restart the game
        startButton.addEventListener('click', () => {
            this.startGame();
            startScreen.style.display = 'none';
        });
    }

    showEndScreen(reason) {
        // end screen overlay like the start screen (does not remove ui elements)
        if (document.getElementById('end-screen')) return;

        // calculate final stats
        const finalCoffees = this.state.tracker || 0;
        const finalGPA = this.state.gpa.toFixed(2);
        const finalDistance = (this.state.student.state.distance / 10).toFixed(
            0
        );

        const endScreen = document.createElement('div');
        endScreen.id = 'end-screen';
        endScreen.style.position = 'absolute';
        endScreen.style.top = '0';
        endScreen.style.left = '0';
        endScreen.style.width = '100%';
        endScreen.style.height = '100%';
        endScreen.style.backgroundColor = 'rgba(88, 27, 0, 0.7)';
        endScreen.style.color = 'white';
        endScreen.style.display = 'flex';
        endScreen.style.justifyContent = 'center';
        endScreen.style.alignItems = 'center';
        endScreen.style.flexDirection = 'column';
        endScreen.style.zIndex = '10';
        document.body.appendChild(endScreen);

        // GAME OVER
        const title = document.createElement('h1');
        const gameOverText = document.createElement('span');
        if (reason == 'RRR') {
            gameOverText.innerHTML = 'Oh no...the honor code got you...';
        } else if (reason == 'wall') {
            gameOverText.innerHTML =
                'You hit a wall while running across campus';
        } else if (reason == 'gpt') {
            gameOverText.innerHTML =
                'You got caught using generative AI during an exam! Bad!';
        } else {
            gameOverText.innerHTML = 'GAME OVER';
        }
        gameOverText.style.fontFamily = 'Impact, sans-serif';
        gameOverText.style.fontSize = '80px';
        title.appendChild(gameOverText);
        title.style.textAlign = 'center';
        endScreen.appendChild(title);

        const finalscore = finalGPA * finalDistance * this.state.notgpt;
        // final stats
        const statsText = document.createElement('p');
        statsText.innerHTML = `
        <div style="text-align: left;">
        Coffees Collected: ${finalCoffees}<br>
        Final GPA: ${finalGPA}<br>
        Distance Traveled: ${finalDistance}m<br>
        <b>Final Score: ${finalscore.toFixed(0)}</b> 
        </div>
        `;
        statsText.style.fontFamily = 'Courier New, Courier, monospace';
        statsText.style.fontSize = '35px';
        statsText.style.textAlign = 'center';
        endScreen.appendChild(statsText);

        // add "Try Again" button
        const tryAgainButton = document.createElement('button');
        tryAgainButton.innerText = 'TRY AGAIN';
        tryAgainButton.style.padding = '30px';
        tryAgainButton.style.fontSize = '30px';
        tryAgainButton.style.fontFamily = 'Courier New, Courier, monospace';
        tryAgainButton.style.fontWeight = 'bold';
        tryAgainButton.style.backgroundColor = '##ffffff';
        tryAgainButton.style.border = 'none';
        tryAgainButton.style.cursor = 'pointer';
        tryAgainButton.style.marginTop = '40px';

        // add hover effects
        tryAgainButton.addEventListener('mouseover', () => {
            tryAgainButton.style.backgroundColor = '#FF6600';
            tryAgainButton.style.color = '#ffffff';
        });
        tryAgainButton.addEventListener('mouseout', () => {
            tryAgainButton.style.backgroundColor = '#ffffff';
            tryAgainButton.style.color = '#000000';
        });

        // Add functionality to restart the game
        tryAgainButton.addEventListener('click', () => {
            this.resetGame();
        });

        endScreen.appendChild(tryAgainButton);
    }

    startGame() {
        this.createRightSideBackground();

        this.state.laneWidth =
            this.state.roadWidth / (this.state.laneCount - 1);

        // add meshes to scene
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
        this.add(this.state.clouds); // add clouds to the scene

        this.state.lights = new BasicLights();
        this.add(this.state.lights, this.state.roadChunk, this.state.student);
        this.state.startTime = Date.now();
        this.createTimerElement();
        this.createGPTElement();
        this.createDistanceElement();
        this.createLivesElement();
        this.updateLivesElement();
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

    createRightSideBackground() {
        const backgroundBox = document.createElement('div');
        backgroundBox.id = 'right-side-background';
        backgroundBox.style.position = 'absolute';
        backgroundBox.style.top = '0px';
        backgroundBox.style.right = '0px';
        backgroundBox.style.width = '235px';
        backgroundBox.style.backgroundColor = 'rgba(233, 229, 205, 0.8)';
        backgroundBox.style.borderRadius = '0px';
        backgroundBox.style.zIndex = '0'; // Ensure it's behind other elements but in front of the game

        // Make it tall enough to cover all the elements
        backgroundBox.style.height = '250px';

        // Insert it before other elements are added
        document.body.insertBefore(backgroundBox, document.body.firstChild);
    }

    createGPTElement() {
        const gpa = document.createElement('div');
        gpa.id = 'game-gpa';
        gpa.style.position = 'absolute';
        gpa.style.top = '100px';
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
        gpa.style.top = '55px';
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

    createLivesElement() {
        const livesElement = document.createElement('div');
        livesElement.id = 'game-lives';
        livesElement.style.position = 'absolute';
        livesElement.style.top = '145px';
        livesElement.style.right = '10px';
        livesElement.style.color = 'white';
        livesElement.style.fontSize = '20px';
        livesElement.style.fontFamily = 'Arial, sans-serif';
        livesElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        livesElement.style.padding = '10px';
        livesElement.style.borderRadius = '5px';

        document.body.appendChild(livesElement);
    }

    updateLivesElement() {
        const livesElement = document.getElementById('game-lives');
        if (!livesElement) return;

        // Clear existing content
        livesElement.innerHTML = 'Lives: ';

        // Add hearts (red for remaining lives, gray for lost lives)
        for (let i = 0; i < 3; i++) {
            const heart = document.createElement('span');
            heart.innerHTML = i < this.state.lives ? '❤️' : '🖤'; // Red heart for lives, black heart for lost
            heart.style.marginRight = '5px'; // Add spacing between hearts
            livesElement.appendChild(heart);
        }
    }

    // *** Collision Detection Method ***
    checkCollisions() {
        if (!this.state.roadChunk || !this.state.roadChunk.state.obstacles) {
            return;
        }

        // Ensure the student and obstacles have updated bounding boxes
        if (this.state.student) {
            this.state.student.updateBoundingBox();
        }

        // check each obstacle for collision
        for (const obstacle of this.state.roadChunk.state.obstacles) {
            // update obstacle bounding box
            obstacle.updateBoundingBox();

            // check if obstacle and student have bounding boxes
            if (
                this.state.student &&
                this.state.student.boundingBox &&
                obstacle.state.boundingBox
            ) {
                // perform intersection test
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
                        if (
                            obstacle.marked ||
                            this.state.student.state.powerrun
                        ) {
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
                    } else if (obstacle.name == 'cgpt') {
                        if (
                            obstacle.marked ||
                            this.state.student.state.powerrun
                        ) {
                            obstacle.marked = true;
                            break;
                        } else {
                            const r = Math.random();
                            if (r < 0.1) {
                                this.state.lives = 0;
                                this.state.notgpt = 0;
                                this.updateLivesElement();
                                this.showEndScreen('gpt');
                            } else {
                                obstacle.collect();
                                this.state.lives = 3;
                                this.state.gpa = 4.0;
                            }
                        }
                    } else if (obstacle.name == 'RRR') {
                        if (
                            this.state.student.state.powerrun ||
                            obstacle.marked
                        ) {
                            obstacle.marked = true;
                            break;
                        } else {
                            this.state.lives = 0;
                            this.updateLivesElement();
                            this.showEndScreen('RRR');
                        }
                        return;
                    } else if (obstacle.name == 'wall') {
                        if (
                            this.state.student.state.powerrun ||
                            obstacle.marked
                        ) {
                            obstacle.marked = true;
                            break;
                        } else {
                            this.state.lives = 0;
                            this.updateLivesElement();
                            this.showEndScreen('wall');
                        }
                        return;
                    } else {
                        // Handle other obstacle collisions (e.g., enemies, hazards)
                        if (this.state.student.state.powerrun) {
                            obstacle.marked = true;
                            continue; // Skip to the next obstacle
                        } else if (obstacle.marked) {
                            this.state.student.state.speed = 0;
                        } else {
                            // subtract one life
                            this.state.lives -= 1;
                            this.updateLivesElement(); // update UI

                            // mark the obstacle to prevent multiple life deductions
                            obstacle.marked = true;

                            // TODO: trigger additional effects here

                            // Check if lives have run out
                            if (this.state.lives <= 0) {
                                this.updateLivesElement();
                                this.showEndScreen(); // Trigger end screen
                                return; // Exit the collision check to prevent further processing
                            }
                        }
                    }
                }
            }
        }
    }

    resetGame() {
        location.reload(true);

        // Reinitialize game components
        this.startGame();
        // startScreen.style.display = 'none';
    }

    /**
     * Resets the progress bar to its initial state.
     */
    resetProgressBar() {
        const progressBarFill = document.getElementById('progress-bar-fill');
        if (progressBarFill) {
            progressBarFill.style.width = '0%';
            progressBarFill.classList.remove('pulse');
            progressBarFill.style.backgroundColor = '#4CAF50';
        }
    }

    // TODO: checkIfOffRoad will trigger the end screen
    checkIfOffRoad() {
        if (!this.state.student || !this.state.student.state) {
            // if the student isn't initialized yet, we can't check if they're off road.
            return true;
        }

        const { currentSeg, roadType } = this.state.student.findCurrentSegment(
            this.state.roadChunk.state
        );

        if (currentSeg == null) {
            return true;
        }

        return false;
    }

    createProgressBar(iconSrc) {
        // Create main container for progress bar and icon
        const container = document.createElement('div');
        container.id = 'loading-container';
        container.style.position = 'absolute';
        container.style.top = '195px';
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

        if (this.state.lives == 0) {
            this.state.student.state.speed = 0;
            return;
        }

        if (!this.state.tracker) {
            this.state.tracker = 0;
        }

        if (this.state.student) {
            const stPos = this.state.student.state.position;
            this.state.studentPos.set(stPos.x, stPos.y, stPos.z);
        } else {
            return;
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

        // check if off road
        if (this.checkIfOffRoad()) {
            this.state.student.state.speed = 0;
            this.state.lives = 0;
            this.updateLivesElement();
            this.showEndScreen();
            return; // Stop updating once game is over
        }

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
