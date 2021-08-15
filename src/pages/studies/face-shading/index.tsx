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
} from "three";
import { ThreeCanvas, ThreeInit } from "../../../components/three-canvas";
import * as _ from "lodash";
import { OrbitControls } from "three-orbitcontrols-ts";
import { loadTexture } from "../../../utils";

type Tuple3 = [number, number, number];

const timeBetweenTransitions = 5;
const transitionDuration = 2;
const transitionOffset = 1;
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

const faceShadingInit: ThreeInit = ({ scene, camera, renderer }) => {
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

  const geometry = new IcosahedronGeometry(10, 3);
  const shape = new Mesh(geometry, material);
  scene.add(shape);

  const vertices = geometry.getAttribute("position");
  const colors = new Float32BufferAttribute(vertices.count * 3, 3);

  let faces: Face[] = [];
  const faceCount = vertices.count / 3;
  for (let i = 0; i < faceCount; ++i) {
    faces.push(new Face(vertices as any, colors, i * 3));
  }
  faces = _.shuffle(faces);
  faces = _.sortBy(faces, (f) => f.centroid.y).reverse();
  faces.forEach((f, i) => {
    f.proportionalPosition = i / faces.length;
  });
  geometry.setAttribute("color", colors);

  const shadowMaterial = new MeshBasicMaterial({
    map: loadTexture("/assets/studies/face-shading/grey-shadow.png"),
    color: new Color(0xff8000),
    transparent: true,
    depthWrite: false,
    opacity: 0.65,
  });
  const shadowMesh = new Mesh(new PlaneGeometry(20, 20), shadowMaterial);
  shadowMesh.rotation.x = -0.5 * Math.PI;
  shadowMesh.position.setY(-11.9);
  scene.add(shadowMesh);

  const floor = new Mesh(
    new CircleGeometry(100, 50),
    new MeshPhongMaterial({ color: 0xaaaaaa })
  );
  floor.rotation.x = -0.5 * Math.PI;
  floor.position.set(0, -12, 0);
  scene.add(floor);

  let currentColorIndex = 0;
  let floorColorIndex = 0;
  return (time) => {
    const thisColorIndex =
      Math.floor(time / timeBetweenTransitions) % colorSequence.length;
    if (thisColorIndex !== currentColorIndex) {
      startFaceTransitions(thisColorIndex);
    }
    faces.forEach((f) => f.update(time));
    controls.update();

    const thisFloorColorIndex =
      Math.floor(
        (time - transitionOffset - transitionDuration / 2) /
          timeBetweenTransitions
      ) % colorSequence.length;
    if (floorColorIndex !== thisFloorColorIndex) {
      floorColorIndex = thisFloorColorIndex;
      shadowMaterial.color = threeColorSequence[thisFloorColorIndex];
    }
  };

  function startFaceTransitions(nextColorIndex: number) {
    faces.forEach((f) =>
      f.startTransition(
        colorSequence[currentColorIndex],
        colorSequence[nextColorIndex]
      )
    );
    currentColorIndex = nextColorIndex;
  }
};

const FaceShadingStudy = () => <ThreeCanvas init={faceShadingInit} />;

export default FaceShadingStudy;

class Face {
  public centroid: Vector3;
  private transitionStartTime = 0;
  private currentTime = 0;
  private transitionRunning = false;
  private from = colorSequence[0];
  private to = colorSequence[0];
  public proportionalPosition = 0;

  constructor(
    positions: BufferAttribute,
    private colors: BufferAttribute,
    private start: number
  ) {
    this.centroid = new Vector3();
    for (let i = 0; i < 3; i++) {
      const index = start + i;
      this.centroid.x += positions.getX(index);
      this.centroid.y += positions.getY(index);
      this.centroid.z += positions.getZ(index);
    }
    this.centroid.x /= 3;
    this.centroid.y /= 3;
    this.centroid.z /= 3;

    this.setColor(colorSequence[0]);
  }

  public update(time: number) {
    this.currentTime = time;
    if (this.transitionRunning) {
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
  }

  public startTransition(from: Tuple3, to: Tuple3) {
    this.from = from;
    this.to = to;
    this.transitionStartTime =
      this.currentTime + this.proportionalPosition * transitionOffset;
    this.transitionRunning = true;
  }

  private setColor(color: Tuple3) {
    this.colors.setXYZ(this.start, ...color);
    this.colors.setXYZ(this.start + 1, ...color);
    this.colors.setXYZ(this.start + 2, ...color);
    this.colors.needsUpdate = true;
  }
}
