import {
    Scene,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    PerspectiveCamera,
    WebGLRenderer,
    Vector3,
    Color,
    Raycaster,
    sRGBEncoding,
    PCFSoftShadowMap,
    Clock
} from 'three';
import {
    Terrain
} from './helpers/terrain';
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { MD2CharacterComplex } from 'three/addons/misc/MD2CharacterComplex.js';
import { Gyroscope } from 'three/addons/misc/Gyroscope.js';
import { AmmoPhysics } from './physics/AmmoPhysics.js';

let physics, position;
let enableDrop = false; 

const scene = new Scene();

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshBasicMaterial({
    color: 'orange'
});
const cubeMesh = new Mesh(geometry, material);
cubeMesh.position.set(0, 20, 0);
scene.add(cubeMesh);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const camera = new PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.set( 0, 10, -10 );
camera.lookAt(0,0,0);
scene.add(camera);

const gameCanvas = document.getElementById('game-canvas');
const renderer = new WebGLRenderer({
    canvas: gameCanvas,
    antialias: true
});
renderer.outputEncoding = sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);


// Shift To New Class
let controls;
let raycaster;

const objects = [];

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new Vector3();
const direction = new Vector3();
const vertex = new Vector3();
const color = new Color();


//
const clock = new Clock();

// Models

const modelControls = {

    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false

};

init();

async function init() {
    physics = await AmmoPhysics();

    window.addEventListener('resize', windowResize);

    const terrain = new Terrain(scene);
    //physics.addMesh(terrain.ground);

    physics.addMesh(cubeMesh, 1)

    controls = new OrbitControls(camera, renderer.domElement);

    raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 10);

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}


function animate() {
    cubeMesh.rotation.x += 0.01;

    // if(enableDrop){
    //     cubeMesh.position.y += 0.01;
    // }

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function windowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            modelControls.moveForward = true;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            modelControls.moveLeft = true;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            modelControls.moveBackward = true;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            modelControls.moveRight = true;
            break;

        case 'KeyP':
            enableDrop = true;
            break;

        case 'Space':
            if (canJump === true) velocity.y += 350;
            canJump = false;
            break;
    }
}

function onKeyUp(event){
    switch ( event.code ) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            modelControls.moveForward = false;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            modelControls.moveLeft = false;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            modelControls.moveBackward = false;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            modelControls.moveRight = false;
            break;
    }
}

animate();