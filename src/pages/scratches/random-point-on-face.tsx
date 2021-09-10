import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  SpotLight,
  Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  ThreeCanvas,
  ThreeInit,
} from "../../../assets/studies/balls/init-three-canvas";
import { randomPointOnFace } from "../../../assets/studies/balls/utils";

const scratchInit: ThreeInit = ({ scene, camera, renderer, startTime }) => {
  renderer.setClearColor(0x666666);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.rotateSpeed = 0.1;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;

  const light = new SpotLight(0xffffff);
  light.position.set(5, 20, 5);
  scene.add(light);

  scene.add(new AmbientLight(0xffffff, 0.25));

  const a = new Vector3(0, 0, 0);
  const b = new Vector3(0, 1, 1);
  const c = new Vector3(1, 2.5, -1);

  scene.add(
    new Mesh(
      new BufferGeometry().setFromPoints([a, b, c]),
      new MeshPhongMaterial({ color: new Color(0x999999), side: DoubleSide })
    )
  );

  const pointGeometry = new BoxGeometry(0.01, 0.01, 0.01);
  const pointMaterial = new MeshBasicMaterial({ color: 0xff0088 });

  for (let i = 0; i < 10000; i++) {
    const point = new Mesh(pointGeometry, pointMaterial);
    point.position.copy(randomPointOnFace(a, b, c));
    scene.add(point);
  }

  camera.position.set(-2, 3, 2.5);
  camera.lookAt(scene.position);

  return () => {
    controls.update();
  };
};

const ScratchStudy = () => <ThreeCanvas init={scratchInit} />;

export default ScratchStudy;
