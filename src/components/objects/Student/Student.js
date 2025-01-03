// CREDITS: Animated Human by Quaternius (https://poly.pizza/m/c3Ibh9I3udk); colors modified via Blender 4.3
import { Group, Vector3, AnimationMixer, Box3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './runnerv2.glb';
import { Audio } from 'three';

class Student extends Group {
    constructor(parent, { laneCount = 5, roadWidth = 20, laneWidth = 4 } = {}) {
        super();
        const startSpeed = 1;

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
            isSprinting: false,
            lastpowerrunsegment: null,
            readyToStrint: false,
            runtime: 0,
            maxRunTime: 3,
            startSpeed: startSpeed,
            speed: startSpeed, // todo: pick good speed
            spf: 2.5,
            jumpStrength: 10,
            pastSegment: null,
            secondpastSegment: null,
            currentSegment: null,
            nextSegment: null,
            roadType: null,
            roadWidth: roadWidth,
            laneCount: laneCount,
            laneWidth: laneWidth,
            currentLane: 0,
            count: 0,
            distance: 0,
            keydown: null,
        };

        this.boundingBox = new Box3();

        this.name = 'student';
        this.addStudent();
        parent.addToUpdateList(this);
        this.state.keydown = this.handleKeyDown.bind(this);
        window.addEventListener('keydown', this.state.keydown);
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
            this.state.action.timeScale =
                0.1 * Math.log10(this.state.spf * this.state.speed + 15);

            this.add(this.state.model);

            // Manually define the bounding box dimensions
            const halfRoadWidth = this.state.roadWidth / 2;
            const boundingBoxWidth = halfRoadWidth / 16;
            const boundingBoxHeight = this.state.roadWidth / 4;
            const boundingBoxLength = halfRoadWidth / 16;

            this.boundingBox.set(
                new Vector3(-boundingBoxWidth, 0, -boundingBoxLength),
                new Vector3(
                    boundingBoxWidth,
                    boundingBoxHeight,
                    boundingBoxLength
                )
            );
            this.updateBoundingBox();
        });
    }

    updateBoundingBox() {
        if (this.state.model) {
            const position = this.state.position;

            const halfRoadWidth = this.state.roadWidth / 2;
            const boundingBoxWidth = halfRoadWidth / 16;
            const boundingBoxHeight = this.state.roadWidth / 4;
            const boundingBoxLength = halfRoadWidth / 16;

            this.boundingBox.set(
                new Vector3(
                    position.x - boundingBoxWidth,
                    position.y,
                    position.z - boundingBoxLength
                ),
                new Vector3(
                    position.x + boundingBoxWidth,
                    position.y + boundingBoxHeight,
                    position.z + boundingBoxLength
                )
            );
        } else {
            console.log('No model exists');
        }
    }

    turn(turn_direction) {
        const { currentSeg, roadType } = this.findCurrentSegment(
            this.state.parent.state.roadChunk.state
        );

        let turnEdge = Math.round((this.state.laneCount - 1) / 2);
        let moveSign = 0;
        let angle = 0;
        if (
            turn_direction === 'left' &&
            (this.state.currentLane > -turnEdge || roadType == 'corner')
        ) {
            moveSign = 1;
            angle = Math.PI / 2;

            if (roadType !== 'corner') {
                this.state.currentLane -= 1;
            }
        } else if (
            turn_direction === 'right' &&
            (this.state.currentLane < turnEdge || roadType == 'corner')
        ) {
            moveSign = -1;
            angle = -Math.PI / 2;
            if (roadType !== 'corner') {
                this.state.currentLane += 1;
            }
        }

        if (roadType === 'corner') {
            if (!currentSeg.state.prev_turn) {
                currentSeg.state.prev_turn = true;
                const { newLane, closestCenter } =
                    this.findClosestSubSquareCenter(
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
            }
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

        // Calculate the center
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
            case 'w':
            case 'arrowup':
                this.jump();
                this.parent.jumpSound.play();
                break;
            case 'p':
                if (this.state.readyToStrint) {
                    this.startpowerrun();
                    this.state.readyToStrint = false;
                    this.state.parent.state.tracker = 0;
                    this.state.parent.updateProgressBar();
                }
                break;
        }
    }

    startpowerrun() {
        if (!this.state.powerrun) {
            this.state.powerrun = true;
            this.state.runtime = 0;
            if (!this.state.isSprintSoundPlaying) {
                this.parent.sprintSound.play();
                this.state.isSprintSoundPlaying = true;
            }
        } else {
            this.state.powerrun = false;
            if (this.state.isSprintSoundPlaying) {
                this.parent.sprintSound.stop();
                this.state.isSprintSoundPlaying = false;
            }
        }
    }

    powerrun(currentSeg, timeStamp, roadtype, extraTime) {
        if (this.state.isJumping) {
            this.state.isJumping = false;
            this.state.action.stop();
            const runningAnimation = this.state.gltf.animations[0];
            this.state.action = this.state.mixer.clipAction(runningAnimation);
            this.state.action.play();
            this.state.action.timeScale =
                0.1 * Math.log10(this.state.spf * this.state.speed + 15);
        }
        this.state.runtime += extraTime;

        if (currentSeg == null) {
            let { newS, newR } = this.findCurrentSegment(
                this.state.parent.state.roadChunk.state
            );

            currentSeg = newS;
            roadtype = newR;
        }
        let dir = currentSeg.state.direction.clone();
        let angle = 0;
        if (
            roadtype == 'corner' &&
            roadtype != this.state.lastpowerrunsegment
        ) {
            if (currentSeg.state.turn === 'turn-left') {
                this.turn('left');
            } else if (currentSeg.state.turn === 'turn-right') {
                this.turn('right');
            }
        }
        this.state.lastpowerrunsegment = roadtype;

        let speedupdate = Math.min(
            Math.max(2.5 * this.state.speed, 2.5 * this.state.startSpeed),
            2.5 * this.state.startSpeed
        );

        this.state.distance += dir.multiplyScalar(speedupdate).clone().length();
        this.state.position.add(dir.multiplyScalar(speedupdate));

        this.state.position.y = currentSeg.state.center.y;

        this.position.copy(this.state.position);
        this.state.prev = timeStamp;

        this.updateBoundingBox();
        const runningAnimation = this.state.gltf.animations[0];
        this.state.action = this.state.mixer.clipAction(runningAnimation);
        this.state.action.play();
        this.state.action.timeScale =
            0.1 * Math.log10(this.state.spf * 100 * this.state.speed + 15);

        // stop run when far enough from all obstacles
        const obstacles = currentSeg.state.obstacles;
        let farEnough = true;
        if (obstacles != undefined || obstacles != null) {
            for (const o of obstacles) {
                let dis = this.state.position
                    .clone()
                    .distanceTo(o.state.position.clone());
                if (dis < 45) {
                    farEnough = false;
                    break;
                }
            }
        }

        if (
            this.state.runtime > this.state.maxRunTime &&
            roadtype != 'corner' &&
            farEnough
        ) {
            this.state.powerrun = false;
            this.state.runtime = 0;
            this.state.parent.state.tracker = 0;
            this.state.readyToStrint = false;
            if (this.state.isSprintSoundPlaying) {
                this.parent.sprintSound.stop();
                this.state.isSprintSoundPlaying = false;
            }
        }
    }

    jump() {
        const { currentSeg, roadType } = this.findCurrentSegment(
            this.state.parent.state.roadChunk.state
        );

        let falling =
            this.state.position.y - currentSeg.state.center.y > 0.1
                ? true
                : false;

        // Only allow jumping if not already jumping
        if (!this.state.isJumping && !this.state.powerrun && !falling) {
            this.state.isJumping = true;
            this.state.initialY = this.state.position.y;
            this.state.jumpTime = 0;

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

        const deltaTime = this.state.now - this.state.prev;

        if (this.state.mixer) {
            this.state.mixer.update(
                0.1 * Math.log10(this.state.spf * this.state.speed + 15)
            );
        }

        const { currentSeg, roadType } = this.findCurrentSegment(
            this.state.parent.state.roadChunk.state
        );

        if (
            this.state.pastSegment != currentSeg &&
            this.state.pastSegment != null
        ) {
            if (this.state.secondpastSegment != null) {
                const pastObstacles =
                    this.state.secondpastSegment.state.obstacles || [];
                for (const obstacle of pastObstacles) {
                    obstacle.delete();
                }

                // Clear the obstacles array
                this.state.secondpastSegment.state.obstacles = [];
                this.parent.state.roadChunk.remove(
                    this.state.secondpastSegment
                );
            }

            this.state.secondpastSegment = this.state.pastSegment;
        }

        this.state.pastSegment = currentSeg;

        if (this.state.powerrun) {
            if (roadType == 'corner') {
                this.powerrun(
                    currentSeg,
                    timeStamp,
                    'corner',
                    0.001 * deltaTime
                );
            } else {
                this.powerrun(
                    currentSeg,
                    timeStamp,
                    'straight',
                    0.001 * deltaTime
                );
            }
            return;
        }

        if (currentSeg.state.center.y - this.state.position.y > 0.1) {
            this.state.position.y = currentSeg.state.center.y;
            console.log('weird bug');
        }

        if (
            !this.state.isJumping &&
            this.state.position.y > currentSeg.state.center.y
        ) {
            const fallHeight =
                this.state.position.y - currentSeg.state.center.y;
            const gravity = 10;
            const fallTimeFactor = deltaTime * 0.001;

            this.state.fallTime = (this.state.fallTime || 0) + fallTimeFactor;

            // Update the Y position using parabola-ish
            this.state.position.y =
                currentSeg.state.center.y +
                Math.max(
                    fallHeight -
                        0.25 * gravity * Math.pow(this.state.fallTime, 1.7),
                    0
                );

            if (this.state.position.y <= currentSeg.state.center.y) {
                this.state.position.y = currentSeg.state.center.y;
                this.state.fallTime = 0;
            }
        }

        if (this.state.isJumping) {
            this.state.jumpTime += deltaTime * 0.001;
            const jumpHeight = this.state.jumpStrength;
            const jumpDuration = 0.8;

            // Normalize jump time (
            let normalizedTime = this.state.jumpTime / jumpDuration;

            let easingFactor =
                Math.pow(jumpHeight, 1.35) * normalizedTime -
                14 * Math.pow(normalizedTime, 2);

            if (this.state.initialY === undefined) {
                this.state.initialY = this.state.position.y;
            }

            if (isNaN(easingFactor)) {
                easingFactor = 0;
                this.state.jumpTime = 0;
            }

            this.state.position.y = Math.max(
                this.state.initialY + easingFactor,
                currentSeg.state.center.y
            );

            // Check if jump or fall is complete
            if (
                this.state.position.y <= currentSeg.state.center.y &&
                this.state.jumpTime >= jumpDuration
            ) {
                this.state.isJumping = false;
                this.state.position.y = currentSeg.state.center.y;

                // Reset animation to running
                this.state.action.stop();
                const runningAnimation = this.state.gltf.animations[0];
                this.state.action =
                    this.state.mixer.clipAction(runningAnimation);
                this.state.action.play();
                this.state.action.timeScale =
                    0.1 * Math.log10(this.state.spf * this.state.speed + 15);
            }
        } else {
            if (this.state.action != null) {
                this.state.action.timeScale =
                    0.1 * Math.log10(this.state.spf * this.state.speed + 15);
            }
        }

        this.state.distance += this.state.direction
            .clone()
            .multiplyScalar(0.25 * this.state.speed)
            .clone()
            .length();
        this.state.position.add(
            this.state.direction.clone().multiplyScalar(0.25 * this.state.speed)
        );

        this.position.copy(this.state.position);
        this.state.prev = timeStamp;

        this.updateBoundingBox();
        this.state.speed =
            this.state.startSpeed *
            Math.log2(this.parent.state.timeElapsed + 4);
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

        if (!currentSegment) {
            return {
                currentSeg: null,
                roadType: null,
            };
        }

        return {
            currentSeg: currentSegment,
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
            halfWidth = segmentWidth / 2;
            halfLength = segmentLength / 2;
        } else {
            halfWidth = segmentLength / 2;
            halfLength = segmentWidth / 2;
        }

        const inXBounds = Math.abs(studentPos.x - segmentCenter.x) <= halfWidth;
        const inZBounds =
            Math.abs(studentPos.z - segmentCenter.z) <= halfLength;

        return inXBounds && inZBounds;
    }
}

export default Student;
