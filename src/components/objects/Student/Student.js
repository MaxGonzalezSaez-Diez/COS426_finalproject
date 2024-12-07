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
            direction: new Vector3(0, 0, 1),
            rotAxis: new Vector3(0, 1, 0),
            acceleration: 10,
            jumpStrength: 10,
            isJumping: false,
            gravity: -30,
            groundLevel: 0
        }

        
        this.name = 'student';
        this.addStudent();
        parent.addToUpdateList(this);
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
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

    handleKeyDown(event) {
        const turn = (angle) => {
            this.state.direction = this.state.direction.clone().applyAxisAngle(this.state.rotAxis, angle);
            this.state.model.rotation.y += angle;
        };
    
        switch(event.key.toLowerCase()) {
            case 'a':
            case 'arrowleft':
                turn(Math.PI/2); 
                break;
            case 'd':
            case 'arrowright':
                turn(-Math.PI/2); 
                break;
        }
    }

    update(timeStamp) {
        if (this.state.prev == null) {
            this.state.prev = timeStamp;
        }
        this.state.now = timeStamp;

        const deltaTime = (this.state.now - this.state.prev) * 0.001;

        if (this.state.mixer) {
            this.state.mixer.update(this.state.level * deltaTime); 
        }

        console.log(this.state.direction)
        this.state.position.add(this.state.direction.clone().multiplyScalar(this.state.acceleration * deltaTime));
        
        this.position.copy(this.state.position);
        this.state.prev = timeStamp;
    }
}

export default Student;
