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
            groundLevel: 0,
            currentSegment: null,
            nextSegment: null,
            roadType: null,
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

    update(timeStamp, roadState) {
        if (this.state.prev == null) {
            this.state.prev = timeStamp;
        }
        this.state.now = timeStamp;

        const deltaTime = (this.state.now - this.state.prev) * 0.01;

        if (this.state.mixer) {
            this.state.mixer.update(this.state.level * deltaTime); 
        }

        const { currentSeg, roadType } = this.findCurrentSegment(roadState);
        
        this.state.currentSegment = currentSeg;
        this.state.roadType = roadType;

        this.state.position.add(this.state.direction.clone().multiplyScalar(this.state.acceleration * deltaTime));
        
        this.position.copy(this.state.position);
        this.state.prev = timeStamp;
    }

    findCurrentSegment(roadState) {
        const roadSegments = roadState.roadSegments;
        const cornerSegments = roadState.cornerSegments;
    
        let currentSegment = null;
        let currentSegmentType = null;
        let currentIndex = -1;
    
        // First, find the current segment
        if (roadSegments.length > 0) {
            for (let i = 0; i < roadSegments.length; i++) {
                if (this.isOnSegment(roadSegments[i])) {
                    currentSegment = roadSegments[i];
                    currentSegmentType = 'road';
                    currentIndex = i;
                    break;
                }
            }
        }
    
        // If no road segment found, check corners
        if (!currentSegment && cornerSegments.length > 0) {
            for (let i = 0; i < cornerSegments.length; i++) {
                if (this.isOnSegment(cornerSegments[i])) {
                    currentSegment = cornerSegments[i];
                    currentSegmentType = 'corner';
                    currentIndex = i;
                    break;
                }
            }
        }
    
        // If no current segment found, return null
        if (!currentSegment) {
            return {
                currentSeg: null,
                // nextSeg: nextSegment,
                roadType: null
            };
        }
    
        // Find the next segment based on current segment type
        // let nextSegment = null;
        // if (currentSegmentType === 'road') {
        //     if (cornerSegments.length > 0) {
        //         nextSegment = cornerSegments[(currentIndex) % cornerSegments.length];
        //     }
        // } else if (currentSegmentType === 'corner') {
        //     if (roadSegments.length > 0) {
        //         nextSegment = roadSegments[(currentIndex + 1) % roadSegments.length];
        //     }
        // }
    
        return {
            currentSeg: currentSegment,
            // nextSeg: nextSegment,
            roadType: currentSegmentType
        };
    }

    isOnSegment(segment) {
        const segmentCenter = segment.state.center;
        const segmentWidth = segment.state.segmentWidth;
        const segmentLength = segment.state.segmentLength;
    
        const studentPos = this.state.position;
    
        // Calculate the segment's bounds
        const halfWidth = segmentWidth / 2;
        const halfLength = segmentLength / 2;
    
        // Check if student is within the segment's bounds
        const inXBounds = Math.abs(studentPos.x - segmentCenter.x) <= halfWidth;
        const inZBounds = Math.abs(studentPos.z - segmentCenter.z) <= halfLength;
    
        return inXBounds && inZBounds;
    }
}

export default Student;
