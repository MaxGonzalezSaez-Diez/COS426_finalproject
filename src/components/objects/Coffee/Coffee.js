// CREDITS: Coffee cup by Poly by Google [CC-BY] via Poly Pizza
// This link provides the glb file: https://poly.pizza/m/fIuM_PW5prV
import { Group, Vector3, AnimationMixer, THREE, BoxHelper } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODELCOFEE from './coffee.glb';

class Coffee extends Group {
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

        this.name = 'coffee';
        this.addCoffee();
        parent.addToUpdateList(this);
    }

    addCoffee() {
        const loader = new GLTFLoader();
        loader.load(MODELCOFEE, (gltf) => {
            this.state.gltf = gltf;
            this.state.model = gltf.scene;

            this.state.model.scale.set(2, 2, 2);

            // Position the obstacle
            this.state.model.position.set(
                this.state.position.x,
                this.state.position.y + this.state.model.scale.y,
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

export default Coffee;
