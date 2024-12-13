import * as Dat from 'dat.gui';
import {
    Scene,
    Color,
    Vector3,
    TextureLoader,
    Sprite,
    SpriteMaterial,
    AudioLoader,
    AudioListener,
    Audio,
} from 'three';
import { createClient } from '@supabase/supabase-js';
import { RoadChunk, Student, Cone, Oak, Bush } from 'objects';
import { BasicLights } from 'lights';
import ProceduralRoad from '../objects/ProceduralRoad/ProceduralRoad';
import Clouds from '../objects/Clouds/Clouds';
import DAYSKY from './dayv7.png';
import NIGHTSKY from './night2.png';
import STORMSKY from './stormv2.png';
import BETWEENSKY from './dawndusk.png';

import COFFEE from './coffee.png';

// Replace with your Supabase URL and anon key (these are safe to expose in the frontend)
const supabaseUrl = 'https://mieysrnkneloivlhfhuk.supabase.co';
const supabaseAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZXlzcm5rbmVsb2l2bGhmaHVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwNjMyNjQsImV4cCI6MjA0OTYzOTI2NH0.YnjEQf3rZF_KccTSlYPvUo-8JuRwHm6aCQnzJT6L874';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
let top3_scores = null;
let usernamePlayer = null;
async function getHighScores() {
    let { data, error } = await supabase
        .from('princeton_run')
        .select('score, name') // Adjust column names based on your table
        .order('score', { ascending: false })
        .limit(3);

    top3_scores = data;
    if (error) {
        throw Error('Err');
    } else {
        console.log('High scores:', data);
    }

    return top3_scores;
}

async function submitScore(username, score1) {
    try {
        if (top3_scores == null) {
            let { data: top3_scores, error: fetchError } = await supabase
                .from('princeton_run')
                .select('score')
                .order('score', { ascending: false })
                .limit(3);

            if (fetchError) {
                console.error('Error fetching top scores:', fetchError);
                return 5;
            }
        }

        // Determine the position
        let position = 5;
        for (let i = 0; i < top3_scores.length; i++) {
            if (score1 > top3_scores[i].score) {
                position = i + 1;
                break;
            }
        }

        if (position == 5 && top3_scores.length < 3) {
            position = top3_scores.length + 1;
        }

        if (position <= 3) {
            const { data, error: submitError } = await supabase
                .from('princeton_run')
                .insert([{ name: username, score: score1 }]);

            if (submitError) {
                console.error('Error submitting score:', submitError);
                return 5;
            } else {
                console.log('Score submitted:', data);
                return position;
            }
        }

        return position;
    } catch (err) {
        console.error('Unexpected error:', err);
        return 5;
    }
}

