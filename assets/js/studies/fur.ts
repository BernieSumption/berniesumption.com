import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  InstancedMesh,
  ShaderMaterial,
  MeshPhongMaterial,
  Object3D,
  SphereGeometry,
  SpotLight,
  Matrix4,
  Vector3,
} from "/vendor/three/three.module.js";

import { OrbitControls } from "/vendor/three/OrbitControls.js";

import { initThreeCanvas } from "/libs/init-three-canvas";
import { faceArea, randomPointOnFace } from "/libs/utils";

const strandCount = 1000;
const strandRadiusBase = 0.02;
const strandRadiusTop = 0.002;
const strandHeight = 1;

// TODO - vertex shader making strands wibble
// TODO fresnel shading to make strands appear soft edged?

class Furry extends Object3D {
  constructor(private geometry: BufferGeometry) {
    super();
    this.generateFur();
  }

  private generateFur() {
    const vertices = this.geometry
      .toNonIndexed()
      .getAttribute("position") as BufferAttribute;
    const faceCount = vertices.count / 3;
    const mesh = new InstancedMesh(
      new CylinderGeometry(
        strandRadiusTop,
        strandRadiusBase,
        strandHeight,
        4,
        4,
        true
      ).rotateX(Math.PI / 2),
      new StrandMaterial({ color: 0xff0088, specular: 0x222222 }),
      strandCount
    );
    this.add(mesh);

    // build a "slots" array, containing duplicated face indices. The number
    // of times that each face index appears in the array is proportional to
    // its area.
    const slotsPerFace = 10;
    const slots = new Int32Array(faceCount * slotsPerFace + faceCount);
    let slotCount = 0;
    const areas = new Float32Array(faceCount);
    areas.forEach((_, i) => (areas[i] = faceArea(vertices, i)));
    const totalArea = areas.reduce((a, b) => a + b, 0);
    areas.forEach((area, i) => {
      const thisAreaSlotCount = Math.round(
        (area / totalArea) * faceCount * slotsPerFace
      );
      for (let j = 0; j < thisAreaSlotCount; j++) {
        slots[++slotCount] = i;
      }
    });

    const mat = new Matrix4();
    const origin = new Vector3();
    const up = new Vector3(1, 0, 0);
    for (let i = 0; i < strandCount; ++i) {
      const faceIndex = slots[Math.floor(Math.random() * slotCount)];
      const strandStart = randomPointOnFace(vertices, faceIndex);
      mat.setPosition(strandStart.x, strandStart.y, strandStart.z);
      mat.lookAt(strandStart, origin, up);
      mesh.setMatrixAt(i, mat);
    }
  }
}

class StrandMaterial extends MeshPhongMaterial {
  onBeforeCompile(shader: any, renderer: any) {
    super.onBeforeCompile(shader, renderer);
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `
        vec3 transformed = vec3( position );
      `
    );
  }
}

initThreeCanvas(({ scene, camera, renderer }) => {
  renderer.setClearColor(0x0088ff);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.rotateSpeed = 0.1;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;

  const light = new SpotLight(0xffffff);
  light.position.set(5, 20, 5);
  scene.add(light);

  scene.add(new AmbientLight(0xffffff, 0.25));

  scene.add(new Furry(new SphereGeometry(0.5)));

  camera.position.set(2, 2, 2);
  camera.lookAt(scene.position);

  return () => {
    controls.update();
  };
});
