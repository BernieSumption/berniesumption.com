import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { Color, PerspectiveCamera, Scene, WebGLRenderer } from "three";

export type ThreeInitParams = {
  scene: Scene;
  camera: PerspectiveCamera;
};

export type UpdateFunction = (time: number) => void;

export type ThreeInit = (params: ThreeInitParams) => UpdateFunction | void;

export type ThreeCanvasProps = {
  init: ThreeInit;
};

export const ThreeCanvas = ({ init }: ThreeCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef(0);
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    const onResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const canvas = containerRef.current;
    if (!canvas) return;

    const renderer = new WebGLRenderer({});
    renderer.setClearColor(new Color(0x000000));
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height, false);
    renderer.shadowMap.enabled = true;

    const scene = new Scene();
    const camera = new PerspectiveCamera(45, width / height);

    canvas.appendChild(renderer.domElement);

    const updateFunction = init({ scene, camera });

    const render = () => renderer.render(scene, camera);

    if (!startRef.current) {
      startRef.current = performance.now();
    }

    Next up: get this to re-render but not re-initialise when window resizes

    let cancelled = false;
    if (updateFunction) {
      const updateAndRender = () => {
        if (!cancelled) {
          window.requestAnimationFrame(updateAndRender);
          updateFunction((performance.now() - startRef.current) / 1000);
          render();
        }
      };
      updateAndRender();
    } else {
      render();
    }
    return () => {
      canvas.removeChild(renderer.domElement);
      renderer.forceContextLoss();
      renderer.dispose();
      cancelled = true;
    };
  }, [init]);

  useEffect(() => {

  }, [width, height])

  return <Container ref={containerRef} />;
};

const Container = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;

  canvas {
    width: 100%;
    height: 100%;
  }
`;
