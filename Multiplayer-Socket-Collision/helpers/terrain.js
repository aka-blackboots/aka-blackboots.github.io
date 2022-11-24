import {
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    Scene,
    TextureLoader,
    MeshPhongMaterial,
    RepeatWrapping,
    sRGBEncoding,
    AmbientLight,
    DirectionalLight,
    Fog,
    Color,
    BoxGeometry
} from 'three';


export class Terrain {
    constructor(scene) {
        this.scene = scene;

        this.background();
        this.basicLights();
        this.createBasicTerrain();
    }

    background(){
        this.scene.background = new Color(0xffffff);
        //this.scene.fog = new Fog(0xffffff, 10, 200);
    }

    basicLights(){
        this.scene.add(new AmbientLight(0x222222));

        const dLight = new DirectionalLight(0xffffff, 2.25);
        //dLight.position.set(200,450,500);
        dLight.castShadow = true;

        this.scene.add( dLight );
    }

    createBasicTerrain() {

        const groundTerrain = new TextureLoader().load('https://i.postimg.cc/VvNZKKnB/grasslight-big.jpg');
        //const groundGeometry = new PlaneGeometry(1000, 1000);
        const groundGeometry = new BoxGeometry(1000, 10, 1000);
        const groundMaterial = new MeshPhongMaterial({
            color: 0xffffff,
            map: groundTerrain
        });

        //const groundMaterial = new MeshBasicMaterial({color: 'green', side: DoubleSide});

        this.ground = new Mesh(groundGeometry, groundMaterial);
        this.ground.material.map.repeat.set( 512, 512 );
        this.ground.material.map.wrapS = RepeatWrapping;
        this.ground.material.map.wrapT = RepeatWrapping;
        this.ground.material.map.encoding = sRGBEncoding;
        //ground.receiveShadow = true;
        this.scene.add(this.ground)
    }


}