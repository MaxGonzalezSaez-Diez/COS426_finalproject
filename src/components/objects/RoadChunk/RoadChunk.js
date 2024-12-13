// Wooden Wall by Quaternius (https://poly.pizza/m/L0TxLurnES)
import {
    Group,
    PlaneGeometry,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    TextureLoader,
    RepeatWrapping,
    Vector3,
} from 'three';
import texture from './cobblestone.jpeg';
import sidewalkTexture from './stone2.jpeg';
import Cone from '../Cone/Cone.js';
import Bush from '../Bush/Bush.js';
import Oak from '../Oak/Oak.js';
import Sign from '../Sign/Sign.js';
import Coffee from '../Coffee/Coffee.js';
import Bike from '../Bike/Bike.js';
import Tiger from '../Tiger/Tiger.js';
import RightsRulesResponsibilities from '../RightsRulesResponsibilities/RightsRulesResponsibilities.js';
import ChatGPT from '../ChatGPT/ChatGPT.js';
import Grades from '../Grades/Grades.js';
import Wall from '../Wall/Wall.js';

class RoadChunk extends Group {
    constructor(
        parent,
        {
            segmentWidth = 20,
            segmentLength = 100,
            center = new Vector3(),
            direction = new Vector3(0, 0, 1),
            disableObstacles = false,
            coneProbabilities = [
                { cones: 0, probability: 60 },
                { cones: 1, probability: 20 },
                { cones: 2, probability: 15 },
                { cones: 3, probability: 5 },
                { cones: 4, probability: 5 },
                { cones: 5, probability: 5 },
                // { cones: 6, probability: 5 },
                // { cones: 7, probability: 2.5 },
                // { cones: 8, probability: 2.5 },
            ],
            bushProbabilities = [
                { cones: 0, probability: 92 },
                { cones: 1, probability: 8 },
            ],
            oakProbabilities = [
                { cones: 0, probability: 94 },
                { cones: 1, probability: 6 },
            ],
            signProbabilities = [
                { cones: 0, probability: 80 },
                { cones: 1, probability: 15 },
                { cones: 2, probability: 5 },
            ],
            coffeeProbabilities = [
                { cones: 0, probability: 40 },
                { cones: 1, probability: 30 },
                { cones: 2, probability: 20 },
                { cones: 3, probability: 10 },
            ],
            bikeProbabilities = [
                { cones: 0, probability: 90 },
                { cones: 1, probability: 5 },
                { cones: 2, probability: 3 },
                { cones: 3, probability: 1 },
            ],
            tigerProbabilities = [
                { cones: 0, probability: 90 },
                { cones: 1, probability: 7 },
                { cones: 2, probability: 1 },
                { cones: 3, probability: 1 },
            ],
            chatGPTProbabilities = [
                { cones: 0, probability: 90 },
                { cones: 1, probability: 10 },
            ],
            rrrponsibilitiesProbabilities = [
                { cones: 0, probability: 80 },
                { cones: 1, probability: 15 },
                { cones: 2, probability: 15 },
            ],
            gradesProbabilities = [
                { cones: 0, probability: 50 },
                { cones: 1, probability: 30 },
                { cones: 2, probability: 10 },
                { cones: 3, probability: 10 },
            ],
            initialsidewalkColor: initialsidewalkColor,
            initialroadColor: initialroadColor,
            verticalMovement: verticalMovement,
            offset: offset,
            timeElapsed = 0, // Add timeElapsed here with a default value of 0
        } = {}
    ) {
        super();

        this.state = {
            gui: parent.state.gui,
            parent: parent,
            segmentWidth: segmentWidth,
            segmentLength: segmentLength,
            type: 'straight',
            center: center,
            direction: direction.clone().normalize(),
            disableObstacles: disableObstacles,
            coneProbabilities: coneProbabilities,
            bushProbabilities: bushProbabilities,
            oakProbabilities: oakProbabilities,
            signProbabilities: signProbabilities,
            coffeeProbabilities: coffeeProbabilities,
            bikeProbabilities: bikeProbabilities,
            tigerProbabilities: tigerProbabilities,
            chatGPTProbabilities: chatGPTProbabilities,
            rrrponsibilitiesProbabilities: rrrponsibilitiesProbabilities,
            gradesProbabilities: gradesProbabilities,
            initialsidewalkColor: initialsidewalkColor,
            initialroadColor: initialroadColor,
            verticalMovement: verticalMovement,
            offset: offset,
            obstacles: [],
        };

        // Create sidewalks
        const sidewalkWidth = 2; // Adjust the width of the sidewalk as needed
        const sidewalkHeight = 1; // Adjust the height of the sidewalk as needed

        let currentSideWalkColor = initialsidewalkColor;
        const currentRoadColor = initialroadColor;
        let ss = 0;
        if (parent.state.student != null) {
            ss = parent.state.student.state.speed;
        }
        if (center.length() > 9) {
            currentSideWalkColor =
                initialsidewalkColor + 0x0000aaaa * Math.sin(0.1 * ss);
        }

        // Create road geometry
        const geometry = new PlaneGeometry(
            this.state.segmentWidth,
            this.state.segmentLength
        );

        // Load and configure road texture
        const textureLoader = new TextureLoader();
        const roadTexture = textureLoader.load(texture);
        roadTexture.wrapS = RepeatWrapping;
        roadTexture.wrapT = RepeatWrapping;
        roadTexture.repeat.set(segmentWidth / 10, segmentLength / 10);

        // Create road material
        const material = new MeshBasicMaterial({
            // color: Math.random() * 0xffffff, // Generate a random hex color
            color: currentRoadColor,
            map: roadTexture,
        });

        // Create road mesh
        const roadMesh = new Mesh(geometry, material);

        // Rotate road to be horizontal
        roadMesh.rotation.x = -Math.PI / 2;

        if (Math.abs(direction.z) < 1e-5) {
            roadMesh.rotation.z = Math.PI / 2;
        }

        // Position road based on type
        roadMesh.position.copy(center);

        if (!this.state.disableObstacles) {
            this.spawnObstacles(center, timeElapsed);
        }

        // Add to the group
        this.add(roadMesh);

        // Load sidewalk texture
        const sidewalkTextureLoader = new TextureLoader();
        const sidewalkTextureMap = sidewalkTextureLoader.load(sidewalkTexture);
        const sideTexture = sidewalkTextureLoader.load(sidewalkTexture);

        sidewalkTextureMap.wrapS = RepeatWrapping;
        sidewalkTextureMap.wrapT = RepeatWrapping;
        sidewalkTextureMap.repeat.x = 0.1;
        sideTexture.repeat.y = 0.1;

        const materials = [
            new MeshBasicMaterial({
                color: currentSideWalkColor,
                map: sideTexture,
            }), // Side faces
            new MeshBasicMaterial({
                color: currentSideWalkColor,
                map: sideTexture,
            }), // Other side faces
            new MeshBasicMaterial({
                color: currentSideWalkColor,
                map: sidewalkTextureMap,
            }), // Top face
            new MeshBasicMaterial({
                color: currentSideWalkColor,
                map: sidewalkTextureMap,
            }), // Bottom face
            new MeshBasicMaterial({
                color: currentSideWalkColor,
                map: sideTexture,
            }), // Front face
            new MeshBasicMaterial({
                color: currentSideWalkColor,
                map: sideTexture,
            }), // Back face
        ];

        const sidewalkGeometry = new BoxGeometry(
            sidewalkWidth,
            sidewalkHeight,
            this.state.segmentLength + 2
        );

        // Create left sidewalk
        const offsetDir = new Vector3(direction.z, 0, -direction.x).normalize();

        let leftSidewalk = new Mesh(sidewalkGeometry, materials);
        if (Math.abs(direction.z) < 1e-5) {
            leftSidewalk.rotation.y = Math.PI / 2;
        }

        leftSidewalk.position.set(
            center.x,
            center.y + sidewalkHeight / 2, // Raise the sidewalk above the road
            center.z
        );

        leftSidewalk.position.add(
            offsetDir.clone().multiplyScalar(this.state.segmentWidth / 2)
        );

        // - this.state.segmentWidth / 2 - sidewalkWidth / 2

        this.add(leftSidewalk);

        // Create right sidewalk
        let rightSidewalk = new Mesh(sidewalkGeometry, materials);
        if (Math.abs(direction.z) < 1e-5) {
            rightSidewalk.rotation.y = Math.PI / 2;
        }

        rightSidewalk.position.set(
            center.x,
            center.y + sidewalkHeight / 2,
            center.z
        );

        rightSidewalk.position.add(
            offsetDir.clone().multiplyScalar(-this.state.segmentWidth / 2)
        );
        // + this.state.segmentWidth / 2 + sidewalkWidth / 2

        this.add(rightSidewalk);

        // Add self to parent's update list (if needed)
        parent.addToUpdateList(this);
    }

