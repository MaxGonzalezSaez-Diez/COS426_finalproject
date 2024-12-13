// Wooden Wall by Quaternius (https://poly.pizza/m/L0TxLurnES)
// CREDITS Road: https://stock.adobe.com/images/granite-cobblestoned-pavement-background-stone-pavement-texture-abstract-background-of-cobblestone-pavement-close-up-seamless-texture/403115894
// CREDITS sidewalk: https://www.google.com/imgres?q=sidewalk%20texture%20cobblestone%20dark%20brown&imgurl=http%3A%2F%2Fwww.sketchuptextureclub.com%2Fpublic%2Ftexture%2F0057-street-paving-cobblestone-texture-seamless.jpg&imgrefurl=https%3A%2F%2Fwww.sketchuptextureclub.com%2Ftextures%2Farchitecture%2Froads%2Fpaving-streets%2Fcobblestone%2Fstreet-paving-cobblestone-texture-seamless-07389&docid=On-TF9Uinv7jtM&tbnid=VdW8x694cKQ3zM&vet=12ahUKEwir19iFkKWKAxWHF1kFHS0qKsQQM3oECGMQAA..i&w=1200&h=989&hcb=2&ved=2ahUKEwir19iFkKWKAxWHF1kFHS0qKsQQM3oECGMQAA
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
            ],
            bushProbabilities = [
                { cones: 0, probability: 76 },
                { cones: 1, probability: 14 },
            ],
            oakProbabilities = [
                { cones: 0, probability: 90 },
                { cones: 1, probability: 10 },
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
            timeElapsed = 0,
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
        const sidewalkWidth = 2;
        const sidewalkHeight = 1;

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

        // Add
        this.add(roadMesh);

        // sidewalk texture
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
            }),
            new MeshBasicMaterial({
                color: currentSideWalkColor,
                map: sideTexture,
            }),
            new MeshBasicMaterial({
                color: currentSideWalkColor,
                map: sidewalkTextureMap,
            }),
            new MeshBasicMaterial({
                color: currentSideWalkColor,
                map: sidewalkTextureMap,
            }),
            new MeshBasicMaterial({
                color: currentSideWalkColor,
                map: sideTexture,
            }),
            new MeshBasicMaterial({
                color: currentSideWalkColor,
                map: sideTexture,
            }),
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
            center.y + sidewalkHeight / 2,
            center.z
        );

        leftSidewalk.position.add(
            offsetDir.clone().multiplyScalar(this.state.segmentWidth / 2)
        );

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

        this.add(rightSidewalk);

        // Add self to parent's update list
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

        const adjustedProbabilities = baseProbabilities.map((entry) => {
            const sp = this.state.parent.state.student.state.speed;

            if (entry.cones === 0) {
                return {
                    ...entry,
                    probability: Math.max(
                        entry.probability - sp * 0.4,
                        entry.probability - 5
                    ),
                };
            } else {
                return {
                    ...entry,
                    probability: Math.min(
                        entry.probability + sp * 0.4,
                        entry.probability + 5
                    ),
                };
            }
        });

        // calculates cumulative/normalized prob. for spawning
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

        // spawn (NOTE: not to close to beginning of road for better user experience)
        const minFraction = 0.25;
        const maxFraction = 0.9;
        const range = this.state.segmentLength * (maxFraction - minFraction);
        const baseOffset = this.state.segmentLength * minFraction;

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

            this.state.obstacles.push(object);
        }
    }

    update(timeStamp) {
        // for animations; currently empty
    }
}

export default RoadChunk;
