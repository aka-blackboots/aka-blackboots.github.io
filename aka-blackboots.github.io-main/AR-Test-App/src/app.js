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

  document.body.appendChild( ARButton.createButton( renderer ) );

  const boxGeometry = new BoxGeometry(1, 1, 1);
  const boxMaterial = new MeshBasicMaterial({ color: 0xff0000 });
  const box = new Mesh(boxGeometry, boxMaterial);
  box.position.z = -3;
  scene.add(box);


  window.addEventListener( 'resize', onWindowResize );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  renderer.setAnimationLoop( render );
}
function render() {
  renderer.render( scene, camera );
}