    createWall() {
        let object = new Wall(this.state.parent, {
            position: this.state.center.clone(),
            orientation: this.state.direction.clone(),
            segmentLength: this.state.segmentLength,
            offset: this.state.offset,
        });

        this.state.obstacles.push(object);
    }

    // todo: need to account for turns
    spawnObstacles(roadCenter, timeElapsed = 0) {
        const objectCreations = [
            { name: 'Cone', type: 'bad' },
            { name: 'Bush', type: 'bad' },
            { name: 'Oak', type: 'bad' },
            { name: 'Sign', type: 'bad' },
            { name: 'Coffee', type: 'good' },
            { name: 'Bike', type: 'bad' },
            { name: 'Tiger', type: 'bad' },
            { name: 'RRR', type: 'bad' },
            { name: 'ChatGPT', type: 'good' },
            { name: 'Grades', type: 'good' },
        ];

        objectCreations.sort(() => Math.random() - 0.5);
        console.log(this.state.parent.state.student.state.speed);

        if (this.state.verticalMovement) {
            this.createWall();
        }

        for (const obj of objectCreations) {
            this.createObject(obj.name, roadCenter, timeElapsed, obj.type);
        }
    }

    createObject(objectName, roadCenter, timeElapsed = 0, type = 'bad') {
        // baseProbabilities modified based on the amount of time elapsed
        // more time = more cones in adjustedProbabilities
        let baseProbabilities = null;
        if (objectName == 'Cone') {
            baseProbabilities = this.state.coneProbabilities;
        } else if (objectName == 'Bush') {
            baseProbabilities = this.state.bushProbabilities;
        } else if (objectName == 'Oak') {
            baseProbabilities = this.state.oakProbabilities;
        } else if (objectName == 'Sign') {
            baseProbabilities = this.state.signProbabilities;
        } else if (objectName == 'Coffee') {
            baseProbabilities = this.state.coffeeProbabilities;
        } else if (objectName == 'Bike') {
            baseProbabilities = this.state.bikeProbabilities;
        } else if (objectName == 'Tiger') {
            baseProbabilities = this.state.tigerProbabilities;
        } else if (objectName == 'ChatGPT') {
            baseProbabilities = this.state.chatGPTProbabilities;
        } else if (objectName == 'RRR') {
            baseProbabilities = this.state.rrrponsibilitiesProbabilities;
        } else if (objectName == 'Grades') {
            baseProbabilities = this.state.gradesProbabilities;
        }

        timeElapsed *= 1000;

        // const adjustedProbabilities = baseProbabilities;

        const adjustedProbabilities = baseProbabilities.map((entry) => {
            const sp = this.state.parent.state.student.state.speed;

            if (entry.cones === 0) {
                return {
                    ...entry,
                    probability: Math.max(
                        entry.probability - sp * 0.4,
                        entry.probability - 5
                    ), // Adjust based on distance
                };
            } else {
                return {
                    ...entry,
                    probability: Math.min(
                        entry.probability + sp * 0.4, // Adjust increment based on distance
                        entry.probability + 5
                    ),
                };
            }
        });

        // calculates cumulative and normalized probabilities for cone spawning,
        // generates a random value between 0 and 100, and determines the number
        // of cones to spawn based on where the random value falls within the
        // normalized cumulative probability ranges
        const cumulativeProbabilities = [];
        adjustedProbabilities.reduce((acc, item) => {
            acc += item.probability;
            cumulativeProbabilities.push(acc);
            return acc;
        }, 0);

        const totalProbability =
            cumulativeProbabilities[cumulativeProbabilities.length - 1];
        const normalizedProbabilities = cumulativeProbabilities.map(
            (value) => (value / totalProbability) * 100
        );
        const randomValue = Math.random() * 100;
        const numObjects = adjustedProbabilities.find(
            (_, index) => randomValue < normalizedProbabilities[index]
        ).cones;

        // spawn the cones
        const minFraction = 0.25; // lower bound (25%)
        const maxFraction = 0.9; // upper bound (90%)
        const range = this.state.segmentLength * (maxFraction - minFraction); // adjusted range
        const baseOffset = this.state.segmentLength * minFraction; // starting point (25%)

        // const range = this.state.segmentLength * 0.8;
        const laneDirection = this.state.direction
            .clone()
            .applyAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2);

