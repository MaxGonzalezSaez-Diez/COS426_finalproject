import * as Dat from 'dat.gui';
import { Scene, Color, Vector3} from 'three';
import { RoadChunk, Student} from 'objects';
import { BasicLights } from 'lights';
import ProceduralRoad from '../objects/ProceduralRoad/ProceduralRoad';

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
            cameraPos: new Vector3(0, 0, 0),
            studentPos: new Vector3(0, 0, 0),
        };

        // Set background to a nice color
        this.background = new Color(0xaaaaee);

        // Add meshes to scene
        this.RoadChunk = new ProceduralRoad(this);
        this.student = new Student(this);
        const lights = new BasicLights();
        this.add(lights, this.RoadChunk, this.student);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { updateList } = this.state;
        const stPos = this.student.state.position;
        this.state.studentPos.set(
            stPos.x,
            stPos.y, 
            stPos.z
        )
        this.state.cameraPos.set(
            stPos.x,
            stPos.y + 9, 
            stPos.z - 20
        );

        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default SeedScene;
