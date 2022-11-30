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
    Clock,
    PlaneGeometry,
    MeshPhongMaterial,
    Box3,
    Group,
    MeshStandardMaterial,
    AmbientLight,
    DirectionalLight,
    CameraHelper,
    DoubleSide,
    SpotLight
} from 'three';
import {
    Terrain
} from './helpers/terrain';
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls';
import {
    PointerLockControls
} from 'three/examples/jsm/controls/PointerLockControls';
import {
    MD2CharacterComplex
} from 'three/addons/misc/MD2CharacterComplex.js';
import {
    Gyroscope
} from 'three/addons/misc/Gyroscope.js';
import {
    Body,
    Box,
    ConvexPolyhedron,
    Plane,
    Vec3,
    World
} from 'cannon-es'
import {
    GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
//import { io } from "socket.io-client";

let world = new World();
let position;
let enableDrop = false;

const scene = new Scene();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 1, 1000);
//camera.position.set(0, 2, 10);
//camera.lookAt(0, 10, -5);
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


// Models

const modelControls = {

    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false

};

function basicLights() {
    scene.add(new AmbientLight(0x222222));

    const dLight = new DirectionalLight(0xffffff, 1);
    dLight.position.set(100, 100, 10);
    dLight.lookAt(0, 0, 0);
    dLight.castShadow = true;

    scene.add(dLight);

    var side = 100;
    dLight.shadow.camera.top = side;
    dLight.shadow.camera.bottom = -side;
    dLight.shadow.camera.left = side;
    dLight.shadow.camera.right = -side;

    const helper = new CameraHelper(dLight.shadow.camera);
    //scene.add(helper);
}

let cubeBody, cubeMesh;

function addCube() {
    const geometry = new BoxGeometry(1, 5, 1);
    const material = new MeshStandardMaterial({
        color: 'orange'
    });
    cubeMesh = new Mesh(geometry, material);
    cubeMesh.position.set(0, 5, 0);
    cubeMesh.castShadow = true;
    scene.add(cubeMesh);

    const cubeShape = new Box(new Vec3(0.5, 2.5, 0.5));
    cubeBody = new Body({
        mass: 1
    });
    cubeBody.addShape(cubeShape);
    cubeBody.position.x = cubeMesh.position.x;
    cubeBody.position.y = cubeMesh.position.y;
    cubeBody.position.z = cubeMesh.position.z;
    world.addBody(cubeBody);
}

function addGround() {
    const planeGeometry = new PlaneGeometry(250, 250);
    const planeMesh = new Mesh(planeGeometry, new MeshStandardMaterial({
        color: 0x1E8449,
        side: DoubleSide
    }));
    planeMesh.rotateX(-Math.PI / 2);
    planeMesh.receiveShadow = true;
    scene.add(planeMesh);

    const planeShape = new Plane();
    const planeBody = new Body({
        mass: 0
    });
    planeBody.addShape(planeShape);
    planeBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(planeBody);
}


init();

async function init() {
    world.gravity.set(0, -9.82, 0);

    // Events
    window.addEventListener('resize', windowResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Controls
    controls = new PointerLockControls(camera, renderer.domElement);
    controls.getObject().position.set(0, 0, 14);
    //controls.maxPolarAngle = 120;
    //controls.getObject()

    //controls = new OrbitControls(camera, renderer.domElement);
    scene.add(controls.getObject());
    controls.lock();

    // Camera
    raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 10);
    // Lights
    basicLights();

    // Add Models
    addCube();

    // Add Ground
    addGround();

    for (let i = 0; i < 50; i++) {
        let x = getRandomArbitrary(-80, 80);
        let z = getRandomArbitrary(-80, 80);

        let r = parseInt(Math.random() * 10);
        let rotateBool = false;
        console.log("Rotate:" + r);
        if (r % 2 == 0) {
            //rotateBool = true;
        }
  
        createWall(x, z, rotateBool);
    }
    //const terrain = new Terrain(scene);
    //addDungeon();

    controls.unlock();
}

function getRandomArbitrary(min, max) {
    return parseInt(Math.random() * (max - min) + min);
}

function createWall(wX, wZ, rotate) {
    const geometry = new BoxGeometry(4, 40, 4);
    const material = new MeshStandardMaterial({
        color: 0x1B4F72,
        side: DoubleSide
    });
    const wallMesh = new Mesh(geometry, material);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    wallMesh.position.set(wX, 0, wZ);
    if (rotate) {
        console.log("Rotate")
        wallMesh.rotateY(1.5708);
    }
    scene.add(wallMesh);

    const wallShape = new Box(new Vec3(2, 20, 2));
    const wallBody = new Body({
        mass: 0
    });
    wallBody.addShape(wallShape);
    wallBody.position.x = wallMesh.position.x;
    wallBody.position.y = wallMesh.position.y;
    wallBody.position.z = wallMesh.position.z;
    world.addBody(wallBody);
}

function createMaze() {

}


const clock = new Clock()
let delta;

function animate() {
    delta = Math.min(clock.getDelta(), 0.1)
    world.step(delta);

    cubeMesh.position.set(
        cubeBody.position.x,
        cubeBody.position.y,
        cubeBody.position.z
    )
    //console.log(cubeMesh)

    //checkAnimation();
    checkAnimation2();


    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function checkAnimation2() {
    const time = performance.now();

    if (controls.isLocked === true) {
        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= 10;

        const intersections = raycaster.intersectObjects(objects, false);

        const onObject = intersections.length > 0;

        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // this ensures consistent movements in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        if (onObject === true) {

            velocity.y = Math.max(0, velocity.y);
            canJump = true;

        }

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        console.log(-velocity.x * delta);
        cubeBody.position.z = cubeBody.position.z - (-velocity.z * delta);
        cubeBody.position.x = cubeBody.position.x + (-velocity.x * delta);

        controls.getObject().position.y += (velocity.y * delta); // new behavior

        if (controls.getObject().position.y < 10) {

            velocity.y = 0;
            controls.getObject().position.y = 10;

            canJump = true;

        }
    }

    prevTime = time;
}

function checkAnimation() {
    if (moveForward) {
        cubeBody.position.z += 0.02;
    }
    if (moveBackward) {
        cubeBody.position.z -= 0.02;
    }
    if (moveLeft) {
        cubeBody.position.x += 0.02;
    }
    if (moveRight) {
        cubeBody.position.x -= 0.02;
    }
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
            //enableDrop = true;
            controls.lock();
            break;

        case 'Space':
            if (canJump === true) velocity.y += 350;
            canJump = false;
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
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

// Socket IO
function connectToSocket() {
    const initials = document.getElementById("initials-name").value;
    console.log(initials)

    if (initials) {
        const connectButton = document.getElementById("socket-Connect-Button");
        connectButton.innerHTML = "Connected!";
        connectButton.disabled = true;

        let socket;
        //window.onload= function(){
            socket = io();
        //}
        //socket = io();
        console.log(socket)
        console.log(initials + ":Connecting to socket");
        socket.emit('username', initials);

    }
}
window.connectToSocket = connectToSocket;
