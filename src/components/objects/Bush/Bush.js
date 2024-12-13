// CREDITS for generator: ​​https://github.com/dgreenheck/ez-tree?tab=readme-ov-file
import {
    Group,
    Vector3,
    AnimationMixer,
    THREE,
    Box3,
    Box3Helper,
    BoxHelper,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODELBUSH from './bush.glb';

class Bush extends Group {
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
        };

        this.name = 'bush';
        this.addBush();
        parent.addToUpdateList(this);
    }

    addBush() {
        const loader = new GLTFLoader();
        loader.load(MODELBUSH, (gltf) => {
            this.state.gltf = gltf;
            this.state.model = gltf.scene;

            this.state.model.scale.set(0.2, 0.2, 0.2);

            // Position
            this.state.model.position.set(
                this.state.position.x,
                this.state.position.y,
                this.state.position.z
            );

            // create and attach a BoxHelper
            const boundingBoxHelper = new BoxHelper(this.state.model, 0xff0000);
            this.add(boundingBoxHelper);
            this.state.parent.add(boundingBoxHelper);
            this.state.boundingBoxHelper = boundingBoxHelper;

            // Add
            this.add(this.state.model);
            this.state.parent.add(this.state.model);
            this.state.boundingBoxHelper.visible = false;
            this.updateBoundingBox();
        });
    }

    update(timeStamp) {
        // for animations; currently empty
    }

    delete() {
        this.remove(this.state.model);
        this.state.parent.remove(this.state.model);
        this.remove(this.state.boundingBox);
        this.state.parent.remove(this.state.boundingBox);
        this.remove(this.state.boundingBoxHelper);
        this.state.parent.remove(this.state.boundingBoxHelper);
    }

    hideBBox() {
        this.state.boundingBoxHelper.visible = false;
    }

    showBBox() {
        this.state.boundingBoxHelper.visible = true;
    }

    updateBoundingBox() {
        if (this.state.model) {
            this.state.boundingBox.setFromObject(this.state.model);

            // update the BoxHelper
            if (this.state.boundingBoxHelper) {
                this.state.boundingBoxHelper.update();
            }
        }
    }
}

export default Bush;
