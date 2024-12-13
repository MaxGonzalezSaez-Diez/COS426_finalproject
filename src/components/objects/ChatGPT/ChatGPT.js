// CREDITS: claude: https://brandfetch.com/claude.ai
// openai chatgpt: https://media.licdn.com/dms/image/v2/D5612AQGNFfMWKQZSSg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1688612205621?e=1739404800&v=beta&t=vhy8VMddHkExjJCvSC81ozckiK07Gme003ZsyibfPEc
import {
    Group,
    Vector3,
    AnimationMixer,
    THREE,
    BoxHelper,
    RepeatWrapping,
    Box3,
    BoxGeometry,
    TextureLoader,
    MeshBasicMaterial,
    Mesh,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODELCHATGPT from './ChatGPT.glb';
import gptAI from './gpt.jpeg';
import claAO from './claude.jpeg';

class ChatGPT extends Group {
    constructor(parent, { position = new Vector3() }) {
        super();

        this.state = {
            parent: parent,
            model: null,
            position: position,
            boundingBox: new Box3(),
            roadWidth: parent.state.roadWidth,
            laneCount: parent.state.laneCount,
            laneWidth: parent.state.laneWidth,
            marked: false,
        };

        this.name = 'cgpt';
        this.addChatGPT();
        parent.addToUpdateList(this);
    }

    addChatGPT() {
        const geometry = new BoxGeometry(2, 2, 2);

        const textureLoader = new TextureLoader();

        const r = Math.random();
        let roadTexture = textureLoader.load(gptAI);
        if (r > 0.7) {
            roadTexture = textureLoader.load(claAO);
        }
        roadTexture.wrapS = RepeatWrapping;
        roadTexture.wrapT = RepeatWrapping;
        roadTexture.repeat.set(1, 1);

        const material = new MeshBasicMaterial({ map: roadTexture });
        const roadMesh = new Mesh(geometry, material);
        this.state.model = roadMesh;
        // roadMesh.rotation.x = -Math.PI / 2;

        roadMesh.position.set(
            this.state.position.x,
            this.state.position.y + 3,
            this.state.position.z
        );

        this.add(roadMesh);

        this.state.boundingBox.setFromObject(roadMesh);
        const boundingBoxHelper = new BoxHelper(roadMesh, 0xff0000);
        this.add(boundingBoxHelper);
        this.state.parent.add(boundingBoxHelper);
        // store the BoxHelper for updates
        this.state.boundingBoxHelper = boundingBoxHelper;
        // Add the obstacle to the parent (scene or group)
        this.state.parent.add(roadMesh);
        this.state.boundingBoxHelper.visible = false;
        this.updateBoundingBox();
    }

    updateBoundingBox() {
        if (this.state.model) {
            // compute the bounding box based on the model's current state
            this.state.boundingBox.setFromObject(this.state.model);

            // update the BoxHelper to match the bounding box
            if (this.state.boundingBoxHelper) {
                this.state.boundingBoxHelper.update();
            }
        }
    }

    collect() {
        // TODO: add sound here on collection
        this.remove(this.state.model);
        this.state.parent.remove(this.state.model);
    }

    hideBBox() {
        this.state.boundingBoxHelper.visible = false;
    }

    showBBox() {
        this.state.boundingBoxHelper.visible = true;
    }

    delete() {
        this.remove(this.state.model);
        this.state.parent.remove(this.state.model);
        this.remove(this.state.boundingBox);
        this.state.parent.remove(this.state.boundingBox);
        this.remove(this.state.boundingBoxHelper);
        this.state.parent.remove(this.state.boundingBoxHelper);
    }

    update(timeStamp) {
        if (this.state.model) {
            this.state.model.rotation.y = timeStamp * 0.001;
            this.state.boundingBox.setFromObject(this.state.model);
            if (this.state.boundingBoxHelper) {
                this.state.boundingBoxHelper.update();
            }
        }
    }
}

export default ChatGPT;
