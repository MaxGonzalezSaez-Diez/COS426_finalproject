import { Group, Vector3, AnimationMixer} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './student.glb';

class Student extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        this.state = {
            parent: parent,
            model: null,
            prev: null,
            now: null,
            mixer: null,
            action: null,
            level: 1, 
            position: new Vector3(0, 0, 0),
            velocity: new Vector3(0, 0, 0),
            acceleration: 10,
            jumpStrength: 10,
            isJumping: false,
            gravity: -30,
            groundLevel: 0
        }

        
        this.name = 'student';
        this.addStudent();
        parent.addToUpdateList(this);
    }

    addStudent() {
        const loader = new GLTFLoader();
        loader.load(MODEL, (gltf) => {
            this.state.model = gltf.scene;
            this.state.model.position.set(0, 0, 0);
            this.state.model.scale.set(1, 1, 1);
            this.state.mixer = new AnimationMixer(this.state.model);
            const runningAnimation = gltf.animations[0];
            this.state.action = this.state.mixer.clipAction(runningAnimation); 
            this.state.action.play();
            this.add(this.state.model);
        });
    }

    update(timeStamp) {
        if (this.state.prev == null) {
            this.state.prev = timeStamp;
        }
        this.state.now = timeStamp;

        const deltaTime = (this.state.now - this.state.prev) * 0.00001;

        if (this.state.mixer) {
            this.state.mixer.update(this.state.level * deltaTime); 
        }

        this.state.position.z += this.state.acceleration * deltaTime;

        this.position.copy(this.state.position);
        this.state.prev = timeStamp;
    }
}

export default Student;
