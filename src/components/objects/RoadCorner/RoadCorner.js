import { Group, PlaneGeometry, MeshBasicMaterial, Mesh, TextureLoader, RepeatWrapping, Vector3 } from 'three';
import texture from './cobblestone.jpeg';

class RoadCorner extends Group {
    constructor(parent, {
        segmentWidth = 20, 
        center = new Vector3(),
    } = {}) {
        super();

        this.state = {
            gui: parent.state.gui,
            parent: parent,
            segmentWidth: segmentWidth, 
            segmentLength: segmentWidth,
            center: center,
        };

        // Create road geometry 
        const geometry = new PlaneGeometry(this.state.segmentWidth, this.state.segmentWidth);
        
        // Load and configure road texture
        const textureLoader = new TextureLoader();
        const roadTexture = textureLoader.load(texture); 
        roadTexture.wrapS = RepeatWrapping;
        roadTexture.wrapT = RepeatWrapping;
        roadTexture.repeat.set(segmentWidth/10, segmentWidth/10);

        // Create road material
        const material = new MeshBasicMaterial({ 
            map: roadTexture 
        });

        // Create road mesh
        const roadMesh = new Mesh(geometry, material);

        // Rotate road to be horizontal
        roadMesh.rotation.x = -Math.PI / 2;

        // Position road based on type
        roadMesh.position.copy(center);
        
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

export default RoadCorner;