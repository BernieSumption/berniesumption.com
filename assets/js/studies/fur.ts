import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  InstancedMesh,
  ShaderMaterial,
  MeshPhongMaterial,
  Object3D,
  SphereGeometry,
  SpotLight,
  Matrix4,
  Vector3,
} from "/vendor/three/three.module.js";

import { OrbitControls } from "/vendor/three/OrbitControls.js";

import { initThreeCanvas } from "/libs/init-three-canvas";
import { faceArea, randomPointOnFace } from "/libs/utils";

const strandCount = 1000;
const strandRadiusBase = 0.02;
const strandRadiusTop = 0.002;
const strandHeight = 1;

// TODO - vertex shader making strands wibble
// TODO fresnel shading to make strands appear soft edged?

const strandMaterial = new ShaderMaterial({
  // vertexShader: `
  //   #define PHONG
  //   varying vec3 vViewPosition;
  //   #include <common>
  //   #include <normal_pars_vertex>
  //   void main() {
  //     #include <beginnormal_vertex>
  //     #include <defaultnormal_vertex>
  //     #include <begin_vertex>
  //     #include <project_vertex>
  //     vViewPosition = - mvPosition.xyz;
  //   }
  // `,
  uniforms: {
    diffuse: { value: new Color(0xff0088) },
    emissive: { value: new Color(0x000000) },
    specular: { value: new Color(0x222222) },
    shininess: { value: 30 },
    opacity: { value: 1 },
  },
  vertexShader: `
    #define PHONG
    varying vec3 vViewPosition;
    #include <common>
    #include <uv_pars_vertex>
    #include <uv2_pars_vertex>
    #include <displacementmap_pars_vertex>
    #include <envmap_pars_vertex>
    #include <color_pars_vertex>
    #include <fog_pars_vertex>
    #include <normal_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <shadowmap_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>
    void main() {
      #include <uv_vertex>
      #include <uv2_vertex>
      #include <color_vertex>
      #include <beginnormal_vertex>
      #include <morphnormal_vertex>
      #include <skinbase_vertex>
      #include <skinnormal_vertex>
      #include <defaultnormal_vertex>
      #include <normal_vertex>
      #include <begin_vertex>
      #include <morphtarget_vertex>
      #include <skinning_vertex>
      #include <displacementmap_vertex>
      #include <project_vertex>
      #include <logdepthbuf_vertex>
      #include <clipping_planes_vertex>
      vViewPosition = - mvPosition.xyz;
      #include <worldpos_vertex>
      #include <envmap_vertex>
      #include <shadowmap_vertex>
      #include <fog_vertex>
    }
  `,
  fragmentShader: `
    #define PHONG
    uniform vec3 diffuse;
    uniform vec3 emissive;
    uniform vec3 specular;
    uniform float shininess;
    uniform float opacity;
    #include <common>
    #include <packing>
    #include <dithering_pars_fragment>
    #include <color_pars_fragment>
    #include <uv_pars_fragment>
    #include <uv2_pars_fragment>
    #include <map_pars_fragment>
    #include <alphamap_pars_fragment>
    #include <alphatest_pars_fragment>
    #include <aomap_pars_fragment>
    #include <lightmap_pars_fragment>
    #include <emissivemap_pars_fragment>
    #include <envmap_common_pars_fragment>
    #include <envmap_pars_fragment>
    #include <cube_uv_reflection_fragment>
    #include <fog_pars_fragment>
    #include <bsdfs>
    #include <lights_pars_begin>
    #include <normal_pars_fragment>
    #include <lights_phong_pars_fragment>
    #include <shadowmap_pars_fragment>
    #include <bumpmap_pars_fragment>
    #include <normalmap_pars_fragment>
    #include <specularmap_pars_fragment>
    #include <logdepthbuf_pars_fragment>
    #include <clipping_planes_pars_fragment>
    void main() {
      #include <clipping_planes_fragment>
      vec4 diffuseColor = vec4( diffuse, opacity );
      ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
      vec3 totalEmissiveRadiance = emissive;
      #include <logdepthbuf_fragment>
      #include <map_fragment>
      #include <color_fragment>
      #include <alphamap_fragment>
      #include <alphatest_fragment>
      #include <specularmap_fragment>
      #include <normal_fragment_begin>
      #include <normal_fragment_maps>
      #include <emissivemap_fragment>
      #include <lights_phong_fragment>
      #include <lights_fragment_begin>
      #include <lights_fragment_maps>
      #include <lights_fragment_end>
      #include <aomap_fragment>
      vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
      #include <envmap_fragment>
      #include <output_fragment>
      #include <tonemapping_fragment>
      #include <encodings_fragment>
      #include <fog_fragment>
      #include <premultiplied_alpha_fragment>
      #include <dithering_fragment>
    }
  `,
  // vertexShader: `
  //   uniform float amplitude;

  //   varying vec3 vNormal;

  //   void main() {

  //     vNormal = normal;

  //     //vec3 newPosition = position + normal * amplitude * displacement;
  //     gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

  //     //gl_Position = vec4(position, 1.0);
  //   }
  // `,

  // fragmentShader: `
  //   varying vec3 vNormal;

  //   void main() {

  //     //const float ambient = 0.4;

  //     //vec3 light = vec3( 1.0 );
  //     //light = normalize( light );

  //     //float directional = max( dot( vNormal, light ), 0.0 );

  //     //
  //     //gl_FragColor = vec4( ( directional + ambient ) * vColor, 1.0 );

  //     gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 );

  //   }
  // `,
});
class Furry extends Object3D {
  constructor(private geometry: BufferGeometry) {
    super();
    this.generateFur();
  }

