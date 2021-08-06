import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { Color, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { NoSSR } from "./no-ssr";

export type ThreeInitParams = {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  startTime: number;
};

export type UpdateFunction = (time: number) => void;

export type ThreeInit = (params: ThreeInitParams) => UpdateFunction | void;

export type ThreeCanvasProps = {
  init: ThreeInit;
};

export const ThreeCanvas = ({ init }: ThreeCanvasProps) => (
  <NoSSR>
    <BrowserThreeCanvas init={init} />
  </NoSSR>
);

const BrowserThreeCanvas = ({ init }: ThreeCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef(0);
  const onResizeRef = useRef<() => void>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new WebGLRenderer({ antialias: true });
    container.appendChild(renderer.domElement);
    renderer.setClearColor(new Color(0x000000));

    const scene = new Scene();
    const camera = new PerspectiveCamera(45);

    const handleResize = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    handleResize();

    const updateFunction = init({
      scene,
      camera,
      renderer,
      startTime: performance.now() / 1000,
    });

    console.log("!!!");

    const render = () => renderer.render(scene, camera);

    onResizeRef.current = () => {
      handleResize();
      render();
    };

    let cancelled = false;
    if (updateFunction) {
      const updateAndRender = () => {
        if (!cancelled) {
          window.requestAnimationFrame(updateAndRender);
          updateFunction(performance.now() / 1000);
          renderer.render(scene, camera);
        }
      };
      updateAndRender();
    } else {
      renderer.render(scene, camera);
    }
    return () => {
      container.removeChild(renderer.domElement);
      renderer.forceContextLoss();
      renderer.dispose();
      cancelled = true;
      onResizeRef.current = undefined;
    };
  }, [init]);

  useEffect(() => {
    const onResize = () => {
      onResizeRef.current?.();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
