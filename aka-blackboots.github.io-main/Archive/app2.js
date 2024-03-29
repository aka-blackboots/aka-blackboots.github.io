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
    Box3,
    Group,
    MeshStandardMaterial
} from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
    Terrain
} from './helpers/terrain';
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { MD2CharacterComplex } from 'three/addons/misc/MD2CharacterComplex.js';
import { Gyroscope } from 'three/addons/misc/Gyroscope.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const params = {

	firstPerson: false,
	displayCollider: false,
	displayBVH: false,
	visualizeDepth: 10,
	gravity: - 30,
	playerSpeed: 10,
	physicsSteps: 5,
	//reset: reset,

};

const scene = new Scene();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 2000);
camera.position.set( 10, 10, -10 );
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

let environment, collider, visualizer;

let prevTime = performance.now();
const velocity = new Vector3();
const direction = new Vector3();
const vertex = new Vector3();
const color = new Color();


//
const clock = new Clock();

// Models
const characters = [];
let nCharacters = 0;

const modelControls = {

    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false

};

init();

function init() {
    window.addEventListener('resize', windowResize);

    const terrain = new Terrain(scene);

    loadColliderEnivronment();                                                            

    controls = new OrbitControls(camera, renderer.domElement);
    //controls = new PointerLockControls(camera, document.body);

    raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 10);

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    //scene.add(controls.getObject());



    addModel();
}

function loadColliderEnivronment(){
    new GLTFLoader().load('./resources/dungeon_low_poly_game_level_challenge/scene.gltf', res => {
        const gltfScene = res.scene;
		gltfScene.scale.setScalar( .01 );

		const box = new Box3();
		box.setFromObject( gltfScene );
		box.getCenter( gltfScene.position ).negate();
		gltfScene.updateMatrixWorld( true );

        		// visual geometry setup
		const toMerge = {};
		gltfScene.traverse( c => {

			if (
				/Boss/.test( c.name ) ||
				/Enemie/.test( c.name ) ||
				/Shield/.test( c.name ) ||
				/Sword/.test( c.name ) ||
				/Character/.test( c.name ) ||
				/Gate/.test( c.name ) ||

				// spears
				/Cube/.test( c.name ) ||

				// pink brick
				c.material && c.material.color.r === 1.0
			) {

				return;

			}

			if ( c.isMesh ) {

				const hex = c.material.color.getHex();
				toMerge[ hex ] = toMerge[ hex ] || [];
				toMerge[ hex ].push( c );

			}

		});



        environment = new Group();
		for ( const hex in toMerge ) {

			const arr = toMerge[ hex ];
			const visualGeometries = [];
			arr.forEach( mesh => {

				if ( mesh.material.emissive.r !== 0 ) {

					environment.attach( mesh );

				} else {

					const geom = mesh.geometry.clone();
					geom.applyMatrix4( mesh.matrixWorld );
					visualGeometries.push( geom );

				}

			} );

			if ( visualGeometries.length ) {

				const newGeom = BufferGeometryUtils.mergeBufferGeometries( visualGeometries );
				const newMesh = new Mesh( newGeom, new MeshStandardMaterial( { color: parseInt( hex ), shadowSide: 2 } ) );
				newMesh.castShadow = true;
				newMesh.receiveShadow = true;
				newMesh.material.shadowSide = 2;

				environment.add( newMesh );

			}

		}


        // collect all geometries to merge
		const geometries = [];
		environment.updateMatrixWorld( true );
		environment.traverse( c => {

			if ( c.geometry ) {

				const cloned = c.geometry.clone();
				cloned.applyMatrix4( c.matrixWorld );
				for ( const key in cloned.attributes ) {

					if ( key !== 'position' ) {

						cloned.deleteAttribute( key );

					}

				}

				geometries.push( cloned );

			}

		} );




        scene.add( environment );
    });
}

function addModel(){
    const configOgro = {
        baseUrl: 'resources/md2/ogro/',

        body: 'ogro.md2',
        skins: [ 'sharokh.png' ],
        weapons: [[ 'weapon.md2', 'weapon.jpg' ]],
        animations: {
            move: 'run',
            idle: 'stand',
            jump: 'jump',
            attack: 'attack',
            crouchMove: 'cwalk',
            crouchIdle: 'cstand',
            crouchAttach: 'crattack'
        },

        walkSpeed: 550,
        crouchSpeed: 175
    }


    const nRows = 1;
    const nSkins = configOgro.skins.length;

    nCharacters = nSkins * nRows;

    for ( let i = 0; i < nCharacters; i ++ ) {
        const character = new MD2CharacterComplex();
        character.scale = 1;
        character.controls = modelControls;
        characters.push( character );
    }

    const baseCharacter = new MD2CharacterComplex();
    baseCharacter.scale = 1;

    baseCharacter.onLoadComplete = function () {

        let k = 0;

        for ( let j = 0; j < nRows; j ++ ) {

            for ( let i = 0; i < nSkins; i ++ ) {

                const cloneCharacter = characters[ k ];

                cloneCharacter.shareParts( baseCharacter );

                // cast and receive shadows
                cloneCharacter.enableShadows( true );

                cloneCharacter.setWeapon( 0 );
                cloneCharacter.setSkin( i );

                cloneCharacter.root.position.x = ( i - nSkins / 2 ) * 150;
                cloneCharacter.root.position.z = j * 250;

                scene.add( cloneCharacter.root );

                k ++;

            }

        }

        const gyro = new Gyroscope();
        gyro.add( camera );
        characters[ Math.floor( nSkins / 2 ) ].root.add( gyro );

    };

    baseCharacter.loadParts( configOgro );
}

function animate() {

    requestAnimationFrame(animate);

    // const time = performance.now();

    // raycaster.ray.origin.copy( controls.getObject().position );
    // raycaster.ray.origin.y -= 10;
    // const intersections = raycaster.intersectObjects( objects, false );
    // const onObject = intersections.length > 0;

    // const delta = ( time - prevTime ) / 1000;
    // velocity.x -= velocity.x * 10.0 * delta;
    // velocity.z -= velocity.z * 10.0 * delta;
    // velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    // direction.z = Number( moveForward ) - Number( moveBackward );
	// direction.x = Number( moveRight ) - Number( moveLeft );
	// direction.normalize(); // this ensures consistent movements in all directions

    // if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
    // if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

    // if ( onObject === true ) {
    //     velocity.y = Math.max( 0, velocity.y );
    //     canJump = true;
    // }

    // controls.moveRight( - velocity.x * delta );
    // controls.moveForward( - velocity.z * delta );

    // controls.getObject().position.y += ( velocity.y * delta ); // new behavior

    // if ( controls.getObject().position.y < 10 ) {
    //     velocity.y = 0;
    //     controls.getObject().position.y = 10;
    //     canJump = true;
    // }

    // prevTime = time;


    const cDelta = clock.getDelta();
    for ( let i = 0; i < nCharacters; i ++ ) {

        characters[ i ].update( cDelta );

    }


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
            controls.lock();
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