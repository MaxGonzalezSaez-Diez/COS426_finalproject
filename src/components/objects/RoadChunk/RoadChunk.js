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
            this.spawnObstacles(center);
        }

        // Add to the group
        this.add(roadMesh);

        // Add self to parent's update list (if needed)
        parent.addToUpdateList(this);
    }

    // todo: need to account for turns
    spawnObstacles(roadCenter) {
        this.spawnCones(roadCenter);

        // TODO: add other stuff here
    }

    spawnCones(roadCenter) {
        // Define the probabilities for the number of cones
        const probabilities = this.state.coneProbabilities;

        const cumulativeProbabilities = [];
        probabilities.reduce((acc, item) => {
            acc += item.probability;
            cumulativeProbabilities.push(acc);
            return acc;
        }, 0);

        const randomValue = Math.random() * 100;
        const numCones = probabilities.find(
            (_, index) => randomValue < cumulativeProbabilities[index]
        ).cones;

        // Spawn the cones
        const minFraction = 0.25; // Lower bound (25%)
        const maxFraction = 0.9; // Upper bound (90%)
        const range = this.state.segmentLength * (maxFraction - minFraction); // Adjusted range
        const baseOffset = this.state.segmentLength * minFraction; // Starting point (25%)

        // const range = this.state.segmentLength * 0.8;
        const laneDirection = this.state.direction
            .clone()
            .applyAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2);

        for (let i = 0; i < numCones; i++) {
            const offset =
                Math.random() * range +
                baseOffset -
                this.state.segmentLength / 2;
            let r = Math.floor(this.state.parent.state.laneCount / 2);
            const min = -r;
            const max = r;
            const lanePush = Math.floor(Math.random() * (max - min + 1)) + min;

            let positionNewCone = roadCenter
                .clone()
                .add(this.state.direction.clone().multiplyScalar(offset));

            positionNewCone.add(
                laneDirection
                    .clone()
                    .multiplyScalar(
                        this.state.parent.state.laneWidth * lanePush
                    )
            );

            const newCone = new Cone(this.state.parent, {
                position: positionNewCone,
            });
            this.state.obstacles.push(newCone);
        }
    }

    update(timeStamp) {
        // Optional update method if you want any animations
        // Currently left empty
    }
}

export default RoadChunk;
