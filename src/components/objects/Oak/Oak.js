import { Group, Vector3, AnimationMixer, THREE, BoxHelper } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODELOAK from './oak.glb';

class Oak extends Group {
    constructor(parent, { position = new Vector3() }) {
        super();

        this.state = {
            parent: parent,
            model: null,
            position: position,
            boundingBox: null,
            roadWidth: parent.state.roadWidth,
            laneCount: parent.state.laneCount,
            laneWidth: parent.state.laneWidth,
        };

        this.name = 'oak';
        this.addOak();
        parent.addToUpdateList(this);
    }

    addOak() {
        const loader = new GLTFLoader();
        loader.load(MODELOAK, (gltf) => {
            this.state.gltf = gltf;
            this.state.model = gltf.scene;

            this.state.model.scale.set(0.2, 0.2, 0.2);

            // Position the obstacle
            this.state.model.position.set(
                this.state.position.x,
                this.state.position.y,
                this.state.position.z
            );

            requestAnimationFrame(() => {
                this.state.boundingBox = new BoxHelper(
                    this.state.model,
                    0xff0000
                );

                this.state.boundingBox.material.transparent = true;
                this.state.boundingBox.material.opacity = 0;
                
                this.add(this.state.boundingBox);
                this.state.parent.add(this.state.boundingBox);
            });

            // Add the obstacle to the parent (scene or group)
            this.add(this.state.model);
            this.state.parent.add(this.state.model);
        });
    }

    update(timeStamp) {
        // Optional update method if you want any animations
        // Currently left empty
    }
}

export default Oak;