import { Group, Vector3, AnimationMixer, THREE, Box3, BoxHelper } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODELSIGN from './sign.glb';

class Sign extends Group {
    constructor(
        parent,
        { position = new Vector3(), orientation = new Vector3() }
    ) {
        super();

        this.state = {
            parent: parent,
            model: null,
            position: position,
            boundingBox: new Box3(),
            roadWidth: parent.state.roadWidth,
            laneCount: parent.state.laneCount,
            laneWidth: parent.state.laneWidth,
            orientation: orientation,
        };

        this.name = 'sign';
        this.addSign();
        parent.addToUpdateList(this);
    }

    addSign() {
        const loader = new GLTFLoader();
        loader.load(MODELSIGN, (gltf) => {
            this.state.gltf = gltf;
            this.state.model = gltf.scene;

            const height = Math.random() * 4 + 1;
            this.state.model.scale.set(3, height, 3);

            // Position the obstacle
            this.state.model.position.set(
                this.state.position.x,
                this.state.position.y + Math.min(3.5, height),
                this.state.position.z
            );

            this.state.model.rotation.set(
                0,
                (Math.PI / 2) * this.state.orientation.x,
                0
            );

            // this.state.model.rotation.add(this.state.orientation);

            // create and attach a BoxHelper for visualizing the bounding box
            const boundingBoxHelper = new BoxHelper(this.state.model, 0xff0000);
            this.add(boundingBoxHelper);
            this.state.parent.add(boundingBoxHelper);

            // store the BoxHelper for updates
            this.state.boundingBoxHelper = boundingBoxHelper;

            // Add the obstacle to the parent (scene or group)
            this.add(this.state.model);
            this.state.parent.add(this.state.model);
            this.state.boundingBoxHelper.visible = false;
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

    hideBBox() {
        this.state.boundingBoxHelper.visible = false;
    }

    showBBox() {
        this.state.boundingBoxHelper.visible = true;
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

export default Sign;
