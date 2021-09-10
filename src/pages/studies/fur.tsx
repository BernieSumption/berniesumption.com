import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  InstancedMesh,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  SphereGeometry,
  SpotLight,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ThreeCanvas, ThreeInit } from "../../../assets/studies/balls/init-three-canvas";
import { faceCentroid } from "../../../assets/studies/balls/utils";

const scratchInit: ThreeInit = ({ scene, camera, renderer }) => {
  renderer.setClearColor(0);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.rotateSpeed = 0.1;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;

  const light = new SpotLight(0xffffff);
  light.position.set(5, 20, 5);
  scene.add(light);

  scene.add(new AmbientLight(0xffffff, 0.25));

  scene.add(new Furry(new SphereGeometry(1)));

  camera.position.set(-2, 3, 2.5);
  camera.lookAt(scene.position);

  return () => {
    controls.update();
  };
};

const ScratchStudy = () => <ThreeCanvas init={scratchInit} />;

export default ScratchStudy;

// TODO - orient strands pointing outwards - implement my own geometry generation
// TODO - vertex shader making strands wibble
// TODO - randomly distribute strands over surface

class Furry extends Object3D {
  constructor(private geometry: BufferGeometry) {
    super();
    this.add(
      new Mesh(
        geometry,
        new MeshPhongMaterial({ color: 0x222222, specular: 0x222222 })
      )
    );
    this.generateFur();
  }

  private generateFur() {
    const vertices = this.geometry
      .toNonIndexed()
      .getAttribute("position") as BufferAttribute;
    const faceCount = vertices.count / 3;
    const radius = 0.01;
    const height = 1;
    const mesh = new InstancedMesh(
      new CylinderGeometry(radius, radius, height, 4, 5, true),
      new MeshPhongMaterial({ color: 0xff0088, specular: 0x222222 }),
      faceCount
    );
    this.add(mesh);

    const dummy = new Object3D();
    for (let i = 0; i < faceCount; ++i) {
      dummy.position.copy(faceCentroid(vertices, i));
      dummy.updateMatrix();
      Next up: figure out how to get rotation from centroid
      mesh.setMatrixAt(i, dummy.matrix);
    }
  }
}
