import {
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  Color,
  Float32BufferAttribute,
  FrontSide,
  HemisphereLight,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  SpotLight,
  Uint8ClampedBufferAttribute,
  Vector3,
} from "three";
import { OrbitControls } from "three-orbitcontrols-ts";
import { ThreeCanvas, ThreeInit } from "../../../components/three-canvas";

/*
    TODO
      - find a way to color each face independently
      - animate sphere from one color to another via flickering white
*/

const faceShadingInit: ThreeInit = ({ scene, camera, renderer, startTime }) => {
  renderer.setClearColor(new Color(0x999999));

  camera.position.set(-15, 20, 15);
  camera.lookAt(scene.position);

  const spotLight = new SpotLight(0x222222);
  spotLight.position.set(5, 20, 5);
  scene.add(spotLight);

  scene.add(new HemisphereLight(0xffffff, 0x080808, 1));

  const material = new MeshPhongMaterial({
    color: new Color(0x010101),
    specular: new Color(0x555555),
    flatShading: true,
    vertexColors: true,
  });

  const geometry = new IcosahedronGeometry(10, 1);
  // const geometry = new BoxGeometry(10, 10, 10);
  // const shape = new Mesh(geometry, fromMaterial);
  const shape = new Mesh(geometry, material);
  scene.add(shape);

  const faces: Face[] = [];

  const vertices = geometry.getAttribute("position");
  const colors = new Float32BufferAttribute(vertices.count * 3, 3);

  const faceCount = vertices.count / 3;
  for (let i = 0; i < faceCount; ++i) {
    faces.push(new Face(vertices as any, colors, i * 3));
  }

  geometry.setAttribute("color", colors);

  // geometry.groups.forEach((g) => {
  //   g.materialIndex = 0;
  // });

  return (time) => {
    shape.rotation.y = time * 0.1;
  };
};

const FaceShadingStudy = () => <ThreeCanvas init={faceShadingInit} />;

export default FaceShadingStudy;

const from = 0;
const to = 1;
const accent = 2;

class Face {
  private centroid: Vector3;

  constructor(
    private positions: BufferAttribute,
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

    this.setColor(255, 80, 0);
    this.setColor(255, 255, 255);
  }

  public update(time: number) {}

  private setColor(r: number, g: number, b: number) {
    this.colors.setXYZ(this.start, r, g, b);
    this.colors.setXYZ(this.start + 1, r, g, b);
    this.colors.setXYZ(this.start + 2, r, g, b);
  }
}

type Group = {
  start: number;
  count: number;
  materialIndex?: number | undefined;
};
