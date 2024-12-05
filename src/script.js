import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { gsap } from "gsap";
import firefliesVertexShader from "./shaders/fireflies/vertex.glsl";
import firefliesFragmentShader from "./shaders/fireflies/fragment.glsl";
import portalVertexShader from "./shaders/portal/vertex.glsl";
import portalFragmentShader from "./shaders/portal/fragment.glsl";
import overlayVertexShader from "./shaders/overlay/vertex.glsl";
import overlayFragmentShader from "./shaders/overlay/fragment.glsl";

/**
 * Base
 */
// Debug
const debugObject = {};
const gui = new GUI({
	width: 200,
});
gui.hide();

// Add global settings folder
const globalFolder = gui.addFolder("Global Settings");

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Loading manager
const loadingElement = document.querySelector(".loading");
const loadingTextElement = document.querySelector(".loading-text");

let simulatedProgress = 0;
const simulateLoading = (callback) => {
	loadingTextElement.style.fontSize = "max(32px, 10vw)";
	if (simulatedProgress < 100) {
		simulatedProgress += 1;
		loadingTextElement.textContent = Math.floor(simulatedProgress);
		requestAnimationFrame(() => simulateLoading(callback));
	} else if (callback) {
		callback();
	}
};

const loadingManager = new THREE.LoadingManager(() => {
	simulateLoading(() => {
		gsap.delayedCall(1, () => {
			loadingElement.classList.add("ended");
			gsap.to(overlayMaterial.uniforms.uAlpha, {
				value: 0,
				duration: 2,
				delay: 1,
				onComplete: () => {
					overlay.visible = false;
					gui.show();
				},
			});
		});
	});
});

// Texture loader
const textureLoader = new THREE.TextureLoader(loadingManager);

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Textures
 */
const bakedTexture = textureLoader.load("baked.jpg");
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Materials
 */
// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });

// Pole light material
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 });

// Portal light material
debugObject.portalLightColorStart = new THREE.Color(0x000000);
debugObject.portalLightColorEnd = new THREE.Color(0xffffff);
debugObject.portalAnimationSpeed = 0.2;
debugObject.portalNoiseScale = 5.0;
debugObject.portalOuterGlowStrength = 1.5;

const portalFolder = gui.addFolder("Portal Settings");

portalFolder
	.addColor(debugObject, "portalLightColorStart")
	.onChange(() => {
		portalLightMaterial.uniforms.uColorStart.value =
			debugObject.portalLightColorStart;
	})
	.name("Light Color Start");

portalFolder
	.addColor(debugObject, "portalLightColorEnd")
	.onChange(() => {
		portalLightMaterial.uniforms.uColorEnd.value =
			debugObject.portalLightColorEnd;
	})
	.name("Light Color End");

portalFolder
	.add(debugObject, "portalAnimationSpeed", 0.1, 1, 0.1)
	.onChange(() => {
		portalLightMaterial.uniforms.uAnimationSpeed.value =
			debugObject.portalAnimationSpeed;
	})
	.name("Animation Speed");

portalFolder
	.add(debugObject, "portalNoiseScale", 1, 10, 0.5)
	.onChange(() => {
		portalLightMaterial.uniforms.uNoiseScale.value =
			debugObject.portalNoiseScale;
	})
	.name("Noise Scale");

portalFolder
	.add(debugObject, "portalOuterGlowStrength", 0, 3, 0.1)
	.onChange(() => {
		portalLightMaterial.uniforms.uOuterGlowStrength.value =
			debugObject.portalOuterGlowStrength;
	})
	.name("Outer Glow");

const portalLightMaterial = new THREE.ShaderMaterial({
	uniforms: {
		uTime: { value: 0 },
		uColorStart: { value: debugObject.portalLightColorStart },
		uColorEnd: { value: debugObject.portalLightColorEnd },
		uAnimationSpeed: { value: debugObject.portalAnimationSpeed },
		uNoiseScale: { value: debugObject.portalNoiseScale },
		uOuterGlowStrength: { value: debugObject.portalOuterGlowStrength },
	},
	vertexShader: portalVertexShader,
	fragmentShader: portalFragmentShader,
	side: THREE.DoubleSide,
});

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
	transparent: true,
	uniforms: {
		uAlpha: { value: 1 },
		uColor: { value: new THREE.Color(0x202020) },
	},
	vertexShader: overlayVertexShader,
	fragmentShader: overlayFragmentShader,
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

/**
 * Model
 */
gltfLoader.load("portal.glb", (gltf) => {
	const bakedMesh = gltf.scene.children.find((child) => child.name === "baked");
	bakedMesh.material = bakedMaterial;

	const portalLightMesh = gltf.scene.getObjectByName("portalLight");
	portalLightMesh.material = portalLightMaterial;

	const poleLightAMesh = gltf.scene.getObjectByName("poleLightA");
	poleLightAMesh.material = poleLightMaterial;

	const poleLightBMesh = gltf.scene.getObjectByName("poleLightB");
	poleLightBMesh.material = poleLightMaterial;

	scene.add(gltf.scene);
});

/**
 * Fireflies
 */
// Geometry
const firefliesGeometry = new THREE.BufferGeometry();
const firefliesCount = 30;
const fireflyPositionArray = new Float32Array(firefliesCount * 3);
const fireflyScaleArray = new Float32Array(firefliesCount);

for (let i = 0; i < firefliesCount; i++) {
	fireflyPositionArray[i * 3] = (Math.random() - 0.5) * 4;
	fireflyPositionArray[i * 3 + 1] = Math.random() * 1.5;
	fireflyPositionArray[i * 3 + 2] = (Math.random() - 0.5) * 4;

	fireflyScaleArray[i] = Math.random();
}

firefliesGeometry.setAttribute(
	"position",
	new THREE.BufferAttribute(fireflyPositionArray, 3),
);
firefliesGeometry.setAttribute(
	"aScale",
	new THREE.BufferAttribute(fireflyScaleArray, 1),
);

// Material
const firefliesMaterial = new THREE.ShaderMaterial({
	uniforms: {
		uTime: { value: 0 },
		uSize: { value: 150 },
		uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
	},
	vertexShader: firefliesVertexShader,
	fragmentShader: firefliesFragmentShader,
	transparent: true,
	blending: THREE.AdditiveBlending,
	depthWrite: false,
});

// Move fireflies size control to global folder
globalFolder
	.add(firefliesMaterial.uniforms.uSize, "value", 0, 300, 1)
	.name("Fireflies Size");

// Points
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
scene.add(fireflies);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

	// Update fireflies material
	firefliesMaterial.uniforms.uPixelRatio.value = Math.min(
		window.devicePixelRatio,
		2,
	);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	45,
	sizes.width / sizes.height,
	0.1,
	100,
);
camera.position.x = 7;
camera.position.y = 4;
camera.position.z = 7;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.minPolarAngle = 0;
controls.minDistance = 1;
controls.maxDistance = 15;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Move background color control to global folder
debugObject.clearColor = "#202020";
renderer.setClearColor(debugObject.clearColor);
globalFolder
	.addColor(debugObject, "clearColor")
	.onChange(() => {
		renderer.setClearColor(debugObject.clearColor);
	})
	.name("Background");

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Update materials
	firefliesMaterial.uniforms.uTime.value = elapsedTime;
	portalLightMaterial.uniforms.uTime.value = elapsedTime;

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
