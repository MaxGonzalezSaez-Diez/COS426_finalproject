import { Group, Vector3, AnimationMixer, THREE } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODELCONE from './cone.glb';

class Cone extends Group {
    constructor(parent, { position = new Vector3(), roadWidth = 20 }) {
        super();

        const laneCount = 5;

        this.state = {
            parent: parent,
            model: null,
            position: position,
            roadWidth: roadWidth,
            laneCount: laneCount,
        };

        const laneWidth = roadWidth / (laneCount - 1);
        const randomLane = Math.floor(Math.random() * this.state.laneCount) - 2;

        this.name = 'cone';
        this.addCone(randomLane, laneWidth);
        parent.addToUpdateList(this);
    }

    addCone(randomLane, laneWidth) {
        const loader = new GLTFLoader();
        loader.load(MODELCONE, (gltf) => {
            this.state.gltf = gltf;
            this.state.model = gltf.scene;

            this.state.model.scale.set(25, 25, 25);

            // Position the obstacle
            this.state.model.position.set(
                this.state.position.x + randomLane * laneWidth,
                0,
                this.state.position.z
            );

            // Add the obstacle to the parent (scene or group)
            this.add(this.state.model);
            // this.state.parent.add(this.state.model);
        });
    }
}

export default Cone;
