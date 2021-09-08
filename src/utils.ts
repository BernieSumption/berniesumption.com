import { BufferAttribute, Color, Texture, TextureLoader, Vector3 } from "three";

let loader: TextureLoader | undefined;
let textureCache: Record<string, Texture> | undefined;

export const loadTexture = (path: string) => {
  loader ||= new TextureLoader();
  textureCache ||= {};
  textureCache[path] ||= loader.load(path);
  return textureCache[path];
};

export const renderShadowTexture = (size: number, color: Color) => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const r = size / 2;
  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
  for (let i = 0; i <= 10; i++) {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const progress = i / 10;
    const alpha = -(Math.cos(Math.PI * (1 - progress)) - 1) / 2;
    gradient.addColorStop(progress, `rgba(${r}, ${g}, ${b}, ${alpha})`);
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
};

export const randomPointOnFace = (
  a: Vector3,
  b: Vector3,
  c: Vector3
): Vector3 => {
  const ap = Math.random();
  const bp = Math.random();
  const cp = Math.random();
  const scale = 1 / (ap + bp + cp);
  return new Vector3()
    .addScaledVector(a, ap * scale)
    .addScaledVector(b, bp * scale)
    .addScaledVector(c, cp * scale);
};

export const faceCentroid = (
  positions: BufferAttribute,
  faceIndex: number
): Vector3 => {
  const start = faceIndex * 3;
  const centroid = new Vector3(
    positions.getX(start + 0) +
      positions.getX(start + 1) +
      positions.getX(start + 2),
    positions.getY(start + 0) +
      positions.getY(start + 1) +
      positions.getY(start + 2),
    positions.getZ(start + 0) +
      positions.getZ(start + 1) +
      positions.getZ(start + 2)
  );
  return centroid.divideScalar(3);
};