        for (let i = 0; i < numObjects; i++) {
            if (
                this.state.obstacles.length >=
                this.state.parent.state.student.state.speed
            ) {
                break;
            }

            const offset =
                Math.random() * range +
                baseOffset -
                this.state.segmentLength / 2;
            let r = Math.floor(this.state.parent.state.laneCount / 2);
            const min = -r;
            const max = r;
            let lanePush = Math.floor(Math.random() * (max - min + 1)) + min;

            if (objectName == 'Tiger' || objectName == 'Bike') {
                lanePush =
                    Math.sign(lanePush) * Math.min(1.5, Math.abs(lanePush));
            }

            let positionObject = roadCenter
                .clone()
                .add(this.state.direction.clone().multiplyScalar(offset));

            positionObject.add(
                laneDirection
                    .clone()
                    .multiplyScalar(
                        this.state.parent.state.laneWidth * lanePush
                    )
            );

            let object = null;
            if (objectName == 'Cone') {
                object = new Cone(this.state.parent, {
                    position: positionObject,
                });
            } else if (objectName == 'Bush') {
                object = new Bush(this.state.parent, {
                    position: positionObject,
                });
            } else if (objectName == 'Oak') {
                object = new Oak(this.state.parent, {
                    position: positionObject,
                });
            } else if (objectName == 'Sign') {
                object = new Sign(this.state.parent, {
                    position: positionObject,
                    orientation: this.state.direction.clone(),
                });
            } else if (objectName == 'Coffee') {
                object = new Coffee(this.state.parent, {
                    position: positionObject,
                });
            } else if (objectName == 'Bike') {
                object = new Bike(this.state.parent, {
                    position: positionObject,
                    orientation: this.state.direction.clone(),
                });
            } else if (objectName == 'Tiger') {
                object = new Tiger(this.state.parent, {
                    position: positionObject,
                    orientation: this.state.direction.clone(),
                });
            } else if (objectName == 'ChatGPT') {
                object = new ChatGPT(this.state.parent, {
                    position: positionObject,
                    orientation: this.state.direction.clone(),
                });
            } else if (objectName == 'RRR') {
                object = new RightsRulesResponsibilities(this.state.parent, {
                    position: positionObject,
                    orientation: this.state.direction.clone(),
                });
            } else if (objectName == 'Grades') {
                object = new Grades(this.state.parent, {
                    position: positionObject,
                    orientation: this.state.direction.clone(),
                });
            }

            // this.add(object)
            this.state.obstacles.push(object);
        }
    }

    update(timeStamp) {
        // Optional update method if you want any animations
        // Currently left empty
    }
}

export default RoadChunk;
