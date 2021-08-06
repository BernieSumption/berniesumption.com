import styled from "@emotion/styled";
import { useEffect, useRef } from "react";
import {
  AmbientLight,
  AxesHelper,
  BufferGeometry,
  CircleGeometry,
  Color,
  Mesh,
  MeshLambertMaterial,
  MeshPhongMaterial,
  Scene,
  SphereGeometry,
  SpotLight,
  Vector2,
  Vector3,
} from "three";
import { ThreeCanvas, ThreeInit } from "../../components/three-canvas";

/*

  TODO

  - Disc plane
  - Ball launched in trajectory
  - Gravity on ball
  - Bouncing off plane
  - Bounce attenuation
  - Fall off edge of disc
  - Remove ball once it falls down far enough
  - Regular emit (every 5s)
  - Many emitters with 0.1s difference
  - Use fake shadows as per https://threejsfundamentals.org/threejs/lessons/threejs-shadows.html
  - Make an animated "ping" when a ball bounces
*/

const floorRadius = 10;

const ballsInit: ThreeInit = ({ scene, camera, renderer, startTime }) => {
  renderer.shadowMap.enabled = true;
  scene.add(new AxesHelper(20));

  const floor = new Mesh(
    new CircleGeometry(floorRadius, 50),
    new MeshLambertMaterial({ color: 0xaaaaaa })
  );
  floor.rotation.x = -0.5 * Math.PI;
  floor.position.set(0, 0, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  const sphere = new SphereGeometry(0.2, 10, 10);

  const balls: Ball[] = [];

  balls.push(new Ball(scene, sphere));

  camera.position.set(-15, 20, 15);
  camera.lookAt(scene.position);

  const light = new SpotLight(0xffffff);
  light.position.set(5, 20, 5);
  light.castShadow = true;
  light.shadow.mapSize = new Vector2(2048, 2048);
  light.shadow.camera.far = 130;
  light.shadow.camera.near = 10;
  light.shadow.camera.fov = 10;
  light.shadow.camera.lookAt(scene.position);
  light.shadow.camera.updateProjectionMatrix();
  scene.add(light);

  const ambientLight = new AmbientLight(0xffffff, 0.25);
  scene.add(ambientLight);

  let lastTime = startTime;

  return (time) => {
    balls.forEach((b) => b.update(time - lastTime));
    lastTime = time;
    // ambientLight.intensity = Math.sin(time * 3) / 4 + 0.5;
  };
};

class Ball {
  private mesh: Mesh;
  private velocity: Vector3;

  constructor(scene: Scene, geometry: BufferGeometry) {
    this.mesh = new Mesh(
      geometry,
      new MeshPhongMaterial({
        color: new Color().setHSL(Math.random(), 1, 0.5),
        specular: new Color(0x222222),
      })
    );
    this.mesh.castShadow = true;
    this.mesh.position.set(0, 0, 0);
    scene.add(this.mesh);

    this.velocity = new Vector3(1, 1, 1);
  }

  public update(dt: number) {
    if (dt > 1) console.log("!!!!!", dt);
    this.mesh.position.addScaledVector(this.velocity, dt);
  }
}

const ThreeStudy = () => <ThreeCanvas init={ballsInit} />;

export default ThreeStudy;
