// CREDITS: Book by Quaternius (https://poly.pizza/m/LC0w7VI75u); modified to add title via Blender 4.3
import { Group, Vector3, AnimationMixer, THREE, Box3, BoxHelper } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODELRRR from './rights_rules_responsibilitiesv2.glb';

class RightsRulesResponsibilities extends Group {
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

        this.name = 'RRR';
        this.addRightsRulesResponsibilities();
        parent.addToUpdateList(this);
    }

    addRightsRulesResponsibilities() {
        const loader = new GLTFLoader();
        loader.load(MODELRRR, (gltf) => {
            this.state.gltf = gltf;
            this.state.model = gltf.scene;

            this.state.model.scale.set(2, 2, 2);
            this.state.model.position.set(
                this.state.position.x,
                this.state.position.y + 5,
                this.state.position.z
            );

            this.state.model.rotation.set(
                0,
                Math.PI +
                    Math.min(this.state.orientation.z, 0) * Math.PI +
                    (Math.PI / 2) * this.state.orientation.x,
                0
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

    updateBoundingBox() {
        if (this.state.model) {
            this.state.boundingBox.setFromObject(this.state.model);
            if (this.state.boundingBoxHelper) {
                this.state.boundingBoxHelper.update();
            }
        }
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

    update(timeStamp) {
        // for animations; currently empty
    }
}

export default RightsRulesResponsibilities;
