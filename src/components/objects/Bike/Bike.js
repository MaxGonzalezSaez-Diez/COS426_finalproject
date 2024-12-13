// CREDITS: Bicycle by Poly by Google [CC-BY] via Poly Pizza (https://poly.pizza/m/19VoUuA2pcN)
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
import MODELBIKE from './bicycle.glb';

class Bike extends Group {
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

        this.name = 'bike';
        this.addBike();
        parent.addToUpdateList(this);
    }

    addBike() {
        const loader = new GLTFLoader();
        loader.load(MODELBIKE, (gltf) => {
            this.state.gltf = gltf;
            this.state.model = gltf.scene;

            this.state.model.scale.set(2, 2, 2);

            this.state.model.position.set(
                this.state.position.x,
                this.state.position.y,
                this.state.position.z
            );

            this.state.model.rotation.set(
                0,
                (Math.PI / 2) * this.state.orientation.x,
                0
            );
            // BoxHelper for visualizing the bounding box
            const boundingBoxHelper = new BoxHelper(this.state.model, 0xff0000);
            this.add(boundingBoxHelper);
            this.state.parent.add(boundingBoxHelper);
            this.state.boundingBoxHelper = boundingBoxHelper;

            this.add(this.state.model);
            this.state.parent.add(this.state.model);
            this.state.boundingBoxHelper.visible = false;
            this.updateBoundingBox();
        });
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

    hideBBox() {
        this.state.boundingBoxHelper.visible = false;
    }

    showBBox() {
        this.state.boundingBoxHelper.visible = true;
    }

    updateBoundingBox() {
        if (this.state.model) {
            // compute the bounding box
            this.state.boundingBox.setFromObject(this.state.model);

            if (this.state.boundingBoxHelper) {
                this.state.boundingBoxHelper.update();
            }
        }
    }
}

export default Bike;
