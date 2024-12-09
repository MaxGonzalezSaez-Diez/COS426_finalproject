import * as Dat from 'dat.gui';
import {
    Scene,
    Color,
    Vector3,
    TextureLoader,
    Sprite,
    SpriteMaterial, Group,
} from 'three';
import CLOUD from './cloud.png';


class Clouds extends Group {
    constructor(parent) {
        super();

        this.state = {
            parent: parent,
            model: null,
            //position: position,
            boundingBox: null,
            roadWidth: parent.state.roadWidth,
            laneCount: parent.state.laneCount,
            laneWidth: parent.state.laneWidth,
            cloudsSpawnRate: 1000,
            lastCloudsSpawnTime:0,
            //maxClouds:100,
            cloudsDistance: 200,
            cloudsSpawnRange:300,
        };

        this.name = 'clouds';
        this.clouds = [];
        parent.addToUpdateList(this);

        this.loadClouds();
       


    }

    loadClouds() {
        const loader = new TextureLoader();

        loader.load(CLOUD, (texture) => {
            // Set up the cloud material after the texture is loaded
            this.cloudMaterial = new SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: 0.8,
            });

            // Now that the texture is loaded, spawn clouds
            this.spawnCloud();
        });
    }

    // Method to spawn a new cloud
    spawnCloud() {
        for (let i = 0; i < 100; i++) {
            console.log("Spawning a new cloud");

        const cloud = new Sprite(this.cloudMaterial);
        const stPos = this.state.parent.state.student ? this.state.parent.state.student.state.position : new Vector3(0, 0, 0);

            console.log("Student position:", stPos);

        cloud.position.set(
            stPos.x + Math.random() * 200 - 100, // left to right
            stPos.y + Math.random() * 7 + 5, // height
            stPos.z + Math.random() * 200 -100 // depth
        );

        cloud.scale.set(
            Math.random() * 5 + 10,
            Math.random() * 5 + 10,
            1
        ); // Random sizes

        this.add(cloud); // Add to the group
        this.clouds.push(cloud); // Track cloud in the array
    }}

    // Method to remove the oldest cloud if we exceed the max cloud count
    removeOldestCloud() {
for (let i = 0; i < 100; i++) {
                    console.log("removing cloud");

            const oldestCloud = this.clouds.shift();  // Remove the oldest cloud from the array
            this.remove(oldestCloud);  // Remove the cloud from the group
        
    }}

    // Update function to spawn or reposition clouds
    update(timeElapsed) {
         // Only spawn and remove clouds every `cloudsSpawnRate` seconds
        if (timeElapsed - this.state.lastCloudsSpawnTime > this.state.cloudsSpawnRate) {
            console.log("Spawning and removing clouds");

            // Spawn new clouds
            this.spawnCloud();

            // Remove the oldest clouds to keep the count in balance
            this.removeOldestCloud();

            
            

            // Update the time for the next spawn event
            this.state.lastCloudsSpawnTime = timeElapsed;
        }

        
    }
}

export default Clouds;
