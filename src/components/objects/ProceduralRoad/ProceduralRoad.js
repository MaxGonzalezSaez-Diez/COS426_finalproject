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
            startSegments = 2,
            fracTurns = 0.3,
            obstacleSpawnProbability = 1,
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
            });
        }
    }

    generateNextRoadSegment({
        forceStraight = false,
        disableObstacles = false,
    } = {}) {
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
        });

        // Add to scene and tracking
        this.add(roadSegment);
        this.state.roadSegments.push(roadSegment);

        if (segmentType === 'straight') {
            return roadSegment;
        }

        // TODO: clean this up! delete past road segments
        if (nrCurSeg > 0) {
            const roadCorner = new RoadCorner(this.state.parent, {
                segmentWidth: this.state.segmentWidth,
                center: newCorner.clone(),
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

    update(timeStamp, student) {
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

        if (distance < 700) {
            this.generateNextRoadSegment();
        }
    }
}

export default ProceduralRoad;