class SeedScene extends Scene {
    constructor(
        camera,
        hitSound,
        rrrSound,
        coffeeSound,
        gptSound,
        gradeSound,
        sprintSound,
        jumpSound,
        backgroundMusic
    ) {
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
            coffesPerSprint: 7,
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

        this.camera = camera;
        this.hitSound = hitSound;
        this.rrrSound = rrrSound;
        this.coffeeSound = coffeeSound;
        this.gptSound = gptSound;
        this.gradeSound = gradeSound;
        this.sprintSound = sprintSound;
        this.jumpSound = jumpSound;
        this.backgroundMusic = backgroundMusic;
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
        startScreen.style.padding = '0px';
        document.body.appendChild(startScreen);

        // Add title text
        const title = document.createElement('h1');
        const welcomeText = document.createElement('span');
        welcomeText.innerHTML =
            'WELCOME TO <span style="color: #FF6600;">PRINCETON</span> <span style="color: #000000;">RUN</span>';
        welcomeText.style.fontFamily = 'Impact, sans-serif';
        welcomeText.style.fontSize = '60px';
        const princetonText = document.createElement('span');
        title.appendChild(welcomeText);
        title.style.textAlign = 'center';
        title.style.marginBottom = '5px';
        startScreen.appendChild(title);

        const instructionText = document.createElement('h2');
        instructionText.innerHTML =
            'Immerse yourself in the wonderful life of a Princeton Student!';
        instructionText.style.fontFamily = 'Courier New, Courier, monospace';
        instructionText.style.fontSize = '25px';
        instructionText.style.textAlign = 'left';
        instructionText.style.marginBottom = '10px';
        instructionText.style.lineHeight = '1.1';
        startScreen.appendChild(instructionText);

        const leaderboard = document.createElement('h2');
        leaderboard.innerHTML =
            'Current Leaderboard: 🥇<span id="leader1"></span> 🥈<span id="leader2"></span> 🥉<span id="leader3"></span>';
        leaderboard.style.fontFamily = 'Courier New, Courier, monospace';
        leaderboard.style.fontSize = '30px';
        leaderboard.style.textAlign = 'left';
        leaderboard.style.marginBottom = '15px';
        leaderboard.style.lineHeight = '1.1';
        leaderboard.style.paddingLeft = '175px';
        leaderboard.style.width = '100%';
        startScreen.appendChild(leaderboard);

        const leader1 = document.getElementById('leader1');
        const leader2 = document.getElementById('leader2');
        const leader3 = document.getElementById('leader3');
        const spinner1 = document.createElement('div');
        const spinner2 = document.createElement('div');
        const spinner3 = document.createElement('div');
        spinner1.style.border = '4px solid #f3f3f3';
        spinner1.style.borderTop = '4px solid #FF6600';
        spinner1.style.borderRadius = '50%';
        spinner1.style.width = '20px';
        spinner1.style.height = '20px';
        spinner1.style.animation = 'spin 1s linear infinite';
        spinner1.style.display = 'inline-block';

        spinner2.style.border = '4px solid #f3f3f3';
        spinner2.style.borderTop = '4px solid #FF6600';
        spinner2.style.borderRadius = '50%';
        spinner2.style.width = '20px';
        spinner2.style.height = '20px';
        spinner2.style.animation = 'spin 1s linear infinite';
        spinner2.style.display = 'inline-block';

        spinner3.style.border = '4px solid #f3f3f3';
        spinner3.style.borderTop = '4px solid #FF6600';
        spinner3.style.borderRadius = '50%';
        spinner3.style.width = '20px';
        spinner3.style.height = '20px';
        spinner3.style.animation = 'spin 1s linear infinite';
        spinner3.style.display = 'inline-block';
        leader1.appendChild(spinner1);
        leader2.appendChild(spinner2);
        leader3.appendChild(spinner3);

        const style = document.createElement('style');
        style.innerHTML = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;
        document.head.appendChild(style);

        getHighScores()
            .then((highscores) => {
                // If we get the data and it's in the expected format (array of objects)
                if (highscores && highscores.length === 3) {
                    // Assign each leader element with the name and score
                    leader1.textContent = `${highscores[0].name}: ${highscores[0].score}`;
                    leader2.textContent = `${highscores[1].name}: ${highscores[1].score}`;
                    leader3.textContent = `${highscores[2].name}: ${highscores[2].score}`;

                    // Optionally remove spinners after assigning the scores
                    leader1.removeChild(spinner1);
                    leader2.removeChild(spinner2);
                    leader3.removeChild(spinner3);
                } else {
                    console.error(
                        'Error: High scores data is invalid or incomplete.'
                    );
                }
            })
            .catch((error) => {
                console.error('Error fetching high scores:', error);
            });

        const movementText = document.createElement('p');
        movementText.innerHTML =
            '<b>Instructions</b>: Use a/d or ←/→ to move and w/↑ to jump. Be aware: hitting walls,<br> missing turns will send you to McCosh instantly!<br><br><b>Score</b>: Your final score is the distance times your GPA.<br><br><b>Trick</b>: Once you had enough coffee you can click p for a caffeine boost.<br><br><b>Policies on generative AI</b>: Using AI has a 90% chance of getting you a 4.0 GPA<br> and giving you all your lives back. Make sure to not get caught though, it\'s an<br> Honor Code Violation! And be sure not to violate the Honor Code by running into<br> the Rights, Rules, Responsibilities book! Both will get you expelled!';
        movementText.style.fontFamily = 'Courier New, Courier, monospace';
        movementText.style.fontSize = '25px';
        movementText.style.marginBottom = '15px';
        movementText.style.lineHeight = '1.1';
        movementText.style.paddingLeft = '175px';
        movementText.style.width = '100%';

        startScreen.appendChild(movementText);

        const formContainer = document.createElement('div');
        formContainer.style.display = 'flex';
        formContainer.style.alignItems = 'center';
        formContainer.style.justifyContent = 'center';
        formContainer.style.marginBottom = '20px';
        formContainer.style.gap = '50px';

        startScreen.appendChild(formContainer);

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

        // name
        function generateRandomString(length) {
            const characters =
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(
                    Math.floor(Math.random() * charactersLength)
                );
            }
            return result;
        }

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        if (usernamePlayer == null) {
            nameInput.value = 'Player1_' + generateRandomString(10);
        } else {
            nameInput.value = usernamePlayer;
        }
        nameInput.placeholder = 'Enter your name';
        nameInput.style.fontSize = '20px';
        nameInput.style.fontFamily = 'Courier New, Courier, monospace';
        nameInput.style.marginBottom = '0px';
        nameInput.style.marginTop = '40px';
        nameInput.style.border = '0px solid #ffffff';
        nameInput.style.backgroundColor = '#000000';
        nameInput.style.color = '#FF6600';
        nameInput.style.textAlign = 'center';
        nameInput.style.width = '270px';
        nameInput.style.height = '93px';

