import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  DirectionalLight,
  DoubleSide,
  FrontSide,
  GridHelper,
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
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

const scene = new Scene();
const scene2 = new Scene();
let camera, renderer, controls, cssRenderer;

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

function init() {
  //Creates the camera (point of view of the user)
  const aspect = size.width / size.height;
  camera = new PerspectiveCamera(75, aspect);
  camera.position.z = 650;
  camera.position.y = 1;
  camera.position.x = 0;

  const ambientLight = new AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 10, 0);
  directionalLight.target.position.set(-5, 0, 0);
  scene.add(directionalLight);
  scene.add(directionalLight.target);

  renderer = new WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xc9c9c9)
  document.body.appendChild( renderer.domElement );
  
  // CSS Renderer
  cssRenderer = new CSS3DRenderer();
  cssRenderer.setSize(size.width, size.height);
  cssRenderer.domElement.style.position = 'absolute';
  cssRenderer.domElement.style.top = 0;
  document.body.appendChild( cssRenderer.domElement );

  const cssDiv = cssRenderer.domElement.childNodes[0]
  cssDiv.className = 'scene';
  cssRenderer.domElement.className = 'renderer'

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxDistance = 900;
  controls.minDistance = 500;
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI / 2;
  controls.minPolarAngle = Math.PI / 3;
  controls.target.set(0, 0, 0);
 
  createViewer(800, 500);
}

function createViewer(width, height){
  // Viewer Mesh
  const viewerDiv = document.createElement( 'div' );
  viewerDiv.id = "player";
  viewerDiv.style.width = width+"px";
  viewerDiv.style.height = height+"px";
  viewerDiv.style.backgroundColor = "black";

  const objectDiv = new CSS3DObject(viewerDiv);
  scene2.add(objectDiv);

  const viewerGeom = new PlaneGeometry(width, height);
  const viewerMat = new MeshBasicMaterial({ color: 0x000000 })
  const viewerMesh = new Mesh(viewerGeom, viewerMat);
  viewerMesh.position.copy( objectDiv.position );
	viewerMesh.rotation.copy( objectDiv.rotation );
  scene.add(viewerMesh);

  createTVBox(width, height)
}

function createTVBox(width, height){
  const boxGeom = new BoxGeometry(width+40, height+40, 10);
  const boxMat = new MeshStandardMaterial({ color: 0x325ea8});
  const boxMesh = new Mesh(boxGeom, boxMat);
  scene.add(boxMesh);
  boxMesh.position.setZ(-5);
}

//Animation loop
const animate = () => {
  controls.update();
  renderer.render(scene, camera);
  cssRenderer.render(scene2, camera);
  requestAnimationFrame(animate);
};

init();
animate();

//Adjust the viewport to the size of the browser
window.addEventListener("resize", () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);
  cssRenderer.setSize(size.width, size.height);
});