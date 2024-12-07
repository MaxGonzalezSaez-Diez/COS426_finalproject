import { Group, Vector3 } from 'three';
import RoadChunk from '../RoadChunk/RoadChunk.js';

class ProceduralRoad extends Group {
    constructor(parent, {
        segmentWidth = 20,
        segmentLength = 100,
        startSegments = 2,
        fracTurns = 1,
    } = {}) {
        super();

        this.state = {
            parent: parent,
            roadSegments: [],
            segmentWidth: segmentWidth,
            segmentLength: segmentLength,
            fracTurns: fracTurns,
            startSegments: startSegments,
            currentDirection: new Vector3(0, 0, 1), 
            currentPosition: new Vector3(0, 0, 0)
        };

        this.generateInitialRoad();
        parent.addToUpdateList(this);
    }

    generateInitialRoad() {
        // Generate first few segments
        for (let i = 0; i < this.state.startSegments; i++) {
            this.generateNextRoadSegment(false);
        }
    }

    generateNextRoadSegment(forceStraint = false) {
        // Determine segment type
        let segmentType = 'straight';
        if (!forceStraint) {
            const shouldTurn = Math.random() < this.state.fracTurns;
            segmentType = shouldTurn 
                ? (Math.random() < 0.5 ? 'turn-left' : 'turn-right') 
                : 'straight';
        }
        let lastCenterX = 0;
        let lastCenterZ = 0;
        let newCenter = new Vector3();
        let newDirection = new Vector3(0, 0, 1);
        let nrCurSeg = this.state.roadSegments.length;
        if (nrCurSeg > 0) {
            const lastPiece = this.state.roadSegments[nrCurSeg - 1];
            lastCenterX = lastPiece.state.centerPieceX;
            lastCenterZ = lastPiece.state.centerPieceZ;
            let oldCenter = new Vector3(lastCenterX, 0, lastCenterZ);
            let oldDirection = lastPiece.state.direction.clone();
            newCenter = oldCenter.clone().add(oldDirection.clone().multiplyScalar(this.state.segmentLength).clone());
            
            const axis = new Vector3(0, 1, 0);

            if (segmentType === 'straight') {
                newDirection = oldDirection.clone();
            } else if (segmentType === 'turn-left') {
                const angle = Math.PI / 2;
                newDirection = oldDirection.clone().applyAxisAngle(axis, angle);
            } else if (segmentType === 'turn-right') {
                const angle = -Math.PI / 2;
                newDirection = oldDirection.clone().applyAxisAngle(axis, angle);
            }

            newCenter = oldCenter.clone().add(newDirection.clone().multiplyScalar(this.state.segmentLength).clone()).clone()
        }


        // Create road segment
        const roadSegment = new RoadChunk(this.state.parent, {
            segmentWidth: this.state.segmentWidth,
            segmentLength: this.state.segmentLength,
            centerPieceX: newCenter.x,
            centerPieceZ: newCenter.z,
            direction: newDirection.clone()
        });

        // Update current state
        this.state.currentPosition.set(newCenter.x, 0, newCenter.z);
        this.state.currentDirection.copy(newDirection);

        // Add to scene and tracking
        this.add(roadSegment);
        this.state.roadSegments.push(roadSegment);

        // Remove old segments if we exceed max
        if (this.state.roadSegments.length > this.state.maxSegments) {
            const oldSegment = this.state.roadSegments.shift();
            this.remove(oldSegment);
        }

        return roadSegment;
    }

    update(timeStamp) {
        // Potential future dynamic road generation can go here
        // Currently, road generation happens during construction
    }
}

export default ProceduralRoad;