import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  DirectionalLight,
  DoubleSide,
  FrontSide,
  GridHelper,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  WebGLRenderer
} from "three";
import {
  OrbitControls
} from "three/examples/jsm/controls/OrbitControls.js";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";

let camera, scene, renderer;
let controller;
let box;

init();
animate();

function init(){
  const container = document.createElement( 'div' );
	document.body.appendChild( container );

  scene = new Scene();
  camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );

  const light = new HemisphereLight( 0xffffff, 0xbbbbff, 1 );
	light.position.set( 0.5, 1, 0.25 );
	scene.add( light );

  renderer = new WebGLRenderer( { antialias: true, alpha: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.xr.enabled = true;
	container.appendChild( renderer.domElement );

  document.body.appendChild(ARButton.createButton( renderer,
    {requiredFeatures: ["hit-test"]},
  ));

  // Add Assets
  const boxGeometry = new BoxGeometry(1, 1, 1);
  const boxMaterial = new MeshBasicMaterial({ color: 0xff0000 });
  box = new Mesh(boxGeometry, boxMaterial);
  box.position.z = -3;
  scene.add(box);
  // End of Assets

  // Pass the renderer to the createScene-funtion.
  //createScene(renderer);
  // Display a welcome message to the user.
  //displayIntroductionMessage();

  window.addEventListener( 'resize', onWindowResize );
}

async function start() {
  // Check if browser supports WebXR with "immersive-ar".
  const immersiveArSupported = await browserHasImmersiveArCompatibility();
  
  // Initialize app if supported.
  immersiveArSupported ?
    initializeXRApp() : 
    displayUnsupportedBrowserMessage();
};

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  renderer.setAnimationLoop( render );
}
function render() {
  box.rotation.y += 0.01;
  box.rotation.x += 0.01;
  
  renderer.render( scene, camera );
}
