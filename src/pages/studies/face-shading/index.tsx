import {
  Color,
  FrontSide,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
} from "three";
import { OrbitControls } from "three-orbitcontrols-ts";
import { ThreeCanvas, ThreeInit } from "../../../components/three-canvas";

/*
    TODO
      - find a way to color each face independently
      - animate sphere from one color to another via flickering white
*/

const floorRadius = 10;

const faceShadingInit: ThreeInit = ({ scene, camera, renderer, startTime }) => {
  renderer.setClearColor(new Color(0x999999));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.rotateSpeed = 0.1;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;

  camera.position.set(-15, 20, 15);
  camera.lookAt(scene.position);

  const geometry = new IcosahedronGeometry(10, 3);
  const shape = new Mesh(
    geometry,
    new MeshBasicMaterial({
      color: new Color(0xffaa88),
    })
  );
  scene.add(shape);

  scene.add(
    new Mesh(
      geometry,
      new MeshBasicMaterial({
        color: new Color(0xffffff),
        wireframe: true,
        side: FrontSide,
      })
    )
  );

  //   var mat_wireframe = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true});
  // var mat_lambert = new THREE.MeshLambertMaterial({color: 0xffffff, shading: THREE.FlatShading});

  let lastTime = startTime;

  return (time) => {
    controls.update();
  };
};

const FaceShadingStudy = () => <ThreeCanvas init={faceShadingInit} />;

export default FaceShadingStudy;
