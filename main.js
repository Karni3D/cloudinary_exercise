import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMapSoft = true;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('black');

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000);

const bbox = new THREE.Box3;
const center = new THREE.Vector3;

const url = '/highpoly-chevy-bel-air-1957.glb';

const gltfLoader = new GLTFLoader();
gltfLoader.load(url, (gltf) => {
    bbox.setFromObject(gltf.scene);
    center.x = 0.5 * (bbox.min.x + bbox.max.x);
    center.y = 0.5 * (bbox.min.y + bbox.max.y);
    center.z = 0.5 * (bbox.min.z + bbox.max.z);

    gltf.scene.traverse(function(node) {
        if (node.isMesh) {
            node.castShadow = true;
        }
    });

    scene.add(gltf.scene);
    scene.add(GenFloor(scene));
    scene.add(GenAmbientLight());
    const sun_light = GenSunLight();
    scene.add(sun_light);
    scene.add(sun_light.target);

    UpdateCamera(gltf.scene, camera);

	renderer.render(scene, camera);
})

function UpdateCamera(scene, camera) {
    const diag = Math.pow(
        Math.pow(bbox.max.x - bbox.min.x, 2) + 
        Math.pow(bbox.max.y - bbox.min.y, 2) + 
        Math.pow(bbox.max.z - bbox.min.z, 2), 0.5);
    const dist = 1.25 * 0.5 * diag / 
        Math.tan(0.5 * camera.fov * Math.PI / 180);
    camera.position.set(center.x, center.y + 0.5 * dist, center.z + dist);
    camera.lookAt(center.x, center.y, center.z);
}

function GenFloor(scene) {
    // Assume the floor is on the XZ plane 
    // The floor is 10% bigger than the BB
    const geo = new THREE.BoxGeometry(
        1.1 * (bbox.max.x - bbox.min.x),
        0.1 * (bbox.max.y - bbox.min.y),
        1.1 * (bbox.max.z - bbox.min.z));
    const mat = new THREE.MeshPhongMaterial( {color: 0xafafaf} );
    const floor = new THREE.Mesh(geo, mat);
    floor.position.set(
        center.x,
        bbox.min.y - 0.25 * geo.parameters.height,
        center.z)
    floor.castShadow = false;
    floor.receiveShadow = true;

    return floor;
}

function GenAmbientLight() {
    const ambient_light = new THREE.AmbientLight(0xaFaFaF, 1);

    return ambient_light;
}

function GenSunLight() {
    const sun_light = new THREE.DirectionalLight(0xFFFFFF, 1);

    sun_light.position.set(-2, 5, -1);
    sun_light.target.position.set(center.x, center.y, center.z);
    sun_light.castShadow = true;
    sun_light.shadowCameraVisible = false;
    sun_light.shadowDarkness = 1;
    sun_light.shadow.camera.left = -10;
    sun_light.shadow.camera.right = 10;
    sun_light.shadow.camera.top = 10;
    sun_light.shadow.camera.bottom = -10;
    sun_light.shadow.camera.near = 1;
    sun_light.shadow.camera.far = 100;
    sun_light.shadow.mapSize.width = 4096; // default is 512
    sun_light.shadow.mapSize.height = 4086; // default is 512
    
    return sun_light;
}
