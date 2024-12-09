import {
    Group,
    PlaneGeometry,
    MeshBasicMaterial,
    Mesh,
    TextureLoader,
    RepeatWrapping,
    Vector3,
} from 'three';
import texture from './cobblestone.jpeg';
import Cone from '../Cone/Cone.js';
import Bush from '../Bush/Bush.js';
import Oak from '../Oak/Oak.js';

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
                { cones: 0, probability: 80 },
                { cones: 1, probability: 10 },
                { cones: 2, probability: 5 },
                { cones: 3, probability: 2.5 },
                { cones: 4, probability: 1.25 },
                { cones: 5, probability: 0.75 },
                { cones: 6, probability: 0.75 },
            ],
            bushProbabilities = [
                { cones: 0, probability: 92 },
                { cones: 1, probability: 8 },
            ],
            oakProbabilities = [
                { cones: 0, probability: 96 },
                { cones: 1, probability: 4 },
            ],
            timeElapsed = 0, // Add timeElapsed here with a default value of 0
        } = {}
    ) {
        super();

        this.state = {
            gui: parent.state.gui,
            parent: parent,
            segmentWidth: segmentWidth,
            segmentLength: segmentLength,
            center: center,
            direction: direction.clone().normalize(),
            disableObstacles: disableObstacles,
            coneProbabilities: coneProbabilities,
            bushProbabilities: bushProbabilities,
            oakProbabilities: oakProbabilities,
            obstacles: [],
        };

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
            color: Math.random() * 0xffffff, // Generate a random hex color
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

        // Add self to parent's update list (if needed)
        parent.addToUpdateList(this);
    }

    // todo: need to account for turns
    spawnObstacles(roadCenter, timeElapsed = 0) {
        this.createObject('Cone', roadCenter, timeElapsed);
        this.createObject('Bush', roadCenter, timeElapsed);
        this.createObject('Oak', roadCenter, timeElapsed);

        // TODO: add other stuff here
    }

    createObject(objectName, roadCenter, timeElapsed = 0) {
        // baseProbabilities modified based on the amount of time elapsed
        // more time = more cones in adjustedProbabilities
        let baseProbabilities = null;
        if (objectName == 'Cone') {
            baseProbabilities = this.state.coneProbabilities;
        } else if (objectName == 'Bush') {
            baseProbabilities = this.state.bushProbabilities;
        } else if (objectName == 'Oak') {
            baseProbabilities = this.state.oakProbabilities;
        }

        timeElapsed *= 1000;

        // const adjustedProbabilities = baseProbabilities.map((entry) => {
        //     if (entry.cones === 0) {
        //         return {
        //             ...entry,
        //             probability: Math.max(80 - timeElapsed, 10),
        //         };
        //     } else {
        //         return {
        //             ...entry,
        //             probability: Math.min(
        //                 entry.probability + timeElapsed * 0.1,
        //                 50
        //             ),
        //         };
        //     }
        // });

        const adjustedProbabilities = baseProbabilities;
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
            const offset =
                Math.random() * range +
                baseOffset -
                this.state.segmentLength / 2;
            let r = Math.floor(this.state.parent.state.laneCount / 2);
            const min = -r;
            const max = r;
            const lanePush = Math.floor(Math.random() * (max - min + 1)) + min;

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
            }

            // this.add(object)
            this.state.obstacles.push(object);
        }

        console.log('Time Elapsed:', timeElapsed);
        console.log('Adjusted Probabilities:', adjustedProbabilities);
        console.log('Normalized Probabilities:', normalizedProbabilities);
        console.log('Random Value:', randomValue);
        console.log('Number of Cones Spawned:', numObjects);
    }

    update(timeStamp) {
        // Optional update method if you want any animations
        // Currently left empty
    }
}

export default RoadChunk;
