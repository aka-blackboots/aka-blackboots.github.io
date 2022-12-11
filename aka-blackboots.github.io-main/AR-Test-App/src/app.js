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
import { ARButton } from "./ARButton.js";

// External Packages

const canvas = document.getElementById("renderCanvas");
const playBtn = document.getElementById("playBtn");

const scene = new Scene();
let camera, renderer, controls;
let box;

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

function init() {
  //Creates the camera (point of view of the user)
  const aspect = size.width / size.height;
  camera = new PerspectiveCamera(75, aspect);
  camera.position.x = 0;
  camera.position.y = 1.7;
  camera.position.z = -2;
  camera.lookAt(0, 0.9, 0)

  const ambientLight = new AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 10, 0);
  directionalLight.target.position.set(-5, 0, 0);
  scene.add(directionalLight);
  scene.add(directionalLight.target);

  renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: canvas
  });
  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xc9c9c9);
  renderer.xr.enabled = true;

  document.body.appendChild(ARButton.createButton(
    renderer,
    { requiredFeatures: ["hit-test"] }
  ));
  //displayIntroductionMessage();
  
  initOrbitControls();

  const boxGeometry = new BoxGeometry(1, 1, 1);
  const boxMaterial = new MeshBasicMaterial({ color: 0xff0000 });
  box = new Mesh(boxGeometry, boxMaterial);
  box.position.z = -3;

  scene.add(box);


  animate();
}

function animate(){
  const renderLoop = () => {
    // Rotate box
    box.rotation.y += 0.01;
    box.rotation.x += 0.01;

    //if (renderer.xr.isPresenting) {
      renderer.render(scene, camera);
    //}
  }
  
  renderer.setAnimationLoop(renderLoop);
}

async function start() {
  // Check if browser supports WebXR with "immersive-ar".
  const immersiveArSupported = await browserHasImmersiveArCompatibility();
  
  // Initialize app if supported.
  immersiveArSupported ?
    initializeXRApp() : 
    displayUnsupportedBrowserMessage();
};

function initOrbitControls(){
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.2;
  controls.target.set(0, 1, 0);
}

//Animation loop
// const animate = () => {

//   renderer.render(scene, camera);
//   controls.update;

//   requestAnimationFrame(animate);
// };

init();
//animate();

//Adjust the viewport to the size of the browser
window.addEventListener("resize", () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);
});