import { Group, Vector3, AnimationMixer, THREE, BoxHelper, Box3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import a from './a_v1.glb';
import ap from './a_plusv1.glb';
import am from './a_minusv1.glb';
import b from './b_v1.glb';
import bp from './b_plusv1.glb';
import bm from './b_minusv1.glb';
import c from './c_v1.glb';
import cp from './c_plusv1.glb';
import cm from './c_minusv1.glb';
import d from './d_v1.glb';
import f from './f_v1.glb';

class Grades extends Group {
    constructor(
        parent,
        { position = new Vector3(), orientation = new Vector3() }
    ) {
        super();

        const r = Math.random();
        let grade;
        let numericGrade;

        if (r < 0.2) {
            grade = 'a';
            numericGrade = 4.0;
        } else if (r < 0.25) {
            grade = 'a+';
            numericGrade = 4.0;
        } else if (r < 0.35) {
            grade = 'a-';
            numericGrade = 3.7;
        } else if (r < 0.4) {
            grade = 'b';
            numericGrade = 3.0;
        } else if (r < 0.5) {
            grade = 'b+';
            numericGrade = 3.3;
        } else if (r < 0.6) {
            grade = 'b-';
            numericGrade = 2.7;
        } else if (r < 0.65) {
            grade = 'c';
            numericGrade = 2.0;
        } else if (r < 0.7) {
            grade = 'c+';
            numericGrade = 2.3;
        } else if (r < 0.75) {
            grade = 'c-';
            numericGrade = 1.7;
        } else if (r < 0.8) {
            grade = 'd';
            numericGrade = 1.0;
        } else {
            grade = 'f';
            numericGrade = 0.0;
        }

        this.state = {
            parent: parent,
            model: null,
            position: position,
            boundingBox: new Box3(),
            roadWidth: parent.state.roadWidth,
            laneCount: parent.state.laneCount,
            laneWidth: parent.state.laneWidth,
            grade: grade,
            numericgrade: numericGrade,
            orientation: orientation,
            marked: false,
        };

        this.name = 'grade';
        this.addGrade(grade);
        parent.addToUpdateList(this);
    }

    addGrade(grade) {
        let MODEL = null;
        if (grade == 'a') {
            MODEL = a;
        } else if (grade == 'a+') {
            MODEL = ap;
        } else if (grade == 'a-') {
            MODEL = am;
        } else if (grade == 'b') {
            MODEL = b;
        } else if (grade == 'b+') {
            MODEL = bp;
        } else if (grade == 'b-') {
            MODEL = bm;
        } else if (grade == 'c') {
            MODEL = c;
        } else if (grade == 'c+') {
            MODEL = cp;
        } else if (grade == 'c-') {
            MODEL = cm;
        } else if (grade == 'd') {
            MODEL = d;
        } else if (grade == 'f') {
            MODEL = f;
        }

        const loader = new GLTFLoader();
        loader.load(MODEL, (gltf) => {
            this.state.gltf = gltf;
            this.state.model = gltf.scene;

            this.state.model.scale.set(5, 5, 5);

            // Position the obstacle
            this.state.model.position.set(
                this.state.position.x,
                this.state.position.y + 1,
                this.state.position.z
            );

            this.state.model.rotation.set(
                0,
                Math.PI * this.state.orientation.z -
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

export default Grades;
