import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Flower, Land, Road, Student} from 'objects';
import { BasicLights } from 'lights';

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
            studentPosition: 0,
        };

        // Set background to a nice color
        this.background = new Color(0xaaaaee);

        // Add meshes to scene
        this.road = new Road(this);
        this.student = new Student(this);
        const lights = new BasicLights();
        this.add(lights, this.road, this.student);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { updateList } = this.state;
       
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default SeedScene;
