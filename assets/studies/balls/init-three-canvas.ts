import { Color, PerspectiveCamera, Scene, WebGLRenderer } from "three";

export type ThreeInitParams = {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  startTime: number;
};

export type ThreeUpdateFunction = (time: number) => void;

export type ThreeInitFunction = (
  params: ThreeInitParams
) => ThreeUpdateFunction | void;

const containerId = "study-container";

export const initThreeCanvas = (init: ThreeInitFunction) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`#${containerId} not found`);
    return;
  }

  const renderer = new WebGLRenderer({ antialias: true });
  container.appendChild(renderer.domElement);
  renderer.setClearColor(new Color(0x000000));

  const scene = new Scene();
  const camera = new PerspectiveCamera(45);

  const handleResize = () => {
    const width = Math.min(container.offsetWidth, window.innerWidth);
    const height = Math.min(container.offsetHeight, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
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

  const render = () => renderer.render(scene, camera);

  let cancelled = false;
  if (updateFunction) {
    const updateAndRender = () => {
      if (!cancelled) {
        // TODO stats.current?.begin();
        window.requestAnimationFrame(updateAndRender);
        updateFunction(performance.now() / 1000);
        renderer.render(scene, camera);
        // TODO stats.current?.end();
      }
    };
    updateAndRender();
  } else {
    renderer.render(scene, camera);
  }

  onResize(container, () => {
    handleResize();
    render();
  });

  // const stats = useRef<Stats>();

  // useEffect(() => {
  //   if (document.location.search.indexOf("stats=1") !== -1) {
  //     stats.current = new Stats();
  //     stats.current.showPanel(0);
  //     document.body.appendChild(stats.current.dom);
  //   }
  // }, []);
};

const onResize = (el: HTMLElement, callback: () => void) => {
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(() => callback());
    observer.observe(el);
  } else {
    window.addEventListener("resize", () => callback());
  }
};
