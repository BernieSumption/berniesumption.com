import styled from "@emotion/styled";
import { useEffect, useRef } from "react";
import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Sphere,
  SphereGeometry,
  SpotLight,
  Vector2,
} from "three";
import { ThreeCanvas, ThreeInit } from "../../components/three-canvas";

const threeStudyInit: ThreeInit = ({ scene, camera }) => {
  scene.add(new AxesHelper(20));

  const plane = new Mesh(
    new PlaneGeometry(60, 20),
    new MeshLambertMaterial({ color: 0xaaaaaa })
  );
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.set(15, 0, 0);
  plane.receiveShadow = true;
  scene.add(plane);

  const cube = new Mesh(
    new BoxGeometry(4, 4, 4),
    new MeshLambertMaterial({ color: 0xff0000 })
  );
  cube.position.set(-4, 3, 0);
  cube.castShadow = true;
  scene.add(cube);

  const rand = (from: number, to: number) => Math.random() * (from - to) + to;

  const addRandomSphere = () => {
    const sphere = new Mesh(
      new SphereGeometry(rand(1, 5), 20, 20),
      new MeshLambertMaterial({
        color: Math.floor(Math.random() * 0xffffff),
      })
    );
    sphere.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );
    sphere.position.set(rand(-20, 20), rand(2, 5), rand(-10, 10));
    sphere.castShadow = true;
    scene.add(sphere);
  };

  for (let i = 0; i < 10; i++) {
    addRandomSphere();
  }

  camera.position.set(-30, 40, 30);
  camera.lookAt(scene.position);

  const light = new SpotLight(0xffffff);
  light.position.set(-40, 40, -15);
  light.castShadow = true;
  light.shadow.mapSize = new Vector2(4096, 4096);
  light.shadow.camera.far = 130;
  light.shadow.camera.near = 40;
  scene.add(light);

  const ambientLight = new AmbientLight(0xff99cc, 0.25);
  scene.add(ambientLight);

  return (time) => {
    ambientLight.intensity = Math.sin(time * 3) / 4 + 0.5;
  };
};

const ThreeStudy = () => <ThreeCanvas init={threeStudyInit} />;

export default ThreeStudy;
