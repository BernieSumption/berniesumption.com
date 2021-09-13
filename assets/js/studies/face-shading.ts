import {
  AmbientLight,
  BufferAttribute,
  CircleGeometry,
  Color,
  Float32BufferAttribute,
  HemisphereLight,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PlaneGeometry,
  SpotLight,
  Vector3,
} from "/vendor/three/three.module.js";

import { OrbitControls } from "/vendor/three/OrbitControls.js";

import { initThreeCanvas } from "/libs/init-three-canvas";

import {
  faceCentroid,
  renderShadowTexture,
  shuffle,
  sortBy,
} from "/libs/utils";

import { outExpo } from "/libs/easing";

type Tuple3 = [number, number, number];

// yo!
const shapeComplexity = 4;
const timeBetweenTransitions = 5;
const transitionDuration = 2;
const transitionOffset = 1;
const shadowTransitionDuration = 2;
const shadowTransitionDelay = 1.75;
const peakActiveChance = 0.85;
const activeChancePower = 8;
const colorSequence: Tuple3[] = [
  [255, 128, 0],
  [128, 0, 255],
  [0, 255, 128],
  [255, 0, 128],
  [0, 128, 255],
  [128, 255, 0],
];
const threeColorSequence = colorSequence.map(
  (cs) => new Color(cs[0] / 255, cs[1] / 255, cs[2] / 255)
);
const activeColor: Tuple3 = [255, 255, 255];

class Face {
  public centroid: Vector3;
  private transitionStartTime = 0;
  private currentTime = 0;
  private from = colorSequence[0];
  private to = colorSequence[0];
  public proportionalPosition = 0;

  constructor(
    positions: BufferAttribute,
    private colors: BufferAttribute,
    private faceIndex: number
  ) {
    this.centroid = faceCentroid(positions, faceIndex);
    this.setColor(colorSequence[0]);
  }

  public update(time: number) {
    this.currentTime = time;
    if (this.currentTime < this.transitionStartTime) return;
    const progress = Math.min(
      1,
      (time - this.transitionStartTime) / transitionDuration
    );
    const whiteChance =
      Math.pow(1 - Math.abs(progress * 2 - 1), activeChancePower) *
      peakActiveChance;
    if (Math.random() < whiteChance) {
      this.setColor(activeColor);
    } else if (progress < 0.5) {
      this.setColor(this.from);
    } else {
      this.setColor(this.to);
    }
  }

  public startTransition(from: number, to: number) {
    this.from = colorSequence[from];
    this.to = colorSequence[to];
    this.transitionStartTime =
      this.currentTime + this.proportionalPosition * transitionOffset;
  }

  private setColor(color: Tuple3) {
    const start = this.faceIndex * 3;
    this.colors.setXYZ(start, ...color);
    this.colors.setXYZ(start + 1, ...color);
    this.colors.setXYZ(start + 2, ...color);
    this.colors.needsUpdate = true;
  }
}

class Shadow extends Mesh {
  private transitionStartTime = 0;
  private currentTime = 0;
  private from = threeColorSequence[0];
  private to = threeColorSequence[0];
  public proportionalPosition = 0;

  constructor() {
    super(
      new PlaneGeometry(20, 20),
      new MeshBasicMaterial({
        map: renderShadowTexture(1024, new Color(0x303030)),
        color: threeColorSequence[0],
        transparent: true,
        depthWrite: false,
        opacity: 0.65,
      })
    );
    this.rotation.x = -0.5 * Math.PI;
    this.position.setY(-11.9);
  }

  public startTransition(from: number, to: number) {
    this.from = threeColorSequence[from];
    this.to = threeColorSequence[to];
    this.transitionStartTime = this.currentTime + shadowTransitionDelay;
  }

  public update(time: number) {
    this.currentTime = time;
    if (this.currentTime < this.transitionStartTime) return;
    const progress = Math.min(
      1,
      (time - this.transitionStartTime) / shadowTransitionDuration
    );
    (this.material as MeshBasicMaterial).color = this.from.lerp(
      this.to,
      progress
    );
  }
}

initThreeCanvas(({ scene, camera, renderer }) => {
  renderer.setClearColor(new Color(0x999999));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.rotateSpeed = 0.1;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI * 0.5;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.25;

  camera.position.set(-30, 9, 11);
  camera.lookAt(scene.position);

  const spotLight = new SpotLight(0x222222);
  spotLight.position.set(5, 20, 5);
  scene.add(spotLight);

  scene.add(new HemisphereLight(0xffffff, 0x080808, 1));
  scene.add(new AmbientLight(0xffffff, 0.1));

  const material = new MeshPhongMaterial({
    color: new Color(0x010101),
    specular: new Color(0x555555),
    flatShading: true,
    vertexColors: true,
  });

  const ballGeometry = new IcosahedronGeometry(10, shapeComplexity);
  const ball = new Mesh(ballGeometry, material);
  scene.add(ball);

  const vertices = ballGeometry.getAttribute("position");
  const colors = new Float32BufferAttribute(vertices.count * 3, 3);

  let faces: Face[] = [];
  const faceCount = vertices.count / 3;
  for (let i = 0; i < faceCount; ++i) {
    faces.push(new Face(vertices as any, colors, i));
  }
  faces = shuffle(faces);
  faces = sortBy(faces, (f) => f.centroid.y).reverse();
  faces.forEach((f, i) => {
    f.proportionalPosition = i / faces.length;
  });
  ballGeometry.setAttribute("color", colors);

  const shadow = new Shadow();
  scene.add(shadow);

  const floor = new Mesh(
    new CircleGeometry(100, 50),
    new MeshPhongMaterial({ color: 0xaaaaaa })
  );
  floor.rotation.x = -0.5 * Math.PI;
  floor.position.set(0, -12, 0);
  scene.add(floor);

  let currentColorIndex = 0;
  return (time) => {
    ball.scale.setScalar(time >= 3 ? 1 : outExpo(time / 3));
    const thisColorIndex =
      Math.floor(time / timeBetweenTransitions) % colorSequence.length;
    if (thisColorIndex !== currentColorIndex) {
      startTransitions(thisColorIndex);
    }
    faces.forEach((f) => f.update(time));
    shadow.update(time);
    controls.update();
  };

  function startTransitions(nextColorIndex: number) {
    faces.forEach((f) => f.startTransition(currentColorIndex, nextColorIndex));
    shadow.startTransition(currentColorIndex, nextColorIndex);
    currentColorIndex = nextColorIndex;
  }
});
