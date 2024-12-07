import { Group, Vector3 } from 'three';
import RoadChunk from '../RoadChunk/RoadChunk.js';

class ProceduralRoad extends Group {
    constructor(parent, {
        segmentWidth = 20,
        segmentLength = 40,
        startSegments = 5,
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
            if (i < 1) {
                this.generateNextRoadSegment(true);
            } else {
                this.generateNextRoadSegment(false);
            }
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
        let newCenter = new Vector3();
        let newDirection = new Vector3(0, 0, 1);
        let nrCurSeg = this.state.roadSegments.length;
        if (nrCurSeg > 0) {
            const lastPiece = this.state.roadSegments[nrCurSeg - 1];
            const oldCenter = lastPiece.state.center;
            const oldDirection = lastPiece.state.direction.clone();
            
            const axis = new Vector3(0, 1, 0);

            if (segmentType === 'straight') {
                newCenter = oldCenter.clone().add(oldDirection.clone().multiplyScalar(this.state.segmentLength/2).clone());

                newDirection = oldDirection.clone();

                newCenter = newCenter.clone().add(newDirection.clone().multiplyScalar(this.state.segmentLength/2).clone()).clone()
            } else { 
                let angle = -Math.PI / 2;
                if (segmentType === 'turn-left') {
                    angle = Math.PI / 2;
                } 
                newCenter = oldCenter.clone().add(oldDirection.clone().multiplyScalar(this.state.segmentLength*0.5 + this.state.segmentWidth*1/2).clone());

                newDirection = oldDirection.clone().applyAxisAngle(axis, angle);

                newCenter = newCenter.clone().add(newDirection.clone().multiplyScalar(this.state.segmentLength/2 + this.state.segmentWidth*1/2).clone()).clone()
            }


        }


        // Create road segment
        const roadSegment = new RoadChunk(this.state.parent, {
            segmentWidth: this.state.segmentWidth,
            segmentLength: this.state.segmentLength,
            center: newCenter.clone(),
            direction: newDirection.clone().normalize()
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