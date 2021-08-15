import { Texture, TextureLoader } from "three";

const loader = new TextureLoader();
const textureCache: Record<string, Texture> = {};
export const loadTexture = (path: string) =>
  textureCache[path] || (textureCache[path] = loader.load(path));
