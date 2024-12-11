// CREDITS: Coffee cup by Poly by Google [CC-BY] via Poly Pizza
// This link provides the glb file: https://poly.pizza/m/fIuM_PW5prV
import { Group, Vector3, AnimationMixer, THREE, BoxHelper, Box3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODELCOFEE from './coffee.glb';

class Coffee extends Group {
    constructor(parent, { position = new Vector3() }) {
        super();

        this.state = {
            parent: parent,
            model: null,
            position: position,
            boundingBox: new Box3(),
            roadWidth: parent.state.roadWidth,
            laneCount: parent.state.laneCount,
            laneWidth: parent.state.laneWidth,
            marked: false,
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

            // requestAnimationFrame(() => {
            //     this.state.boundingBox = new BoxHelper(
            //         this.state.model,
            //         0xff0000
            //     );

            //     this.state.boundingBox.material.transparent = true;
            //     this.state.boundingBox.material.opacity = 0;

            //     this.add(this.state.boundingBox);
            //     this.state.parent.add(this.state.boundingBox);
            // });

            this.state.boundingBox.setFromObject(this.state.model);

            // create and attach a BoxHelper for visualizing the bounding box
            const boundingBoxHelper = new BoxHelper(this.state.model, 0xff0000);
            this.add(boundingBoxHelper);
            this.state.parent.add(boundingBoxHelper);

            // store the BoxHelper for updates
            this.state.boundingBoxHelper = boundingBoxHelper;

            // Add the obstacle to the parent (scene or group)
            this.add(this.state.model);
            this.state.parent.add(this.state.model);

            this.updateBoundingBox();
        });
    }

    updateBoundingBox() {
        if (this.state.model) {
            // compute the bounding box based on the model's current state
            this.state.boundingBox.setFromObject(this.state.model);

            // update the BoxHelper to match the bounding box
            if (this.state.boundingBoxHelper) {
                this.state.boundingBoxHelper.update();
            }
        }
    }

    collect() {
        // TODO: add sound here on collection
        this.remove(this.state.model);
        this.state.parent.remove(this.state.model);
    }

    delete() {
        this.remove(this.state.model);
        this.state.parent.remove(this.state.model);
        this.remove(this.state.boundingBox);
        this.state.parent.remove(this.state.boundingBox);
        this.remove(this.state.boundingBoxHelper);
        this.state.parent.remove(this.state.boundingBoxHelper);
    }

    update(timeStamp) {
        // Optional update method if you want any animations
        // Currently left empty
    }
}

export default Coffee;
