// CREDITS: Tiger by Poly by Google [CC-BY] via Poly Pizza (https://poly.pizza/m/5A3w06FXUup)
import { Group, Vector3, AnimationMixer, THREE, Box3, BoxHelper } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODELTIGER from './tiger.glb';

class Tiger extends Group {
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

        this.name = 'tiger';
        this.addTiger();
        parent.addToUpdateList(this);
    }

    addTiger() {
        const loader = new GLTFLoader();
        loader.load(MODELTIGER, (gltf) => {
            this.state.gltf = gltf;
            this.state.model = gltf.scene;

            this.state.model.scale.set(0.03, 0.03, 0.03);
            this.state.model.position.set(
                this.state.position.x,
                this.state.position.y + 2.5,
                this.state.position.z
            );

            this.state.model.rotation.set(
                0,
                (Math.PI / 2) * this.state.orientation.z,
                0
            );

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

    updateBoundingBox() {
        if (this.state.model) {
            this.state.boundingBox.setFromObject(this.state.model);
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
        // for animations; currently empty
    }
}

export default Tiger;
