import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  BoxGeometry,
  InstancedMesh,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  IcosahedronGeometry,
  SphereGeometry,
  SpotLight,
  AxesHelper,
  Matrix4,
  Vector3,
} from "/vendor/three/three.module.js";

import { OrbitControls } from "/vendor/three/OrbitControls.js";

import { initThreeCanvas } from "/libs/init-three-canvas";
import { faceCentroid } from "/libs/utils";

// TODO - orient strands pointing outwards - implement my own geometry generation
// TODO - vertex shader making strands wibble
// TODO - randomly distribute strands over surface

const halfPi = Math.PI * 0.5;
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
      new BoxGeometry(radius, radius, height, 1, 1, 4),
      new MeshPhongMaterial({ color: 0xff0088, specular: 0x222222 }),
      faceCount
    );
    this.add(mesh);

    const mat = new Matrix4();
    // obj.up.set(1, 0, 0);
    for (let i = 0; i < faceCount; ++i) {
      const strandStart = faceCentroid(vertices, i);
      mat.setPosition(strandStart.x, strandStart.y, strandStart.z);
      mat.lookAt(strandStart, new Vector3(), new Vector3(1, 0, 0));
      mesh.setMatrixAt(i, mat);
    }
  }
}

initThreeCanvas(({ scene, camera, renderer }) => {
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

  const axes = new AxesHelper(3);
  // (axes.material as any).depthTest = false;
  scene.add(axes);

  camera.position.set(3, 3, 3);
  camera.lookAt(scene.position);

  return () => {
    controls.update();
  };
});
