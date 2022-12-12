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
  CSS2DRenderer,
  CSS2DObject
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import {
  handleXRHitTest
} from "./utils/hitTest.js";
import EvercoastPlayerApi from 'evercoast-player-api';
import {
  EvercoastPlayerApiConfig
} from 'evercoast-player-api'
import EvercoastThreeJSRenderSystem from 'evercoast-renderers/lib/evercoast-threejs-rendersystem'
import {
  createPlaneMarker
} from "./utils/planeMarker.js";
import {
  checkXRCapacity
} from "./utils/checkXRCapacity.js";

const playBtn = document.getElementById("playBtn");

let camera, scene, renderer;
let planeMarker, humanEverCoastModel;
let playerApi;

init();
animate();

function init() {
  checkXRCapacity();

  const container = document.createElement('div');
  document.body.appendChild(container);

  scene = new Scene();
  camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
  camera.position.x = 0;
  camera.position.y = 1.7;
  camera.position.z = -2;
  camera.lookAt(0, 0.9, 0)

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

  // Creating Base Scene
  initBaseScene();

  // Event Listeners
  window.addEventListener('resize', onWindowResize);
}

function initBaseScene() {
  const light = new HemisphereLight(0xffffff, 0xbbbbff, 1);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);

  const directionalLight = new DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 10, 0);
  directionalLight.target.position.set(-5, 0, 0);
  scene.add(directionalLight);
  scene.add(directionalLight.target);

  planeMarker = createPlaneMarker();
  scene.add(planeMarker);
  planeMarker.visible = false;

  // Controller 
  const controller = renderer.xr.getController(0);
  scene.add(controller);
  controller.addEventListener("select", changeModelLoc);

  //addModel();
  playerApi = createPlayerApi(scene);
}

function createPlayerApi(scene) {
  console.log(scene);

  const playerApiConfig = new EvercoastPlayerApiConfig();
  console.log(playerApiConfig)
  const root = "https://joyful-basbousa-d571da.netlify.app/aka-blackboots.github.io-main/ar-test-app//src/evercoast-helpers/"

  playerApiConfig.root = root;
  const renderSystem = new EvercoastThreeJSRenderSystem(renderer);
  renderSystem.onAssetCreated = (asset) => {
    console.log('evercoast mesh asset created');
    scene.add(asset);
    humanEverCoastModel = asset;
    //humanEverCoastModel.visible = false;
    humanEverCoastModel.rotation.y = (Math.PI);
  }
  playerApiConfig.renderSystem = renderSystem;

  playerApiConfig.maxFramerate = 15;

  const playerApi = new EvercoastPlayerApi(
    renderer.getContext(),
    playerApiConfig
  );

  playBtn.disabled = true;

  playerApi.open('https://streaming.evercoast.com/Verizon/NEWTEST.BEN.ec.take.005/3167/NEWTEST.BEN.ec.take.005.ecm');

  playerApi.enableLooping(true);
  playerApi.play();

  // playBtn.addEventListener('click', () => {
  //   if (playBtn.innerText == 'Play') {
  //     playerApi.play();
  //   } else {
  //     playerApi.pause();
  //   }
  // })

  playerApi.onPaused.add(() => {
    playBtn.innerText = 'Play';
  })

  playerApi.onResumed.add(() => {
    playBtn.innerText = 'Pause';
  })
  return playerApi;
}

function changeModelLoc() {
  if (planeMarker.visible) {
    humanEverCoastModel.position.setFromMatrixPosition(planeMarker.matrix);
    humanEverCoastModel.rotation.y = (Math.PI/2);
    humanEverCoastModel.visible = true;
  }
}

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
    
    playerApi.play();
  }

  renderer.render(scene, camera);

  updatePlayer();
}

function updatePlayer() {
  playerApi.beginRenderFrame();
  playerApi.update();
  if (playerApi.render()) {
    if (playBtn.disabled) {
      playBtn.disabled = false;
    }
  }
  playerApi.endRenderFrame();
}

// function addModel() {
//   const gltfLoader = new GLTFLoader();

//   const dracoLoader = new DRACOLoader();
//   dracoLoader.setDecoderPath('/examples/js/libs/draco/');
//   gltfLoader.setDRACOLoader(dracoLoader);

//   gltfLoader.load("https://joyful-basbousa-d571da.netlify.app/aka-blackboots.github.io-main/ar-test-app/models/koala2.glb", (gltf) => {
//     humanEverCoastModel = gltf.scene.children[0];
//     scene.add(humanEverCoastModel);
//   });
// }