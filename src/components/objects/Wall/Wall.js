// Wall by Quaternius (https://poly.pizza/m/CkF171SeTV)
import { Group, Vector3, AnimationMixer, THREE, BoxHelper, Box3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODELWALL from './ww.glb';

class Wall extends Group {
    constructor(
        parent,
        {
            position = new Vector3(),
            orientation = new Vector3(),
            segmentLength = 0,
            offset = new Vector3(),
        }
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
            segmentLength: segmentLength,
            offset: offset,
        };

        this.name = 'wall';
        this.addWall();
        parent.addToUpdateList(this);
    }

    addWall() {
        const loader = new GLTFLoader();
        loader.load(MODELWALL, (gltf) => {
            this.state.gltf = gltf;
            this.state.model = gltf.scene;

            this.state.model.scale.set(13.5, 0.52 * this.state.offset.y, 1);

            this.state.model.traverse((child) => {
                if (child.isMesh) {
                    // Option 1: Change color and increase brightness
                    child.material.color.set(0xb38867);
                }
            });

            // Position the obstacle
            this.state.model.position.set(
                this.state.position.x -
                    (this.state.orientation.x * this.state.segmentLength) / 2,
                this.state.position.y - this.state.offset.y,
                this.state.position.z -
                    (this.state.orientation.z * this.state.segmentLength) / 2
            );

            // this.state.position.add(
            //     this.state.orientation
            //         .clone()
            //         .multiplyScalar(this.state.segmentLength / 2)
            // );

            this.state.model.rotation.set(
                0,
                (Math.PI / 2) * this.state.orientation.x,
                0
            );

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

export default Wall;
