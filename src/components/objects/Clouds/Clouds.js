import * as Dat from 'dat.gui';
import {
    Scene,
    Color,
    Vector3,
    TextureLoader,
    Sprite,
    SpriteMaterial,
    Group,
} from 'three';
import CLOUD from './cloud.png';

// Cloud class
class Clouds extends Group {
    constructor(parent) {
        super();

        this.state = {
            parent: parent,
            model: null,
            boundingBox: null,
            roadWidth: parent.state.roadWidth,
            laneCount: parent.state.laneCount,
            laneWidth: parent.state.laneWidth,
            cloudsSpawnRate: 1000,
            lastCloudsSpawnTime: 0,
            cloudsDistance: 200,
            cloudsSpawnRange: 300,
        };

        this.name = 'clouds';
        this.clouds = [];
        parent.addToUpdateList(this);

        this.loadClouds();
    }

    loadClouds() {
        const loader = new TextureLoader();

        loader.load(CLOUD, (texture) => {
            this.cloudMaterial = new SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: 0.8,
            });
            this.spawnCloud();
            this.spawnCloud();
        });
    }

    // Method to spawn cloud
    spawnCloud() {
        for (let i = 0; i < 50; i++) {
            const cloud = new Sprite(this.cloudMaterial);
            const stPos = this.state.parent.state.student
                ? this.state.parent.state.student.state.position
                : new Vector3(0, 0, 0);

            cloud.position.set(
                stPos.x + Math.random() * 300 - 150,
                stPos.y + Math.random() * 8 + 5,
                stPos.z + Math.random() * 300 - 150
            );

            cloud.scale.set(Math.random() * 5 + 10, Math.random() * 5 + 10, 1);

            this.add(cloud);
            this.clouds.push(cloud);
        }
    }

    // Method to remove oldest cloud
    removeOldestCloud() {
        for (let i = 0; i < 50; i++) {
            const oldestCloud = this.clouds.shift();
            this.remove(oldestCloud);
        }
    }

    // Update function (spawns more clouds)
    update(timeElapsed) {
        if (
            timeElapsed - this.state.lastCloudsSpawnTime >
            this.state.cloudsSpawnRate
        ) {
            this.spawnCloud();
            this.removeOldestCloud();
            this.state.lastCloudsSpawnTime = timeElapsed;
        }
    }
}

export default Clouds;