        formContainer.appendChild(nameInput);
        formContainer.appendChild(startButton);

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
            this.backgroundMusic.play();

            this.startGame();
            startScreen.style.display = 'none';
            usernamePlayer = nameInput.value;
        });
    }

    showEndScreen(reason) {
        // end screen overlay like the start screen (does not remove ui elements)
        if (document.getElementById('end-screen')) return;
        window.removeEventListener('keydown', this.state.student.state.keydown);

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
        const statsText = document.createElement('p');
        statsText.innerHTML = `
        <div style="text-align: left;">
        Coffees Collected: ${finalCoffees}<br>
        Final GPA: ${finalGPA}<br>
        Distance Traveled: ${finalDistance}m<br>
        <b>Final Score: ${finalscore.toFixed(
            0
        )} (<span id="medal-placeholder"></span>)</b> 
        </div>
        `;
        document.body.appendChild(statsText);

        const medalPlaceholder = document.getElementById('medal-placeholder');
        const spinner = document.createElement('div');
        spinner.style.border = '4px solid #f3f3f3';
        spinner.style.borderTop = '4px solid #FF6600';
        spinner.style.borderRadius = '50%';
        spinner.style.width = '20px';
        spinner.style.height = '20px';
        spinner.style.animation = 'spin 1s linear infinite';
        spinner.style.display = 'inline-block';
        medalPlaceholder.appendChild(spinner);

        const style = document.createElement('style');
        style.innerHTML = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;
        document.head.appendChild(style);

        submitScore(usernamePlayer, finalscore)
            .then((position) => {
                medalPlaceholder.removeChild(spinner);
                let medal = '';
                if (position === 1) {
                    medal = '🥇';
                } else if (position === 2) {
                    medal = '🥈';
                } else if (position === 3) {
                    medal = '🥉';
                } else {
                    medal = '-';
                }

                // Display the medal
                medalPlaceholder.textContent = medal;
            })
            .catch((error) => {
                console.error('Error submitting score:', error);

                medalPlaceholder.removeChild(spinner);
                medalPlaceholder.textContent = 'Error';
            });

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
                            this.gradeSound.play();
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
                            this.gradeSound.play();
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
                                this.rrrSound.play();
                            } else {
                                obstacle.collect();
                                this.state.lives = 3;
                                this.state.gpa = 4.0;
                                this.gptSound.play();
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
                            this.rrrSound.play();
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
                            this.hitSound.play();
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
                            this.hitSound.play();

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
                this.coffeeSound.play();
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

        // Track the time and change background every 10 seconds
        const cycleDuration = 10; // 10 seconds for each cycle (day -> dusk -> night -> dawn)
        const cycleCheckInterval = 5; // Check every 1 second

        // Use modulo to find which part of the cycle we are in

        // Track the time of last background change
        if (!this.state.lastBackgroundUpdate) {
            this.state.lastBackgroundUpdate = 0; // Initialize if not set
        }
        if (
            timeElapsed - this.state.lastBackgroundUpdate >=
            cycleCheckInterval
        ) {
            this.state.lastBackgroundUpdate = timeElapsed; // Update the last background update time
            const cyclePosition = Math.floor((timeElapsed / cycleDuration) % 4); // 4 phases: day, dusk, night, dawn

            // Switch background based on the cycle phase
            switch (cyclePosition) {
                case 0: // Day
                    if (this.state.currentBackground !== 'day') {
                        this.loadBackgroundImage(DAYSKY);
                        this.state.currentBackground = 'day';
                    }
                    break;
                case 1: // Dusk
                    if (this.state.currentBackground !== 'dusk') {
                        this.loadBackgroundImage(BETWEENSKY);
                        this.state.currentBackground = 'dusk';
                    }
                    break;
                case 2: // Night
                    if (this.state.currentBackground !== 'night') {
                        this.loadBackgroundImage(NIGHTSKY);
                        this.state.currentBackground = 'night';
                    }
                    break;
                case 3: // Dawn
                    if (this.state.currentBackground !== 'dawn') {
                        this.loadBackgroundImage(BETWEENSKY);
                        this.state.currentBackground = 'dawn';
                    }
                    break;
                default:
                    break;
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
