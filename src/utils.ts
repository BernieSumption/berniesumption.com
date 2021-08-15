import { Color, Texture, TextureLoader } from "three";

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