  private generateFur() {
    const vertices = this.geometry
      .toNonIndexed()
      .getAttribute("position") as BufferAttribute;
    const faceCount = vertices.count / 3;
    const mesh = new InstancedMesh(
      new CylinderGeometry(
        strandRadiusTop,
        strandRadiusBase,
        strandHeight,
        4,
        4,
        true
      ).rotateX(Math.PI / 2),
      strandMaterial,
      // new MeshPhongMaterial({ color: 0xff0088, specular: 0x222222 }),
      strandCount
    );
    this.add(mesh);

    // build a "slots" array, containing duplicated face indices. The number
    // of times that each face index appears in the array is proportional to
    // its area.
    const slotsPerFace = 10;
    const slots = new Int32Array(faceCount * slotsPerFace + faceCount);
    let slotCount = 0;
    const areas = new Float32Array(faceCount);
    areas.forEach((_, i) => (areas[i] = faceArea(vertices, i)));
    const totalArea = areas.reduce((a, b) => a + b, 0);
    areas.forEach((area, i) => {
      const thisAreaSlotCount = Math.round(
        (area / totalArea) * faceCount * slotsPerFace
      );
      for (let j = 0; j < thisAreaSlotCount; j++) {
        slots[++slotCount] = i;
      }
    });
    console.log(slotCount, slots.length, slots);

    const mat = new Matrix4();
    const origin = new Vector3();
    const up = new Vector3(1, 0, 0);
    for (let i = 0; i < strandCount; ++i) {
      const faceIndex = slots[Math.floor(Math.random() * slotCount)];
      const strandStart = randomPointOnFace(vertices, faceIndex);
      mat.setPosition(strandStart.x, strandStart.y, strandStart.z);
      mat.lookAt(strandStart, origin, up);
      mesh.setMatrixAt(i, mat);
    }
  }
}

initThreeCanvas(({ scene, camera, renderer }) => {
  renderer.setClearColor(0x0088ff);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.rotateSpeed = 0.1;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;

  const light = new SpotLight(0xffffff);
  light.position.set(5, 20, 5);
  scene.add(light);

  scene.add(new AmbientLight(0xffffff, 0.25));

  scene.add(new Furry(new SphereGeometry(0.5)));

  camera.position.set(2, 2, 2);
  camera.lookAt(scene.position);

  return () => {
    controls.update();
  };
});
