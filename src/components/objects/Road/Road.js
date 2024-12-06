import { Group, PlaneGeometry, MeshBasicMaterial, Mesh, TextureLoader, RepeatWrapping } from 'three';
import texture from './cobblestone.jpeg';

class Road extends Group {
    constructor(parent) {
        super();

        // Init state
        this.state = {
            gui: parent.state.gui,
        };

        // Create road geometry
        const roadWidth = 20;
        const roadLength = 1000; // Long road stretching to infinity
        const geometry = new PlaneGeometry(roadWidth, roadLength);
        
        // Load and configure road texture (optional)
        const textureLoader = new TextureLoader();
        const roadTexture = textureLoader.load(texture); 
        roadTexture.wrapS = RepeatWrapping;
        roadTexture.wrapT = RepeatWrapping;
        roadTexture.repeat.set(2, 100); // Adjust texture repeat for road look

        // Create road material
        const material = new MeshBasicMaterial({ 
            // color: 0x555555, 
            map: roadTexture 
        });

        // Create road mesh
        const roadMesh = new Mesh(geometry, material);

        // Rotate road to be horizontal
        roadMesh.rotation.x = -Math.PI / 2;

        // Position road in the center
        roadMesh.position.set(0, 0, roadLength/2);

        // Add to the group
        this.add(roadMesh);

        // Add self to parent's update list (if needed)
        parent.addToUpdateList(this);
    }

    update(timeStamp) {
        // Optional update method if you want any animations
        // Currently left empty
    }
}

export default Road;