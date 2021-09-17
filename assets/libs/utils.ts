import {
  BufferAttribute,
  CanvasTexture,
  Color,
  Texture,
  TextureLoader,
  Triangle,
  Vector3,
} from "/vendor/three/three.module.js";

let loader: TextureLoader | undefined;
let textureCache: Record<string, Texture> | undefined;

export const loadTexture = (path: string) => {
  loader ||= new TextureLoader();
  textureCache ||= {};
  textureCache[path] ||= loader.load(path);
  return textureCache[path];
};

export const memoize = <T>(f: () => T): (() => T) => {
  let cache: T;
  let called = false;
  return function (this: any, ...args: any) {
    if (!called) {
      called = true;
      cache = f.apply(this, args);
    }
    return cache;
  };
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
  return new CanvasTexture(canvas);
};

export const randomPointOnFace = (
  positions: BufferAttribute,
  faceIndex: number,
  result = new Vector3()
): Vector3 => {
  const start = faceIndex * 3;
  const ax = positions.getX(start + 0);
  const ay = positions.getY(start + 0);
  const az = positions.getZ(start + 0);
  const bx = positions.getX(start + 1);
  const by = positions.getY(start + 1);
  const bz = positions.getZ(start + 1);
  const cx = positions.getX(start + 2);
  const cy = positions.getY(start + 2);
  const cz = positions.getZ(start + 2);
  const v1x = bx - ax;
  const v1y = by - ay;
  const v1z = bz - az;
  const v2x = cx - ax;
  const v2y = cy - ay;
  const v2z = cz - az;
  let p1 = Math.random();
  let p2 = Math.random();
  if (p1 + p2 > 1) {
    p1 = 1 - p1;
    p2 = 1 - p2;
  }
  return result.set(
    ax + v1x * p1 + v2x * p2,
    ay + v1y * p1 + v2y * p2,
    az + v1z * p1 + v2z * p2
  );
};

// export const randomPointOnFace = (
//   a: Vector3,
//   b: Vector3,
//   c: Vector3
// ): Vector3 => {
//   const v1 = b.clone().sub(a);
//   const v2 = c.clone().sub(a);
//   let p1 = Math.random();
//   let p2 = Math.random();
//   if (p1 + p2 > 1) {
//     p1 = 1 - p1;
//     p2 = 1 - p2;
//   }
//   return a.clone().addScaledVector(v1, p1).addScaledVector(v2, p2);
// };

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

const triangle = new Triangle();
export const faceArea = (
  positions: BufferAttribute,
  faceIndex: number
): number => {
  const start = faceIndex * 3;
  triangle.a.set(
    positions.getX(start + 0),
    positions.getY(start + 0),
    positions.getZ(start + 0)
  );
  triangle.b.set(
    positions.getX(start + 1),
    positions.getY(start + 1),
    positions.getZ(start + 1)
  );
  triangle.c.set(
    positions.getX(start + 2),
    positions.getY(start + 2),
    positions.getZ(start + 2)
  );
  return triangle.getArea();
};

export const degrees = (d: number) => (d / 180) * Math.PI;

export const shuffle = <T>(arr: T[]): T[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let x = arr[i];
    arr[i] = arr[j];
    arr[j] = x;
  }
  return arr;
};

export const sortBy = <T>(arr: T[], f: (item: T) => any): T[] =>
  arr.sort((a, b) => {
    let aValue = f(a);
    let bValue = f(b);
    if (aValue < bValue) {
      return -1;
    }
    if (aValue > bValue) {
      return 1;
    }
    return 0;
  });
