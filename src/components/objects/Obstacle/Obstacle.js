import { Group, Vector3, AnimationMixer } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODELCONE from './cone.glb';
import MODELFOX from './fox.glb';
import * as THREE from 'three';

class Obstacle extends Group {
    constructor(parent, position, roadWidth) {
        super();

        const laneCount = 5;

        this.state = {
            parent: parent,
            position: position || new THREE.Vector3(0, 0, 0), // Default to (0, 0, 0)
            roadWidth: roadWidth || 20,
            laneCount: laneCount,
        };

        const laneWidth = roadWidth / (laneCount - 1);
        const randomLane = Math.floor(Math.random() * this.state.laneCount) - 2;
        const loader = new GLTFLoader();
        loader.load(MODELCONE, (gltf) => {
            this.state.gltf = gltf;
            this.state.model = gltf.scene;

            this.state.model.scale.set(2.5, 2.5, 2.5);

            // Position the obstacle
            this.state.model.position.set(
                randomLane * laneWidth,
                0,
                position.z
            );

            // Add the obstacle to the parent (scene or group)
            this.state.parent.add(this.state.model);
        });

        // this.name = 'obstacle';
        // parent.addToUpdateList(this);
        // window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    moveAlongRoad() {
        const { currentSeg, roadType } = this.findCurrentSegment(
            this.state.parent.state.roadChunk.state
        );

        if (currentSeg) {
            this.state.currentSegment = currentSeg;
            this.state.roadType = roadType;

            const laneOffset = this.state.currentLane * this.state.laneWidth;
            const direction = currentSeg.state.direction.clone().normalize();

            this.state.position.add(direction.multiplyScalar(laneOffset));

            if (this.state.model) {
                this.state.model.rotation.y = Math.atan2(
                    direction.x,
                    direction.z
                );
            }

            this.position.copy(this.state.position);
        }
    }

    turn(turn_direction) {
        const { currentSeg, roadType } = this.findCurrentSegment(
            this.state.parent.state.roadChunk.state
        );

        const turnEdge = Math.round((this.state.laneCount - 1) / 2);
        let moveSign = 0;
        let angle = 0;
        if (turn_direction === 'left' && this.state.currentLane > -turnEdge) {
            moveSign = 1;
            angle = Math.PI / 2;

            if (roadType !== 'corner') {
                this.state.currentLane -= 1;
            }
        } else if (
            turn_direction === 'right' &&
            this.state.currentLane < turnEdge
        ) {
            moveSign = -1;
            angle = -Math.PI / 2;
            if (roadType !== 'corner') {
                this.state.currentLane += 1;
            }
        }

        if (roadType === 'corner') {
            const { newLane, closestCenter } = this.findClosestSubSquareCenter(
                this.state.position,
                currentSeg.state.center.clone(),
                currentSeg.state.segmentWidth,
                this.state.laneCount,
                this.state.currentLane,
                this.state.direction.clone(),
                turn_direction
            );

            const newDirection = this.state.direction
                .clone()
                .applyAxisAngle(this.state.rotAxis, angle);
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

            const centerLane = offsetDir
                .clone()
                .multiply(currentSeg.position.clone());
            const pushOfSegment = offsetDir
                .clone()
                .multiplyScalar(moveSign * this.state.laneWidth);
            this.state.position.add(centerLane.clone().add(pushOfSegment));
        }
    }

    // Update the obstacle's position on the road, following the procedural path
    update(timeStamp) {
        this.state.count += 1;

        if (this.state.prev == null) {
            this.state.prev = timeStamp;
        }
        this.state.now = timeStamp;

        const deltaTime = this.state.now - this.state.prev;

        if (this.state.mixer) {
            this.state.mixer.update(
                0.1 * Math.log10(this.state.spf * this.state.speed + 15)
            );
        }

        this.moveAlongRoad(); // Move obstacle along the road

        this.position.copy(this.state.position);
        this.state.prev = timeStamp;
    }

    findClosestSubSquareCenter(
        position,
        center,
        segmentWidth,
        laneCount,
        currentLane,
        direction,
        turn_direction
    ) {
        const sectionSize = segmentWidth / laneCount;
        const localPosition = position.clone().sub(center);

        const halfLaneCount = Math.floor(laneCount / 2);
        const xIndex = Math.round(localPosition.x / sectionSize);
        const zIndex = Math.round(localPosition.z / sectionSize);

        const clampedXIndex = Math.max(
            -halfLaneCount,
            Math.min(halfLaneCount, xIndex)
        );
        const clampedZIndex = Math.max(
            -halfLaneCount,
            Math.min(halfLaneCount, zIndex)
        );

        // Calculate the center of the closest small square
        const closestCenter = center
            .clone()
            .add(
                new Vector3(
                    clampedXIndex * sectionSize,
                    0,
                    clampedZIndex * sectionSize
                )
            );

        let newLane = null;
        if (Math.round(direction.z) === 1) {
            if (turn_direction == 'right') {
                newLane = -clampedZIndex;
            } else {
                newLane = clampedZIndex;
            }
        } else if (Math.round(direction.z) === -1) {
            if (turn_direction == 'right') {
                newLane = clampedZIndex;
            } else {
                newLane = -clampedZIndex;
            }
        } else if (Math.round(direction.x) === 1) {
            if (turn_direction == 'right') {
                newLane = -clampedXIndex;
            } else {
                newLane = clampedXIndex;
            }
        } else if (Math.round(direction.x) === -1) {
            if (turn_direction == 'right') {
                newLane = clampedXIndex;
            } else {
                newLane = -clampedXIndex;
            }
        }

        return { newLane, closestCenter };
    }

    handleKeyDown(event) {
        switch (event.key.toLowerCase()) {
            case 'a':
            case 'arrowleft':
                this.turn('left');
                break;
            case 'd':
            case 'arrowright':
                this.turn('right');
                break;
            // case 'w':
            // case 'arrowup':
            //    this.jump();
            //     break;
        }
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
                roadType: null,
            };
        }

        return {
            currentSeg: currentSegment,
            // nextSeg: nextSegment,
            roadType: currentSegmentType,
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
        const inZBounds =
            Math.abs(studentPos.z - segmentCenter.z) <= halfLength;

        return inXBounds && inZBounds;
    }
}

export default Obstacle;
