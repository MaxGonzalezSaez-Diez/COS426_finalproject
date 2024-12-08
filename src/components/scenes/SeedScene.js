import * as Dat from 'dat.gui';
import { Scene, Color, Vector3 } from 'three';
import { RoadChunk, Student } from 'objects';
import { BasicLights } from 'lights';
import ProceduralRoad from '../objects/ProceduralRoad/ProceduralRoad';
import Obstacle from '../objects/Obstacle/Obstacle';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            // gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
            roadLength: 1000,
            totalLength: 5000,
            student: null,
            obstacle: null,
            roadChunk: null,
            lights: null,
            roadWidth: 20,
            // cameraPos: new Vector3(),
            studentPos: new Vector3(),
            obstaclePos: new Vector3(),
        };

        // Set background to a nice color
        this.background = new Color(0xaaaaee);

        // Add meshes to scene
        this.state.roadChunk = new ProceduralRoad(this);
        this.state.student = new Student(this, {
            roadWidth: this.state.roadWidth,
        });
        this.state.obstacle = new Obstacle(this, {
            roadWidth: this.state.roadWidth,
        });

        this.state.lights = new BasicLights();
        this.add(
            this.state.lights,
            this.state.roadChunk,
            this.state.student,
            this.state.obstacle
        );
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { updateList } = this.state;
        const stPos = this.state.student.state.position;
        const obsPos = this.state.obstacle.state.position;
        this.state.studentPos.set(stPos.x, stPos.y, stPos.z);
        this.state.obstaclePos.set(obsPos.x, obsPos.y, obsPos.z);
        // this.state.cameraPos.set(
        //     stPos.x,
        //     stPos.y + 9,
        //     stPos.z - 20
        // );

        for (const obj of updateList) {
            if (obj.constructor.name === 'ProceduralRoad') {
                obj.update(timeStamp, this.state.student);
                obj.update(timeStamp, this.state.obstacle);

                // console.log('Updating ProceduralRoad');
            } else {
                obj.update(timeStamp);
            }
        }
    }
}

export default SeedScene;
