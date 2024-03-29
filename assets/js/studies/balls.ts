import {
  AmbientLight,
  CanvasTexture,
  Color,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  PlaneGeometry,
  RingGeometry,
  Scene,
  SphereGeometry,
  SpotLight,
  Vector3,
} from "/vendor/three/three.module.js";

import { OrbitControls } from "/vendor/three/OrbitControls.js";

import { initThreeCanvas } from "/libs/init-three-canvas";
import { degrees, memoize, renderShadowTexture } from "/libs/utils";

const floorRadius = 10;
const emitterCount = 15;
const twoPi = Math.PI * 2;

const ballInitialAngle = degrees(25);
const ballInitialSpeed = 9;
const ballRadius = 0.2;
const pingSize = 2;
const bounceAttenuation = 0.8;
const ballFadeOutDistance = 5;
const ballSaturation = 1;
const ballLightness = 0.5;
const pingDuration = 1;
const shadowStartHeight = 2;
const shadowLowSize = 1;
const shadowHighSize = 1;
const shadowLowOpacity = 0.5;
const ballGeometry = new SphereGeometry(ballRadius, 10, 10);
const pingGeometry = new PlaneGeometry(pingSize, pingSize);
const shadowGeometry = new PlaneGeometry();

class Ball {
  private ballMesh: Mesh;
  private ballMaterial: MeshPhongMaterial;
  private pingMesh: Mesh;
  private pingMaterial: MeshBasicMaterial;
  private shadowMesh: Mesh;
  private shadowMaterial: MeshBasicMaterial;
  private pingProgression = 0;
  private velocity: Vector3;
  private hue: number;

  constructor(private scene: Scene, yRotation: number) {
    this.hue = yRotation / 2 / Math.PI;
    this.ballMaterial = new MeshPhongMaterial({
      color: new Color().setHSL(this.hue, ballSaturation, ballLightness),
      specular: new Color(0x222222),
    });
    this.ballMesh = new Mesh(ballGeometry, this.ballMaterial);
    this.ballMesh.position.set(0, 0.5, 0);
    scene.add(this.ballMesh);

    this.pingMaterial = new MeshBasicMaterial({
      map: getBallPingTexture(),
      color: new Color(0x2233bb),
      transparent: true,
      depthWrite: false,
    });
    this.pingMesh = new Mesh(pingGeometry, this.pingMaterial);
    this.pingMesh.rotation.x = -0.5 * Math.PI;
    scene.add(this.pingMesh);

    this.shadowMaterial = new MeshBasicMaterial({
      map: getBallShadowTexture(),
      transparent: true,
      depthWrite: false,
    });
    this.shadowMesh = new Mesh(shadowGeometry, this.shadowMaterial);
    this.shadowMesh.rotation.x = -0.5 * Math.PI;
    scene.add(this.shadowMesh);

    this.velocity = new Vector3(0, 1, 0)
      .normalize()
      .multiplyScalar(ballInitialSpeed)
      .applyAxisAngle(new Vector3(1, 0, 0), ballInitialAngle)
      .applyAxisAngle(new Vector3(0, 1, 0), yRotation);
  }

  public update(dt: number) {
    const position = this.ballMesh.position;
    this.velocity.y -= 9.81 * dt;
    position.addScaledVector(this.velocity, dt);
    if (
      position.y < ballRadius &&
      position.length() < floorRadius + ballRadius
    ) {
      position.y = ballRadius + (ballRadius - position.y);
      this.velocity.y *= -1;
      this.velocity.multiplyScalar(bounceAttenuation + 0.0);
      this.pingMesh.position.set(position.x, 0.2, position.z);
      this.pingProgression = pingDuration;
    }
    if (position.y < 0) {
      const fade = 1 - -position.y / ballFadeOutDistance;
      this.ballMaterial.color.setHSL(
        this.hue,
        ballSaturation,
        ballLightness * fade
      );
    }
    if (this.pingProgression > 0) {
      const progress = 1 - this.pingProgression / pingDuration;
      this.pingMaterial.opacity = 1 - progress;
      this.pingMesh.scale.setScalar(progress * 0.34 + 0.66);
    } else {
      this.pingMaterial.opacity = 0;
    }
    this.pingProgression = Math.max(0, this.pingProgression - dt);

    this.shadowMesh.position.set(position.x, 0.01, position.z);
    const shadowProgression = MathUtils.clamp(
      1 - position.y / shadowStartHeight,
      0,
      1
    );
    const shadowSize = MathUtils.lerp(
      shadowHighSize,
      shadowLowSize,
      shadowProgression
    );
    const shadowArea = shadowSize * shadowSize;
    const maxShadowArea = shadowHighSize * shadowHighSize;
    this.shadowMaterial.opacity =
      shadowProgression * shadowLowOpacity * (shadowArea / maxShadowArea);
    this.shadowMesh.scale.setScalar(shadowSize);
  }

  public alive() {
    return this.ballMesh.position.y > -ballFadeOutDistance;
  }

  public remove() {
    this.scene.remove(this.ballMesh);
    this.scene.remove(this.pingMesh);
  }
}

const getBallShadowTexture = memoize(() =>
  renderShadowTexture(128, new Color(0x000000))
);

const getBallPingTexture = memoize(() => {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const r = size / 2;
  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
  gradient.addColorStop(0.6, `rgba(255, 255, 255, 0)`);
  gradient.addColorStop(0.99, `rgba(255, 255, 255, 1)`);
  gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
});

class Emitter {
  private timeToNextEmit = 0;

  constructor(
    private scene: Scene,
    private yRotation: number,
    private period: number
  ) {}

  public update(dt: number): Ball | void {
    this.timeToNextEmit -= dt;
    if (this.timeToNextEmit <= 0) {
      const ball = new Ball(this.scene, this.yRotation);
      ball.update(-this.timeToNextEmit);
      this.timeToNextEmit += this.period;
      return ball;
    }
  }
}

initThreeCanvas(({ scene, camera, renderer, startTime }) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.rotateSpeed = 0.1;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;

  const floor = new Mesh(
    new RingGeometry(1, floorRadius, 50),
    new MeshLambertMaterial({ color: 0xaaaaaa })
  );
  floor.rotation.x = -0.5 * Math.PI;
  floor.position.set(0, 0, 0);
  scene.add(floor);

  const emitters: Emitter[] = [];
  const balls: Ball[] = [];

  for (let i = 0; i < emitterCount; i++) {
    const oscillationsPerMinute = 51 + i;
    const period = oscillationsPerMinute / 60 + 1;
    emitters.push(new Emitter(scene, (i / emitterCount) * twoPi, period));
  }

  camera.position.set(-15, 20, 15);
  camera.lookAt(scene.position);

  const light = new SpotLight(0xffffff);
  light.position.set(5, 20, 5);
  scene.add(light);

  const ambientLight = new AmbientLight(0xffffff, 0.25);
  scene.add(ambientLight);

  let lastTime = startTime;

  return (time) => {
    const dt = Math.min(time - lastTime, 1 / 30);
    lastTime = time;
    emitters.forEach((e) => {
      const ball = e.update(dt);
      if (ball) {
        balls.push(ball);
      }
    });
    balls.forEach((b) => {
      b.update(dt);
      if (!b.alive()) {
        b.remove();
        balls.splice(balls.indexOf(b), 1);
      }
    });
    controls.update();
  };
});
