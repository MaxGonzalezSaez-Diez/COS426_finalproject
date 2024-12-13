// CREDITS Road: https://stock.adobe.com/images/granite-cobblestoned-pavement-background-stone-pavement-texture-abstract-background-of-cobblestone-pavement-close-up-seamless-texture/403115894
// CREDITS sidewalk: https://www.google.com/imgres?q=sidewalk%20texture%20cobblestone%20dark%20brown&imgurl=http%3A%2F%2Fwww.sketchuptextureclub.com%2Fpublic%2Ftexture%2F0057-street-paving-cobblestone-texture-seamless.jpg&imgrefurl=https%3A%2F%2Fwww.sketchuptextureclub.com%2Ftextures%2Farchitecture%2Froads%2Fpaving-streets%2Fcobblestone%2Fstreet-paving-cobblestone-texture-seamless-07389&docid=On-TF9Uinv7jtM&tbnid=VdW8x694cKQ3zM&vet=12ahUKEwir19iFkKWKAxWHF1kFHS0qKsQQM3oECGMQAA..i&w=1200&h=989&hcb=2&ved=2ahUKEwir19iFkKWKAxWHF1kFHS0qKsQQM3oECGMQAA
import {
    Group,
    PlaneGeometry,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    TextureLoader,
    RepeatWrapping,
    Vector3,
} from 'three';
import texture from './cobblestone.jpeg';
import sidewalkTexture from './stone2.jpeg';

class RoadCorner extends Group {
    constructor(
        parent,
        {
            segmentWidth = 20,
            center = new Vector3(),
            oldDirection = new Vector3(),
            direction = new Vector3(),
            turn = 'turn-left',
            initialsidewalkColor: initialsidewalkColor,
            initialroadColor: initialroadColor,
        } = {}
    ) {
        super();

        this.state = {
            gui: parent.state.gui,
            parent: parent,
            type: 'corner',
            segmentWidth: segmentWidth,
            segmentLength: segmentWidth,
            center: center,
            oldDirection: oldDirection,
            turn: turn,
            direction: direction,
            initialsidewalkColor: initialsidewalkColor,
            initialroadColor: initialroadColor,
            prev_turn: false,
        };

        const currentSideWalkColor = initialsidewalkColor;
        const currentRoadColor = initialroadColor;

        // Create road geometry
        const geometry = new PlaneGeometry(
            this.state.segmentWidth,
            this.state.segmentWidth
        );

        // Load and configure road texture
        const textureLoader = new TextureLoader();
        const roadTexture = textureLoader.load(texture);
        roadTexture.wrapS = RepeatWrapping;
        roadTexture.wrapT = RepeatWrapping;
        roadTexture.repeat.set(segmentWidth / 10, segmentWidth / 10);

        // Create road material
        const material = new MeshBasicMaterial({
            map: roadTexture,
            color: currentRoadColor,
        });

        // Create road mesh
        const roadMesh = new Mesh(geometry, material);

        // Rotate road to be horizontal
        roadMesh.rotation.x = -Math.PI / 2;

        // Position road based on type
        roadMesh.position.copy(center);

        // Add to the group
        this.add(roadMesh);

        // add corners ]
        // Create sidewalks
        const sidewalkWidth = 2; // Adjust the width of the sidewalk as needed
        const sidewalkHeight = 1; // Adjust the height of the sidewalk as needed

        // Load sidewalk texture
        const sidewalkTextureLoader = new TextureLoader();
        const sidewalkTextureMap = sidewalkTextureLoader.load(sidewalkTexture);
        const sideTexture = sidewalkTextureLoader.load(sidewalkTexture);

        sidewalkTextureMap.wrapS = RepeatWrapping;
        sidewalkTextureMap.wrapT = RepeatWrapping;
        sidewalkTextureMap.repeat.x = 0.1;
        sideTexture.repeat.y = 0.1;

        const materials = [
            new MeshBasicMaterial({
                color: currentSideWalkColor,
                map: sideTexture,
            }), // Side faces
            new MeshBasicMaterial({
                color: currentSideWalkColor,
                map: sideTexture,
            }), // Other side faces
            new MeshBasicMaterial({
                color: currentSideWalkColor,
                map: sidewalkTextureMap,
            }), // Top face
            new MeshBasicMaterial({
                color: currentSideWalkColor,
                map: sidewalkTextureMap,
            }), // Bottom face
            new MeshBasicMaterial({
                color: currentSideWalkColor,
                map: sideTexture,
            }), // Front face
            new MeshBasicMaterial({
                color: currentSideWalkColor,
                map: sideTexture,
            }), // Back face
        ];

        const sidewalkGeometry = new BoxGeometry(
            sidewalkWidth,
            sidewalkHeight,
            this.state.segmentLength + 2
        );

        let leftSidewalk = new Mesh(sidewalkGeometry, materials);
        let rightSidewalk = new Mesh(sidewalkGeometry, materials);

        leftSidewalk.position.set(
            center.x,
            center.y + sidewalkHeight / 2,
            center.z
        );

        rightSidewalk.position.set(
            center.x,
            center.y + sidewalkHeight / 2,
            center.z
        );

        const offsetDir = new Vector3(
            oldDirection.z,
            0,
            -oldDirection.x
        ).normalize();
        const offsetDirO = new Vector3(
            oldDirection.x,
            0,
            oldDirection.z
        ).normalize();

        if (oldDirection.x === 1) {
            let m = 1;
            if (turn == 'turn-left') {
                m = -1;
            }
            leftSidewalk.position.add(
                offsetDirO.clone().multiplyScalar(this.state.segmentWidth / 2)
            );
            rightSidewalk.rotation.y = Math.PI / 2;
            rightSidewalk.position.add(
                offsetDir
                    .clone()
                    .multiplyScalar((m * this.state.segmentWidth) / 2)
            );
        } else if (oldDirection.x == -1) {
            let m = 1;
            if (turn == 'turn-left') {
                m = -1;
            }
            leftSidewalk.position.add(
                offsetDirO.clone().multiplyScalar(this.state.segmentWidth / 2)
            );
            rightSidewalk.rotation.y = Math.PI / 2;
            rightSidewalk.position.add(
                offsetDir
                    .clone()
                    .multiplyScalar((m * this.state.segmentWidth) / 2)
            );
        } else if (oldDirection.z == 1) {
            let m = 1;
            if (turn == 'turn-left') {
                m = -1;
            }
            leftSidewalk.position.add(
                offsetDir
                    .clone()
                    .multiplyScalar((m * this.state.segmentWidth) / 2)
            );
            rightSidewalk.rotation.y = Math.PI / 2;
            rightSidewalk.position.add(
                offsetDirO.clone().multiplyScalar(this.state.segmentWidth / 2)
            );
        } else if (oldDirection.z == -1) {
            let m = 1;
            if (turn == 'turn-left') {
                m = -1;
            }
            leftSidewalk.position.add(
                offsetDir
                    .clone()
                    .multiplyScalar((m * this.state.segmentWidth) / 2)
            );
            rightSidewalk.rotation.y = Math.PI / 2;
            rightSidewalk.position.add(
                offsetDirO.clone().multiplyScalar(this.state.segmentWidth / 2)
            );
        }

        this.add(leftSidewalk);
        this.add(rightSidewalk);
        // Add self to parent's update list (if needed)
        parent.addToUpdateList(this);
    }

    update(timeStamp) {
        // for animations; currently empty
    }
}

export default RoadCorner;
