import { Group, Vector3 } from 'three';
//import * as THREE from 'three';
import RoadChunk from '../RoadChunk/RoadChunk.js';
import RoadCorner from '../RoadCorner/RoadCorner.js';

class ProceduralRoad extends Group {
    constructor(
        parent,
        {
            segmentWidth = 25,
            segmentLength = 100,
            startSegments = 1,
            fracTurns = 0.1,
            obstacleSpawnProbability = 1,
            laneCount = 5,
            roadWidth = 20,
            laneWidth = 4,
        } = {}
    ) {
        super();

        this.state = {
            parent: parent,
            roadSegments: [],
            cornerSegments: [],
            segmentWidth: segmentWidth,
            segmentLength: segmentLength,
            fracTurns: fracTurns,
            startSegments: startSegments,
            currentDirection: new Vector3(0, 0, 1),
            currentPosition: new Vector3(0, 0, 0),
            obstacleSpawnProbability: obstacleSpawnProbability,
            roadWidth: roadWidth,
            laneCount: laneCount,
            laneWidth: laneWidth,
        };

        this.generateInitialRoad();
        parent.addToUpdateList(this);
    }

    generateInitialRoad() {
        // Generate first few segments
        for (let i = 0; i < this.state.startSegments; i++) {
            this.generateNextRoadSegment({
                forceStraight: true,
                disableObstacles: true,
                timeElapsed: 0,
            });
        }
    }

    // BUG: Roads overlap sometimes. Somehow we need to keep track of that
    generateNextRoadSegment({
        forceStraight = false,
        disableObstacles = false,
        timeElapsed = 0, // Add timeElapsed parameter
    } = {}) {
        console.log('Time Elapsed, generateNextRoadSegement', timeElapsed);

        let segmentType = 'straight';
        if (!forceStraight) {
            const shouldTurn = Math.random() < this.state.fracTurns;
            segmentType = shouldTurn
                ? Math.random() < 0.5
                    ? 'turn-left'
                    : 'turn-right'
                : 'straight';
        }
        let newCenter = new Vector3();
        let newCorner = new Vector3();

        let newDirection = new Vector3(0, 0, 1);
        let nrCurSeg = this.state.roadSegments.length;

        if (nrCurSeg > 0) {
            const lastPiece = this.state.roadSegments[nrCurSeg - 1];
            const oldCenter = lastPiece.state.center;
            const oldDirection = lastPiece.state.direction.clone();
            const axis = new Vector3(0, 1, 0);
            newCorner = oldCenter.clone().add(
                oldDirection
                    .clone()
                    .multiplyScalar(
                        this.state.segmentLength / 2 +
                            (this.state.segmentWidth * 1) / 2
                    )
                    .clone()
            );

            if (segmentType === 'straight') {
                // newCenter = oldCenter.clone().add(oldDirection.clone().multiplyScalar(this.state.segmentLength/2 + this.state.segmentWidth*1/2).clone());
                newCenter = oldCenter.clone().add(
                    oldDirection
                        .clone()
                        .multiplyScalar(this.state.segmentLength / 2)
                        .clone()
                );

                newDirection = oldDirection.clone();

                newCenter = newCenter
                    .clone()
                    .add(
                        newDirection
                            .clone()
                            .multiplyScalar(this.state.segmentLength / 2)
                            .clone()
                    )
                    .clone();
            } else {
                let angle = -Math.PI / 2;
                if (segmentType === 'turn-left') {
                    angle = Math.PI / 2;
                }
                newCenter = oldCenter.clone().add(
                    oldDirection
                        .clone()
                        .multiplyScalar(
                            this.state.segmentLength * 0.5 +
                                (this.state.segmentWidth * 1) / 2
                        )
                        .clone()
                );

                newDirection = oldDirection.clone().applyAxisAngle(axis, angle);

                newCenter = newCenter
                    .clone()
                    .add(
                        newDirection
                            .clone()
                            .multiplyScalar(
                                this.state.segmentLength / 2 +
                                    (this.state.segmentWidth * 1) / 2
                            )
                            .clone()
                    )
                    .clone();
            }
        }

        // Create road segment
        const roadSegment = new RoadChunk(this.state.parent, {
            segmentWidth: this.state.segmentWidth,
            segmentLength: this.state.segmentLength,
            center: newCenter.clone(),
            direction: newDirection.clone().normalize(),
            disableObstacles: disableObstacles,
            initialroadColor: this.state.parent.state.roadColor,
            initialsidewalkColor: this.state.parent.state.sidewalkColor,
            timeElapsed: timeElapsed, // pass timeElapsed to RoadChunk
            // roadWidth: roadWidth,
            // laneCount: laneCount,
            // laneWidth: laneWidth,
        });

        // Add to scene and tracking
        this.add(roadSegment);
        this.state.roadSegments.push(roadSegment);

        if (segmentType === 'straight') {
            return roadSegment;
        }

        // TODO: clean this up! delete past road segments
        const lastPiece = this.state.roadSegments[nrCurSeg - 1];
        const oldDirection = lastPiece.state.direction.clone();

        if (nrCurSeg > 0) {
            const roadCorner = new RoadCorner(this.state.parent, {
                segmentWidth: this.state.segmentWidth,
                center: newCorner.clone(),
                oldDirection: oldDirection.clone().normalize(),
                turn: segmentType,
                initialroadColor: this.parent.state.roadColor,
                initialsidewalkColor: this.parent.state.sidewalkColor,
            });

            this.add(roadCorner);
            this.state.cornerSegments.push(roadCorner);
        }

        // Remove old segments if we exceed max
        if (this.state.cornerSegments.length > this.state.maxSegments) {
            const oldSegment = this.state.cornerSegments.shift();
            this.remove(oldSegment);
        }

        // TODO: make sure this is clean and returns both
        return roadSegment;
    }

    update(timeStamp, student, timeElapsed) {
        console.log('Time Elapsed (update, Procedural Road)', timeElapsed);
        // generateNextRoadSegment
        const runnerPos = student.state.position;
        let nrCurSeg = this.state.roadSegments.length;
        const lastPieceCenter =
            this.state.roadSegments[nrCurSeg - 1].state.center;

        // manhattan distance doesn't work w/o vec3
        if (!(runnerPos instanceof Vector3)) {
            console.error('runnerPos is not a Vector3');
            return;
        }
        if (!(lastPieceCenter instanceof Vector3)) {
            console.error('lastPieceCenter is not a Vector3');
            return;
        }
        let distance = runnerPos.manhattanDistanceTo(lastPieceCenter);

        // TODO: we need something here that updates as a function of number of turns
        if (distance < 1500) {
            this.generateNextRoadSegment({
                forceStraight: false,
                disableObstacles: false,
                timeElapsed: timeElapsed, // Pass timeElapsed to adjust probabilities
            });
        }
    }
}

export default ProceduralRoad;
