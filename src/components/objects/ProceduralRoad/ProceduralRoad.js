import { Group, Vector3 } from 'three';
import RoadChunk from '../RoadChunk/RoadChunk.js';
import RoadCorner from '../RoadCorner/RoadCorner.js';

class ProceduralRoad extends Group {
    constructor(
        parent,
        {
            segmentWidth = 25,
            segmentLength = 100,
            startSegments = 3,
            fracTurns = 0.15,
            obstacleSpawnProbability = 1,
            prizeSpawnProbability = 1,
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
            allsegments: [],
            segmentWidth: segmentWidth,
            segmentLength: segmentLength,
            fracTurns: fracTurns,
            startSegments: startSegments,
            currentDirection: new Vector3(0, 0, 1),
            currentPosition: new Vector3(0, 0, 0),
            obstacleSpawnProbability: obstacleSpawnProbability,
            prizeSpawnProbability: prizeSpawnProbability,
            roadWidth: roadWidth,
            laneCount: laneCount,
            laneWidth: laneWidth,
            obstacles: [],
            maxSegments: 20,
            maxCornerSegments: 20,
            maxAllsegments: 25,
        };

        this.name = 'ProceduralRoad';
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

    generateNextRoadSegment({
        forceStraight = false,
        disableObstacles = false,
        timeElapsed = 0,
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

        let verticalMovement = false;
        let offset = new Vector3();

        if (this.state.roadSegments.length > 2) {
            const rand = Math.random();
            if (rand < 0.16) {
                let o = Math.min(3, 20 * (Math.random() - 1));

                offset = new Vector3(0, 1, 0).multiplyScalar(o);
                newCenter.add(offset);
            } else if (
                rand < 0.23 &&
                !this.state.parent.state.student.state.powerrun
            ) {
                verticalMovement = true;
                let o = Math.max(3, 5 * Math.random());
                offset = new Vector3(0, 1, 0).multiplyScalar(o);
                newCenter.add(offset);
            }
        }

        if (segmentType === 'turn-left' || segmentType === 'turn-right') {
            const lastPiece = this.state.roadSegments[nrCurSeg - 1];
            const oldDirection = lastPiece.state.direction.clone();

            let moveSign = 0;
            let angle = 0;
            if (segmentType === 'turn-left') {
                angle = Math.PI / 2;
            } else if (segmentType === 'turn-right') {
                angle = -Math.PI / 2;
            }

            const newDirectionCorner = oldDirection
                .clone()
                .applyAxisAngle(new Vector3(0, 1, 0), angle)
                .normalize();

            if (nrCurSeg > 0) {
                const roadCorner = new RoadCorner(this.state.parent, {
                    segmentWidth: this.state.segmentWidth,
                    center: newCorner.clone(),
                    oldDirection: oldDirection.clone().normalize(),
                    direction: newDirectionCorner,
                    turn: segmentType,
                    initialroadColor: this.parent.state.roadColor,
                    initialsidewalkColor: this.parent.state.sidewalkColor,
                });

                this.add(roadCorner);
                this.state.cornerSegments.push(roadCorner);
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
            timeElapsed: timeElapsed,
            verticalMovement: verticalMovement,
            offset: offset,
        });

        // Add to scene and tracking
        this.add(roadSegment);
        this.state.roadSegments.push(roadSegment);

        // add roadChunk obstacles
        if (
            roadSegment.state.obstacles &&
            roadSegment.state.obstacles.length > 0
        ) {
            this.state.obstacles.push(...roadSegment.state.obstacles);
        }

        if (segmentType === 'straight') {
            return;
        }
    }

    update(timeStamp, student, timeElapsed) {
        let runnerPos = new Vector3();
        if (student != undefined && student != null) {
            runnerPos = student.state.position;
        }

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

        if (distance < 300) {
            if (this.parent.state.student.state.powerrun) {
                this.generateNextRoadSegment({
                    forceStraight: true,
                    disableObstacles: false,
                    timeElapsed: timeElapsed,
                });
            } else {
                this.generateNextRoadSegment({
                    forceStraight: false,
                    disableObstacles: false,
                    timeElapsed: timeElapsed,
                });
            }
        }
    }
}

export default ProceduralRoad;
