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
  RingGeometry,
  Scene,
  WebGLRenderer
} from "three";
import {
  OrbitControls
} from "three/examples/jsm/controls/OrbitControls.js";
import {
  ARButton
} from "three/examples/jsm/webxr/ARButton.js";
import {
  handleXRHitTest
} from "./utils/hitTest.js";
import {
  GLTFLoader
} from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  DRACOLoader
} from "three/examples/jsm/loaders/DRACOLoader.js";

let camera, scene, renderer;
let controller;
let box, planeMarker, humanEverCoastModel;

init();
animate();

function init() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  scene = new Scene();
  camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

  renderer = new WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);

  document.body.appendChild(ARButton.createButton(renderer, {
    requiredFeatures: ["hit-test"]
  }, ));

  // Add Assets
  const boxGeometry = new BoxGeometry(1, 1, 1);
  const boxMaterial = new MeshBasicMaterial({
    color: 0xff0000
  });
  box = new Mesh(boxGeometry, boxMaterial);
  box.position.z = -3;
  scene.add(box);
  // End of Assets

  initBaseScene();

  // Pass the renderer to the createScene-funtion.
  //createScene(renderer);
  // Display a welcome message to the user.
  //displayIntroductionMessage();

  window.addEventListener('resize', onWindowResize);
}

function initBaseScene() {
  const light = new HemisphereLight(0xffffff, 0xbbbbff, 1);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);


  planeMarker = createPlaneMarker();
  scene.add(planeMarker);

  addModel();

  // Controller 
  const controller = renderer.xr.getController(0);
  scene.add(controller);

  controller.addEventListener("select", showModel);
}

function addModel() {
  const gltfLoader = new GLTFLoader();

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/examples/js/libs/draco/');
  gltfLoader.setDRACOLoader(dracoLoader);

  gltfLoader.load("./../models/koala.glb", (gltf) => {
    humanEverCoastModel = gltf.scene.children[0];
  });
}

function showModel() {
  if (planeMarker.visible) {
    const model = humanEverCoastModel.clone();

    model.position.setFromMatrixPosition(planeMarker.matrix);

    // Rotate the model randomly to give a bit of variation to the scene.
    model.rotation.y = Math.random() * (Math.PI * 2);
    model.visible = true;

    scene.add(model);
  }
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
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
  if (frame) {
    handleXRHitTest(renderer, frame, (hitPoseTransformed) => {
      if (hitPoseTransformed) {
        planeMarker.visible = true;
        planeMarker.matrix.fromArray(hitPoseTransformed);
      }
    }, () => {
      planeMarker.visible = false;
    })

    box.rotation.x += 0.04;
  }
  renderer.render(scene, camera);
}




/* Shift To Different File, Vish - Make it little nice with interactive UI */
function createPlaneMarker() {
  const planeMarkerMaterial = new MeshBasicMaterial({
    color: 0xffffff
  });

  const planeMarkerGeometry = new RingGeometry(0.14, 0.15, 16).rotateX(
    -Math.PI / 2,
  );
  const planeMarker = new Mesh(planeMarkerGeometry, planeMarkerMaterial);
  planeMarker.matrixAutoUpdate = false;
  return planeMarker;
};