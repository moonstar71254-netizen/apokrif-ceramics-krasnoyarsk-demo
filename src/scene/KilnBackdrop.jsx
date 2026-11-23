import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';

const BACKDROP_THEMES = {
  chamotte: {
    deep: '#0C0907',
    mid: '#231610',
    ember: '#6E3619',
  },
  porcelain: {
    deep: '#151311',
    mid: '#2A2520',
    ember: '#6B5440',
  },
  copper: {
    deep: '#120A07',
    mid: '#2F170D',
    ember: '#8C3F19',
  },
};

const VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorldDir;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldDir = normalize(position);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uHeat;
  uniform vec3 uColorDeep;
  uniform vec3 uColorMid;
  uniform vec3 uColorEmber;
  uniform vec2 uPointer;

  varying vec3 vWorldDir;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      v += amp * noise(p);
      p = p * 2.02 + vec2(1.7, 9.2);
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 dir = normalize(vWorldDir);
    vec2 uv = vec2(atan(dir.x, -dir.z) * 0.45, dir.y * 1.15);

    // Gentle kiln heat haze & soft breathing
    float breath = 0.5 + 0.5 * sin(uTime * 0.42);
    vec2 drift = vec2(uTime * 0.025 + uPointer.x * 0.08, -uTime * 0.048 + uPointer.y * 0.06);
    float n1 = fbm(uv * 2.4 + drift);
    float n2 = fbm(uv * 4.2 - drift * 0.7 + vec2(n1 * 0.9));

    // Warm furnace hearth glow concentrated softly below-center
    float hearthMask = smoothstep(0.65, -0.58, dir.y);
    float centerGlow = exp(-length(dir.xy - uPointer * 0.14) * 1.65);

    vec3 col = mix(uColorDeep, uColorMid, clamp(n1 * 0.72 + hearthMask * 0.36, 0.0, 1.0));

    // Ember kiln shimmer intensifies smoothly with firing temperature (900 -> 1250 C)
    float emberStrength = (0.14 + uHeat * 0.46) * (0.78 + 0.22 * breath);
    float emberField = smoothstep(0.28, 0.92, n2 * 0.65 + centerGlow * 0.55 + hearthMask * 0.25);
    col = mix(col, uColorEmber, clamp(emberField * emberStrength, 0.0, 0.62));

    // Subtle warm kiln highlight near 1250 C without blowing out to white
    vec3 hotCore = vec3(0.76, 0.34, 0.14);
    col += hotCore * (uHeat * 0.12 * centerGlow * (0.75 + 0.25 * n2));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function KilnBackdrop({ glazeKey, firingTemp, pointerRef }) {
  const matRef = useRef();
  const heatTarget = (Math.max(900, Math.min(1250, firingTemp)) - 900) / 350;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHeat: { value: heatTarget },
      uColorDeep: { value: new THREE.Color(BACKDROP_THEMES.chamotte.deep) },
      uColorMid: { value: new THREE.Color(BACKDROP_THEMES.chamotte.mid) },
      uColorEmber: { value: new THREE.Color(BACKDROP_THEMES.chamotte.ember) },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  // Smoothly animate GLSL palette when glaze changes
  useEffect(() => {
    const theme = BACKDROP_THEMES[glazeKey] || BACKDROP_THEMES.chamotte;
    const tl = gsap.timeline({
      defaults: { duration: 0.65, ease: 'power2.inOut', overwrite: 'auto' },
    });
    const d = new THREE.Color(theme.deep);
    const m = new THREE.Color(theme.mid);
    const e = new THREE.Color(theme.ember);
    tl.to(uniforms.uColorDeep.value, { r: d.r, g: d.g, b: d.b }, 0)
      .to(uniforms.uColorMid.value, { r: m.r, g: m.g, b: m.b }, 0)
      .to(uniforms.uColorEmber.value, { r: e.r, g: e.g, b: e.b }, 0);
    return () => tl.kill();
  }, [glazeKey, uniforms]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uHeat.value += (heatTarget - uniforms.uHeat.value) * Math.min(1, delta * 7.5);
    const px = pointerRef?.current?.x || 0;
    const py = pointerRef?.current?.y || 0;
    uniforms.uPointer.value.x += (px - uniforms.uPointer.value.x) * Math.min(1, delta * 4.0);
    uniforms.uPointer.value.y += (py - uniforms.uPointer.value.y) * Math.min(1, delta * 4.0);
  });

  return (
    <mesh name="kiln-glsl-backdrop" renderOrder={-10}>
      <sphereGeometry args={[32, 48, 32]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
