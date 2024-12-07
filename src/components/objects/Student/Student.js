import { Group, Vector3, AnimationMixer} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './student.glb';

class Student extends Group {
    constructor(parent, {roadWidth = 20} = {}) {
        // Call parent Group() constructor
        super();

        const laneCount = 5;
        const laneWidth = (roadWidth / (laneCount-1));

        this.state = {
            parent: parent,
            model: null,
            prev: null,
            now: null,
            mixer: null,
            action: null,
            position: new Vector3(0, 0, 0),
            direction: new Vector3(0, 0, 1),
            rotAxis: new Vector3(0, 1, 0),
            isJumping: false,
            speed: 1,
            spf: 2.5,
            jumpStrength: 10, 
            currentSegment: null,
            nextSegment: null,
            roadType: null,
            roadWidth: roadWidth,
            currentLane: 0,
            laneCount: laneCount,
            laneWidth: laneWidth,
            count: 0,
        }

        
        this.name = 'student';
        this.addStudent();
        parent.addToUpdateList(this);
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    addStudent() {
        const loader = new GLTFLoader();
        loader.load(MODEL, (gltf) => {
            this.state.gltf = gltf;
            this.state.model = gltf.scene;
            this.state.model.position.set(0, 0, 0);
            this.state.model.scale.set(1, 1, 1);
            this.state.mixer = new AnimationMixer(this.state.model);
            const runningAnimation = this.state.gltf.animations[0];
            this.state.action = this.state.mixer.clipAction(runningAnimation); 
            this.state.action.play();
            this.add(this.state.model);
        });
    }

    turn (turn_direction) {
        // if (this.state.isJumping) {
        //     return
        // }
        const { currentSeg, roadType } = this.findCurrentSegment(this.state.parent.state.roadChunk.state);
        
        // if (currentSeg == null || roadType == null) {
        //     return;
        // }
        // this.state.currentSegment = currentSeg;
        // this.state.roadType = roadType;

        const turnEdge = Math.round((this.state.laneCount-1)/2);
        let moveSign = 0;
        let angle = 0;
        if (turn_direction === 'left' && this.state.currentLane > -turnEdge) {
            moveSign = 1;
            angle = Math.PI/2;

            if (roadType !== "corner") {
                this.state.currentLane-=1;
            }
        } else if (turn_direction === 'right' && this.state.currentLane < turnEdge) {
            moveSign = -1;
            angle = -Math.PI/2;
            if (roadType !== "corner") {
                this.state.currentLane+=1;
            }
        }

        if (roadType === "corner") {

            const {newLane, closestCenter} = this.findClosestSubSquareCenter(
                this.state.position,
                currentSeg.state.center.clone(),
                currentSeg.state.segmentWidth,
                this.state.laneCount,
                this.state.currentLane,
                this.state.direction.clone(), 
                turn_direction
            );

            const newDirection = this.state.direction.clone().applyAxisAngle(this.state.rotAxis, angle);
            this.state.direction = newDirection.clone();
            this.state.model.rotation.y += angle;

            this.state.position = closestCenter;
            this.state.currentLane = newLane;

        } else {
            const curDir = this.state.direction;
            const offsetDir = new Vector3(curDir.z, 0, -curDir.x).normalize();
    
            offsetDir.set(
                Math.round(offsetDir.x),
                Math.round(offsetDir.y),
                Math.round(offsetDir.z)
            );

            const centerLane = offsetDir.clone().multiply(currentSeg.position.clone());
            const pushOfSegment = offsetDir.clone().multiplyScalar(moveSign*this.state.laneWidth)
            this.state.position.add(centerLane.clone().add(pushOfSegment));
        }

    };

    findClosestSubSquareCenter(position, center, segmentWidth, laneCount, currentLane, direction, turn_direction) {
        const sectionSize = segmentWidth / laneCount;
        const localPosition = position.clone().sub(center);
    
        const halfLaneCount = Math.floor(laneCount / 2);
        const xIndex = Math.round(localPosition.x / sectionSize);
        const zIndex = Math.round(localPosition.z / sectionSize);
    
        const clampedXIndex = Math.max(-halfLaneCount, Math.min(halfLaneCount, xIndex));
        const clampedZIndex = Math.max(-halfLaneCount, Math.min(halfLaneCount, zIndex));
    
        // Calculate the center of the closest small square
        const closestCenter = center.clone().add(new Vector3(
            clampedXIndex * sectionSize,
            0,
            clampedZIndex * sectionSize
        ));

        let newLane = null;
        if (Math.round(direction.z) === 1) {
            if (turn_direction == "right") {
                newLane = -clampedZIndex;
            } else {
                newLane = clampedZIndex;
            }
        } else if (Math.round(direction.z) === -1) {
            if (turn_direction == "right") {
                newLane = clampedZIndex;
            } else {
                newLane = -clampedZIndex;
            }
        } else if (Math.round(direction.x) === 1) {
            if (turn_direction == "right") {
                newLane = -clampedXIndex;
            } else {
                newLane = clampedXIndex;
            }
        } else if (Math.round(direction.x) === -1) {
            if (turn_direction == "right") {
                newLane = clampedXIndex;
            } else {
                newLane = -clampedXIndex;
            }
        }
    
        return {newLane, closestCenter};
    }

    handleKeyDown(event) {
        switch(event.key.toLowerCase()) {
            case 'a':
            case 'arrowleft':
                this.turn("left"); 
                break;
            case 'd':
            case 'arrowright':
                this.turn("right"); 
                break;
            case 'w':
            case 'arrowup':
                this.jump(); 
                break;
        }
    }

    jump() {
        // Only allow jumping if not already jumping
        if (!this.state.isJumping) {
            this.state.isJumping = true;
            this.state.initialY = this.state.position.y;
            this.state.jumpTime = 0;

            // this.state.mixer = new AnimationMixer(this.state.model);
            this.state.action.stop();
            const jumpingAnimation = this.state.gltf.animations[3];
            this.state.action = this.state.mixer.clipAction(jumpingAnimation); 
            this.state.action.play();
            this.state.action.timeScale = 0;
        }
    }

    update(timeStamp) {
        this.state.count += 1;

        if (this.state.prev == null) {
            this.state.prev = timeStamp;
        }
        this.state.now = timeStamp;

        const deltaTime = (this.state.now - this.state.prev);

        if (this.state.mixer) {
            this.state.mixer.update(0.1*Math.log10(this.state.spf * this.state.speed + 15)); 
        }

        if (this.state.isJumping) {
            this.state.jumpTime += deltaTime * 0.001;
            // Jumping calculation with smooth easing
            const jumpHeight = this.state.jumpStrength;
            const jumpDuration = 0.8; // Total jump duration

            // Normalize jump time (0 to 1 range)
            const normalizedTime = this.state.jumpTime / jumpDuration;
            const easingFactor = Math.sin(Math.PI * normalizedTime); 
            this.state.position.y = this.state.initialY + jumpHeight * easingFactor;
            
            // Check if jump is complete
            if (this.state.jumpTime >= jumpDuration) {
                this.state.isJumping = false;
                this.state.position.y = this.state.initialY;
                // this.state.mixer = new AnimationMixer(this.state.model);
                this.state.action.stop();
                const runningAnimation = this.state.gltf.animations[0];
                this.state.action = this.state.mixer.clipAction(runningAnimation); 
                this.state.action.play();
                this.state.action.timeScale = 0.1*Math.log10(this.state.spf * this.state.speed + 15);
            }
        } else {
            if (this.state.count > 8) {
                this.state.action.timeScale = 0.1*Math.log10(this.state.spf * this.state.speed + 15);
            }
        }

        this.state.position.add(this.state.direction.clone().multiplyScalar(0.25*this.state.speed));
        
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

        const curDir = this.state.direction.clone().normalize();
        curDir.set(
            Math.round(curDir.x),
            Math.round(curDir.y),
            Math.round(curDir.z)
        );
            
        let halfWidth = 0;
        let halfLength = 0;

        if (Math.abs(curDir.z) === 1) {
            // Calculate the segment's bounds
            halfWidth = segmentWidth / 2;
            halfLength = segmentLength / 2;
        } else {
            // Calculate the segment's bounds
            halfWidth = segmentLength / 2;
            halfLength = segmentWidth / 2;
        }

        // Check if student is within the segment's bounds
        const inXBounds = Math.abs(studentPos.x - segmentCenter.x) <= halfWidth;
        const inZBounds = Math.abs(studentPos.z - segmentCenter.z) <= halfLength;
    
        return inXBounds && inZBounds;
    }
}

export default Student;
