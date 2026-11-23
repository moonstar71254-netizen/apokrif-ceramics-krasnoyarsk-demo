import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import {
  createGlazeTextureSet,
  createWheelTextureSet,
  disposeTextureSet,
} from './textures';
import {
  EXPLODE_DIRS,
  OBJECT_KEYS,
  resolvePose,
} from './poses';

export const GLAZE_PRESETS = {
  chamotte: {
    id: 'chamotte',
    name: 'Тёмный шамот',
    swatch: '#7B503A',
    primary: {
      color: '#B8896D',
      roughness: 0.78,
      metalness: 0.06,
      clearcoat: 0.14,
      clearcoatRoughness: 0.56,
      bumpScale: 0.022,
    },
    secondary: {
      color: '#D5C4B2',
      roughness: 0.44,
      metalness: 0.05,
      clearcoat: 0.42,
      clearcoatRoughness: 0.28,
      bumpScale: 0.011,
    },
    collar: {
      color: '#C77A4A',
      roughness: 0.28,
      metalness: 0.88,
    },
    lights: {
      ambient: '#2E231D',
      ambientIntensity: 0.58,
      key: '#FFE0C2',
      keyIntensity: 2.85,
      rim: '#F29A58',
      rimIntensity: 2.15,
      fill: '#9CB0C4',
      fillIntensity: 0.64,
    },
  },
  porcelain: {
    id: 'porcelain',
    name: 'Молочный фарфор',
    swatch: '#EDE4D6',
    primary: {
      color: '#F2EAE0',
      roughness: 0.42,
      metalness: 0.02,
      clearcoat: 0.56,
      clearcoatRoughness: 0.28,
      bumpScale: 0.008,
    },
    secondary: {
      color: '#EAE0D2',
      roughness: 0.36,
      metalness: 0.02,
      clearcoat: 0.6,
      clearcoatRoughness: 0.24,
      bumpScale: 0.006,
    },
    collar: {
      color: '#CFA17A',
      roughness: 0.26,
      metalness: 0.86,
    },
    lights: {
      ambient: '#46403A',
      ambientIntensity: 0.78,
      key: '#FFF7EC',
      keyIntensity: 2.95,
      rim: '#F4EDE4',
      rimIntensity: 2.25,
      fill: '#C9D3DC',
      fillIntensity: 0.85,
    },
  },
  copper: {
    id: 'copper',
    name: 'Медная печь',
    swatch: '#C96D37',
    primary: {
      color: '#DC854D',
      roughness: 0.36,
      metalness: 0.34,
      clearcoat: 0.74,
      clearcoatRoughness: 0.2,
      bumpScale: 0.015,
    },
    secondary: {
      color: '#D89668',
      roughness: 0.36,
      metalness: 0.26,
      clearcoat: 0.65,
      clearcoatRoughness: 0.22,
      bumpScale: 0.01,
    },
    collar: {
      color: '#EAA062',
      roughness: 0.22,
      metalness: 0.94,
    },
    lights: {
      ambient: '#3A2117',
      ambientIntensity: 0.6,
      key: '#FFD4A8',
      keyIntensity: 3.15,
      rim: '#FF9A4C',
      rimIntensity: 2.55,
      fill: '#9C8A98',
      fillIntensity: 0.56,
    },
  },
};

const BUTTON_SPECS = [
  { key: 'btn0', radius: 0.195, holes: 4, color: '#D69F78', depthTone: 1.0 },
  { key: 'btn1', radius: 0.185, holes: 2, color: '#D8CCBD', depthTone: 1.0 },
  { key: 'btn2', radius: 0.195, holes: 4, color: '#C87846', depthTone: 1.0 },
  { key: 'btn3', radius: 0.18,  holes: 2, color: '#B4886E', depthTone: 1.0 },
  { key: 'btn4', radius: 0.165, holes: 4, color: '#DFD2C2', depthTone: 0.92 },
  { key: 'btn5', radius: 0.165, holes: 2, color: '#C4845C', depthTone: 0.92 },
  { key: 'btn6', radius: 0.145, holes: 2, color: '#A98A77', depthTone: 0.84 },
  { key: 'btn7', radius: 0.145, holes: 4, color: '#CEB69E', depthTone: 0.84 },
];

// 1. Amphora (LatheGeometry, 104 segments) standing flush at y = -1.00 on the potter's wheel
function buildAmphoraGeometry() {
  const controlPts = [
    new THREE.Vector2(0.0, -1.0),
    new THREE.Vector2(0.39, -1.0),
    new THREE.Vector2(0.42, -0.97),
    new THREE.Vector2(0.38, -0.91),
    new THREE.Vector2(0.46, -0.78),
    new THREE.Vector2(0.64, -0.54),
    new THREE.Vector2(0.79, -0.22),
    new THREE.Vector2(0.84, 0.08),
    new THREE.Vector2(0.8, 0.34),
    new THREE.Vector2(0.67, 0.54),
    new THREE.Vector2(0.48, 0.72),
    new THREE.Vector2(0.32, 0.84),
    new THREE.Vector2(0.28, 0.95),
    new THREE.Vector2(0.3, 1.02),
    new THREE.Vector2(0.38, 1.1),
    new THREE.Vector2(0.42, 1.14),
    new THREE.Vector2(0.4, 1.16),
    new THREE.Vector2(0.36, 1.14),
    new THREE.Vector2(0.29, 1.04),
    new THREE.Vector2(0.24, 0.88),
  ];

  const curve = new THREE.SplineCurve(controlPts);
  const rawPts = curve.getPoints(71);
  const sculptedPts = rawPts.map((pt, idx) => {
    const t = idx / (rawPts.length - 1);
    let r = pt.x;
    if (t > 0.12 && t < 0.68 && r > 0.4) {
      r += Math.sin(t * Math.PI * 16) * 0.0075;
    }
    return new THREE.Vector2(Math.min(0.84, Math.max(0, r)), Math.max(-1.0, pt.y));
  });

  const geo = new THREE.LatheGeometry(sculptedPts, 104);
  geo.computeVertexNormals();
  return geo;
}

// 2. Polished Potter's Wheel (LatheGeometry, 96 segments, beveled edge, top flush at y = -1.00)
function buildWheelGeometry() {
  const pts = [
    new THREE.Vector2(0.0, -1.18),
    new THREE.Vector2(0.24, -1.18),
    new THREE.Vector2(0.27, -1.14),
    new THREE.Vector2(0.28, -1.11),
    new THREE.Vector2(0.92, -1.11),
    new THREE.Vector2(0.99, -1.095),
    new THREE.Vector2(1.02, -1.065),
    new THREE.Vector2(1.02, -1.028),
    new THREE.Vector2(0.99, -1.006),
    new THREE.Vector2(0.95, -1.0),
    new THREE.Vector2(0.76, -1.003),
    new THREE.Vector2(0.74, -1.0),
    new THREE.Vector2(0.56, -1.003),
    new THREE.Vector2(0.54, -1.0),
    new THREE.Vector2(0.0, -1.0),
  ];
  const geo = new THREE.LatheGeometry(pts, 96);
  geo.computeVertexNormals();
  return geo;
}

// 3. Hand-thrown Mug (LatheGeometry 88 segments + planar TubeGeometry handle with zero twist)
function buildMugBodyGeometry() {
  const controlPts = [
    new THREE.Vector2(0.0, -0.34),
    new THREE.Vector2(0.22, -0.34),
    new THREE.Vector2(0.24, -0.31),
    new THREE.Vector2(0.27, -0.22),
    new THREE.Vector2(0.295, -0.04),
    new THREE.Vector2(0.29, 0.16),
    new THREE.Vector2(0.275, 0.31),
    new THREE.Vector2(0.282, 0.34),
    new THREE.Vector2(0.26, 0.345),
    new THREE.Vector2(0.242, 0.32),
    new THREE.Vector2(0.238, 0.08),
    new THREE.Vector2(0.21, -0.18),
    new THREE.Vector2(0.14, -0.27),
    new THREE.Vector2(0.0, -0.28),
  ];
  const curve = new THREE.SplineCurve(controlPts);
  const pts = curve.getPoints(48).map((p, idx, arr) => {
    const t = idx / (arr.length - 1);
    let r = p.x;
    if (t > 0.14 && t < 0.56) {
      r += Math.sin(t * Math.PI * 10) * 0.004;
    }
    return new THREE.Vector2(Math.max(0, r), p.y);
  });
  const geo = new THREE.LatheGeometry(pts, 88);
  geo.computeVertexNormals();
  return geo;
}

function buildMugHandleGeometry() {
  // Strictly planar C-curve in XY plane -> stable Frenet frames, zero twisting
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.255, 0.19, 0),
    new THREE.Vector3(0.39, 0.21, 0),
    new THREE.Vector3(0.475, 0.09, 0),
    new THREE.Vector3(0.465, -0.09, 0),
    new THREE.Vector3(0.37, -0.19, 0),
    new THREE.Vector3(0.245, -0.17, 0),
  ]);
  const geo = new THREE.TubeGeometry(curve, 48, 0.036, 20, false);
  geo.computeVertexNormals();
  return geo;
}

// 4. Artisan Wavy-Rim Plate (LatheGeometry 128 radial segments + smooth organic rim wave)
function buildWavyPlateGeometry() {
  const controlPts = [
    new THREE.Vector2(0.0, -0.075),
    new THREE.Vector2(0.28, -0.075),
    new THREE.Vector2(0.32, -0.068),
    new THREE.Vector2(0.46, -0.035),
    new THREE.Vector2(0.58, 0.025),
    new THREE.Vector2(0.615, 0.068),
    new THREE.Vector2(0.605, 0.088),
    new THREE.Vector2(0.575, 0.082),
    new THREE.Vector2(0.44, 0.015),
    new THREE.Vector2(0.26, -0.028),
    new THREE.Vector2(0.0, -0.032),
  ];
  const curve = new THREE.SplineCurve(controlPts);
  const pts = curve.getPoints(42);
  const geo = new THREE.LatheGeometry(pts, 128);

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    const theta = Math.atan2(z, x);
    const rimWeight = THREE.MathUtils.smoothstep(r, 0.34, 0.61);
    const waveY = (Math.sin(theta * 5.0) * 0.026 + Math.cos(theta * 3.0) * 0.014) * rimWeight;
    const waveR = (Math.cos(theta * 5.0) * 0.014) * rimWeight;
    const scaleR = r > 0.0001 ? (r + waveR) / r : 1.0;
    pos.setXYZ(i, x * scaleR, y + waveY, z * scaleR);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

// 5. Sculpted Tea Bowl / Piala (LatheGeometry 96 segments)
function buildPialaGeometry() {
  const controlPts = [
    new THREE.Vector2(0.0, -0.24),
    new THREE.Vector2(0.17, -0.24),
    new THREE.Vector2(0.19, -0.22),
    new THREE.Vector2(0.18, -0.17),
    new THREE.Vector2(0.27, -0.12),
    new THREE.Vector2(0.36, 0.0),
    new THREE.Vector2(0.38, 0.13),
    new THREE.Vector2(0.37, 0.22),
    new THREE.Vector2(0.35, 0.24),
    new THREE.Vector2(0.33, 0.235),
    new THREE.Vector2(0.315, 0.14),
    new THREE.Vector2(0.26, 0.0),
    new THREE.Vector2(0.16, -0.11),
    new THREE.Vector2(0.0, -0.14),
  ];
  const curve = new THREE.SplineCurve(controlPts);
  const pts = curve.getPoints(51);
  const geo = new THREE.LatheGeometry(pts, 96);
  geo.computeVertexNormals();
  return geo;
}

// 6. Beveled 3D Ceramic Button with real circular holes + recessed dish rim
function buildButtonGeometry(radius, holesCount = 4) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, radius, 0, Math.PI * 2, false);

  const holeR = radius * 0.135;
  const holeDist = radius * 0.34;
  if (holesCount === 4) {
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      const hole = new THREE.Path();
      hole.absarc(Math.cos(a) * holeDist, Math.sin(a) * holeDist, holeR, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }
  } else {
    for (let i = 0; i < 2; i++) {
      const a = i * Math.PI;
      const hole = new THREE.Path();
      hole.absarc(Math.cos(a) * holeDist, Math.sin(a) * holeDist, holeR * 1.08, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.036,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.018,
    bevelSegments: 8,
    curveSegments: 48,
  });
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

// 7. 200 3D kiln dust / ember particles with deterministic layout & cursor reaction
function buildKilnParticles(count = 200) {
  const basePos = new Float32Array(count * 3);
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const phases = new Float32Array(count);

  let seed = 91310808;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let i = 0; i < count; i++) {
    const x = (rand() - 0.5) * 12.0;
    const y = (rand() - 0.5) * 6.8;
    const z = -4.2 + rand() * 6.4;
    basePos[i * 3] = x;
    basePos[i * 3 + 1] = y;
    basePos[i * 3 + 2] = z;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    speeds[i] = 0.14 + rand() * 0.34;
    phases[i] = rand() * Math.PI * 2;
  }
  return { count, basePos, positions, speeds, phases };
}

export default function CeramicComposition({
  activeScene,
  prevScene,
  transitionTick,
  glazeKey,
  firingTemp,
  formatKey,
  wheelSpinRef,
  dragStateRef,
  pointerRef,
}) {
  const { camera, gl, size } = useThree();
  const aspect = size.width / Math.max(1, size.height);
  const isPortrait = aspect < 0.75;

  const [hoveredKey, setHoveredKey] = useState(null);
  const hoveredKeyRef = useRef(null);
  useEffect(() => {
    hoveredKeyRef.current = hoveredKey;
    if (typeof document !== 'undefined') {
      document.body.style.cursor = activeScene === 1 && hoveredKey ? 'pointer' : '';
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.cursor = '';
      }
    };
  }, [hoveredKey, activeScene]);

  // Reset hover when leaving Scene 1
  useEffect(() => {
    if (activeScene !== 1) setHoveredKey(null);
  }, [activeScene]);

  const groupRefs = useRef({});
  const particlesRef = useRef();
  const particlesMatRef = useRef();

  // Ceramic material refs
  const amphoraMatRef = useRef();
  const collarMatRef = useRef();
  const wheelMatRef = useRef();
  const mugMatRef = useRef();
  const plateMatRef = useRef();
  const pialaMatRef = useRef();
  const buttonMatRefs = useRef({});

  // Light refs
  const ambientRef = useRef();
  const keyLightRef = useRef();
  const rimLightRef = useRef();
  const fillLightRef = useRef();
  const kilnPointRef = useRef();

  // Base pose state driven DIRECTLY by GSAP (NO double lerp in useFrame!)
  const initialPose = useMemo(() => resolvePose(0, 'wheel-amphora', isPortrait), []);
  const camBase = useRef({
    x: initialPose.camera[0],
    y: initialPose.camera[1],
    z: initialPose.camera[2],
  });
  const lookBase = useRef({
    x: initialPose.lookAt[0],
    y: initialPose.lookAt[1],
    z: initialPose.lookAt[2],
  });
  const objBases = useRef(
    Object.fromEntries(
      OBJECT_KEYS.map((k) => [
        k,
        {
          x: initialPose.objects[k].pos[0],
          y: initialPose.objects[k].pos[1],
          z: initialPose.objects[k].pos[2],
          rotX: initialPose.objects[k].rot[0],
          rotY: initialPose.objects[k].rot[1],
          rotZ: initialPose.objects[k].rot[2],
        },
      ])
    )
  );

  // Transition effect proxies driven by GSAP
  const orbitProxy = useRef({ angle: 0 });
  const explodeProxy = useRef({ value: 0 });

  // Material base parameters (animated by GSAP on glaze switch, modulated live by firingTemp)
  const matBase = useRef({
    primaryRough: GLAZE_PRESETS.chamotte.primary.roughness,
    primaryClearcoat: GLAZE_PRESETS.chamotte.primary.clearcoat,
    primaryCCRough: GLAZE_PRESETS.chamotte.primary.clearcoatRoughness,
    secRough: GLAZE_PRESETS.chamotte.secondary.roughness,
    secClearcoat: GLAZE_PRESETS.chamotte.secondary.clearcoat,
    secCCRough: GLAZE_PRESETS.chamotte.secondary.clearcoatRoughness,
    rimIntensity: GLAZE_PRESETS.chamotte.lights.rimIntensity,
  });

  // Live additive state (spin, tilt, parallax, hover spring, heat smooth)
  const wheelAngleY = useRef(0.32);
  const amphoraTiltX = useRef(0);
  const vesselSpins = useRef({ mug: 0.3, plate: -0.2, piala: -0.45 });
  const parallax = useRef({ x: 0, y: 0 });
  const hoverSprings = useRef(Object.fromEntries(OBJECT_KEYS.map((k) => [k, 0])));
  const heatSmooth = useRef((firingTemp - 900) / 350);
  const firingTempRef = useRef(firingTemp);
  firingTempRef.current = firingTemp;

  const lookTargetVec = useMemo(() => new THREE.Vector3(), []);
  const tmpCamPos = useMemo(() => new THREE.Vector3(), []);
  const tmpObjPos = useMemo(() => new THREE.Vector3(), []);
  const tmpToCam = useMemo(() => new THREE.Vector3(), []);
  const emberColor = useMemo(() => new THREE.Color('#D85B24'), []);
  const hoverColor = useMemo(() => new THREE.Color('#F2A66B'), []);
  const tmpEmissive = useMemo(() => new THREE.Color(), []);

  // Build all high-poly geometries once
  const geometries = useMemo(() => {
    const buttons = {};
    const buttonRims = {};
    BUTTON_SPECS.forEach((b) => {
      buttons[b.key] = buildButtonGeometry(b.radius, b.holes);
      buttonRims[b.key] = new THREE.TorusGeometry(b.radius * 0.86, 0.013, 16, 48);
    });
    return {
      amphora: buildAmphoraGeometry(),
      collar: new THREE.TorusGeometry(0.288, 0.018, 32, 96),
      wheel: buildWheelGeometry(),
      mugBody: buildMugBodyGeometry(),
      mugHandle: buildMugHandleGeometry(),
      plate: buildWavyPlateGeometry(),
      piala: buildPialaGeometry(),
      buttons,
      buttonRims,
    };
  }, []);

  const kilnParticles = useMemo(() => buildKilnParticles(200), []);

  // 1024x1024 procedural PBR texture sets with gl.capabilities.getMaxAnisotropy()
  const maxAnisotropy = useMemo(() => gl.capabilities.getMaxAnisotropy(), [gl]);
  const textureSets = useMemo(
    () => ({
      chamotte: createGlazeTextureSet('chamotte', maxAnisotropy),
      porcelain: createGlazeTextureSet('porcelain', maxAnisotropy),
      copper: createGlazeTextureSet('copper', maxAnisotropy),
      wheel: createWheelTextureSet(maxAnisotropy),
    }),
    [maxAnisotropy]
  );

  useEffect(() => {
    return () => {
      geometries.amphora.dispose();
      geometries.collar.dispose();
      geometries.wheel.dispose();
      geometries.mugBody.dispose();
      geometries.mugHandle.dispose();
      geometries.plate.dispose();
      geometries.piala.dispose();
      Object.values(geometries.buttons).forEach((g) => g.dispose());
      Object.values(geometries.buttonRims).forEach((g) => g.dispose());
      disposeTextureSet(textureSets.chamotte);
      disposeTextureSet(textureSets.porcelain);
      disposeTextureSet(textureSets.copper);
      disposeTextureSet(textureSets.wheel);
    };
  }, [geometries, textureSets]);

  // GSAP scene & format transitions (4 distinct non-repeating 3D transitions with dir = -1 inversion)
  useEffect(() => {
    const pose = resolvePose(activeScene, formatKey, isPortrait);
    const pair = `${Math.min(prevScene, activeScene)}-${Math.max(prevScene, activeScene)}`;
    const dir = activeScene >= prevScene ? 1 : -1;
    const isSceneSwitch = prevScene !== activeScene;

    const tl = gsap.timeline({
      defaults: { duration: 0.9, ease: 'power3.inOut', overwrite: 'auto' },
    });

    // Reset tilt gently when leaving Scene 2 (Glazes)
    if (activeScene !== 2 && Math.abs(amphoraTiltX.current) > 0.001) {
      tl.to(amphoraTiltX, { current: 0, duration: 0.65, ease: 'power2.out' }, 0);
    }

    // Transition 1 <-> 2 (pair '0-1'): Split Horizontal + potter's wheel spin impulse
    if (isSceneSwitch && pair === '0-1' && wheelSpinRef?.current) {
      wheelSpinRef.current.velocity += dir * 0.24;
    }

    // Transition 2 <-> 3 (pair '1-2'): Orbital 85 deg Sweep around Y axis
    if (isSceneSwitch && pair === '1-2') {
      const sweepRad = dir * ((85 * Math.PI) / 180);
      orbitProxy.current.angle = -sweepRad;
      tl.to(
        orbitProxy.current,
        { angle: 0, duration: 0.95, ease: 'power3.inOut' },
        0
      );
    } else {
      tl.to(orbitProxy.current, { angle: 0, duration: 0.4, ease: 'power2.out' }, 0);
    }

    // Transition 3 <-> 4 (pair '2-3'): Exploded View burst (objects fan radially & reassemble)
    if (isSceneSwitch && pair === '2-3') {
      explodeProxy.current.value = 0;
      tl.to(explodeProxy.current, { value: 0.85, duration: 0.42, ease: 'power2.out' }, 0)
        .to(explodeProxy.current, { value: 0, duration: 0.52, ease: 'power3.inOut' }, 0.42);
    } else {
      tl.to(explodeProxy.current, { value: 0, duration: 0.35, ease: 'power2.out' }, 0);
    }

    // Base camera & lookAt directly driven by GSAP
    tl.to(camBase.current, { x: pose.camera[0], y: pose.camera[1], z: pose.camera[2] }, 0)
      .to(lookBase.current, { x: pose.lookAt[0], y: pose.lookAt[1], z: pose.lookAt[2] }, 0);

    // All 12 object base transforms directly driven by GSAP
    OBJECT_KEYS.forEach((k) => {
      const target = pose.objects[k];
      tl.to(
        objBases.current[k],
        {
          x: target.pos[0],
          y: target.pos[1],
          z: target.pos[2],
          rotX: target.rot[0],
          rotY: target.rot[1],
          rotZ: target.rot[2],
        },
        0
      );
    });

    return () => tl.kill();
  }, [activeScene, prevScene, transitionTick, formatKey, isPortrait, wheelSpinRef]);

  // Animate glaze preset switch smoothly over 600ms via GSAP
  useEffect(() => {
    const preset = GLAZE_PRESETS[glazeKey] || GLAZE_PRESETS.chamotte;
    const primaryTex = textureSets[glazeKey] || textureSets.chamotte;
    const secTex = glazeKey === 'copper' ? textureSets.copper : textureSets.porcelain;

    const tl = gsap.timeline({
      defaults: { duration: 0.6, ease: 'power2.inOut', overwrite: 'auto' },
    });

    tl.to(
      matBase.current,
      {
        primaryRough: preset.primary.roughness,
        primaryClearcoat: preset.primary.clearcoat,
        primaryCCRough: preset.primary.clearcoatRoughness,
        secRough: preset.secondary.roughness,
        secClearcoat: preset.secondary.clearcoat,
        secCCRough: preset.secondary.clearcoatRoughness,
        rimIntensity: preset.lights.rimIntensity,
      },
      0
    );

    const applyMat = (ref, tex, spec) => {
      if (!ref.current) return;
      const m = ref.current;
      m.map = tex.map;
      m.bumpMap = tex.bumpMap;
      m.roughnessMap = tex.roughnessMap;
      m.needsUpdate = true;
      const col = new THREE.Color(spec.color);
      tl.to(m.color, { r: col.r, g: col.g, b: col.b }, 0).to(
        m,
        { metalness: spec.metalness, bumpScale: spec.bumpScale },
        0
      );
    };

    applyMat(amphoraMatRef, primaryTex, preset.primary);
    applyMat(mugMatRef, primaryTex, preset.primary);
    applyMat(plateMatRef, secTex, preset.secondary);
    applyMat(pialaMatRef, secTex, preset.secondary);

    if (collarMatRef.current) {
      const cCol = new THREE.Color(preset.collar.color);
      tl.to(collarMatRef.current.color, { r: cCol.r, g: cCol.g, b: cCol.b }, 0).to(
        collarMatRef.current,
        { roughness: preset.collar.roughness, metalness: preset.collar.metalness },
        0
      );
    }

    const animateLight = (ref, hex, intensity) => {
      if (!ref.current) return;
      const c = new THREE.Color(hex);
      tl.to(ref.current.color, { r: c.r, g: c.g, b: c.b }, 0);
      if (intensity !== undefined) {
        tl.to(ref.current, { intensity }, 0);
      }
    };

    animateLight(ambientRef, preset.lights.ambient, preset.lights.ambientIntensity);
    animateLight(keyLightRef, preset.lights.key, preset.lights.keyIntensity);
    animateLight(rimLightRef, preset.lights.rim);
    animateLight(fillLightRef, preset.lights.fill, preset.lights.fillIntensity);

    return () => tl.kill();
  }, [glazeKey, textureSets]);

  // useFrame: pure additive rotation, breathing, inertia, hover-spring, parallax & live firing temp
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;

    // Smooth firing heat [0..1] for 900 -> 1250 C
    const targetHeat = (Math.max(900, Math.min(1250, firingTempRef.current)) - 900) / 350;
    heatSmooth.current += (targetHeat - heatSmooth.current) * Math.min(1, delta * 8.0);
    const heat = heatSmooth.current;

    // Gentle cursor parallax (small additive offset only)
    const px = pointerRef?.current?.x || 0;
    const py = pointerRef?.current?.y || 0;
    parallax.current.x += (px * 0.2 - parallax.current.x) * Math.min(1, delta * 5.2);
    parallax.current.y += (py * 0.13 - parallax.current.y) * Math.min(1, delta * 5.2);

    // Apply GSAP base camera + Orbital 85 deg Sweep + subtle cursor parallax
    const orbitA = orbitProxy.current.angle;
    const lookX = lookBase.current.x;
    const lookY = lookBase.current.y;
    const lookZ = lookBase.current.z;

    let cx = camBase.current.x + parallax.current.x;
    let cy = camBase.current.y + parallax.current.y;
    let cz = camBase.current.z;

    if (Math.abs(orbitA) > 0.0001) {
      const dx = cx - lookX;
      const dz = cz - lookZ;
      const cosA = Math.cos(orbitA);
      const sinA = Math.sin(orbitA);
      cx = lookX + dx * cosA + dz * sinA;
      cz = lookZ - dx * sinA + dz * cosA;
    }

    camera.position.set(cx, cy, cz);
    lookTargetVec.set(lookX, lookY, lookZ);
    camera.lookAt(lookTargetVec);
    tmpCamPos.set(cx, cy, cz);

    // Potter's wheel physical rotational inertia (Scene 0 spin + Scene 0<->1 impulse)
    const wheelSpin = wheelSpinRef?.current;
    if (wheelSpin) {
      wheelAngleY.current += wheelSpin.velocity;
      if (!wheelSpin.isDragging) {
        wheelSpin.velocity *= Math.pow(0.94, delta * 60);
        if (Math.abs(wheelSpin.velocity) < 0.0001) wheelSpin.velocity = 0;
      }
    }

    // Scene 2 free X/Y drag-to-rotate with inertia
    const drag = dragStateRef?.current;
    if (drag) {
      wheelAngleY.current += drag.velY;
      amphoraTiltX.current = THREE.MathUtils.clamp(
        amphoraTiltX.current + drag.velX,
        -0.62,
        0.62
      );
      if (!drag.isDragging) {
        drag.velY *= Math.pow(0.92, delta * 60);
        drag.velX *= Math.pow(0.9, delta * 60);
        if (Math.abs(drag.velY) < 0.0001) drag.velY = 0;
        if (Math.abs(drag.velX) < 0.0001) drag.velX = 0;
      }
    }

    const idleSpin = drag?.isDragging || wheelSpin?.isDragging ? 0 : 0.16;
    wheelAngleY.current += delta * idleSpin;
    vesselSpins.current.mug += delta * 0.12;
    vesselSpins.current.plate -= delta * 0.09;
    vesselSpins.current.piala -= delta * 0.18;

    // Update all 12 objects: GSAP base + Exploded View + breathing + Scene 1 hover spring
    const explode = explodeProxy.current.value;
    const activeHover = activeScene === 1 ? hoveredKeyRef.current : null;

    OBJECT_KEYS.forEach((k, idx) => {
      const grp = groupRefs.current[k];
      if (!grp) return;

      const base = objBases.current[k];
      const ex = EXPLODE_DIRS[k];

      // Smooth spring for raycaster hover on Scene 1 (max 0.14 units toward camera -> preserves >= 0.70 clearance)
      const targetHover = activeHover === k ? 1 : 0;
      hoverSprings.current[k] += (targetHover - hoverSprings.current[k]) * Math.min(1, delta * 10);
      const hSpring = hoverSprings.current[k];

      const ox = base.x + ex[0] * explode;
      const oy = base.y + ex[1] * explode + Math.sin(t * (0.85 + (idx % 4) * 0.15) + idx * 0.9) * 0.032;
      const oz = base.z + ex[2] * explode;

      tmpObjPos.set(ox, oy, oz);
      if (hSpring > 0.001) {
        tmpToCam.copy(tmpCamPos).sub(tmpObjPos).normalize();
        tmpObjPos.addScaledVector(tmpToCam, hSpring * 0.14);
      }
      grp.position.copy(tmpObjPos);

      if (k === 'amphoraWheel') {
        grp.rotation.set(
          base.rotX + amphoraTiltX.current + parallax.current.y * 0.1,
          wheelAngleY.current,
          base.rotZ - parallax.current.x * 0.07
        );
      } else if (k === 'mug') {
        grp.rotation.set(base.rotX + hSpring * 0.08, base.rotY + vesselSpins.current.mug, base.rotZ);
      } else if (k === 'plate') {
        grp.rotation.set(base.rotX + hSpring * 0.1, base.rotY + vesselSpins.current.plate, base.rotZ);
      } else if (k === 'piala') {
        grp.rotation.set(base.rotX + hSpring * 0.08, base.rotY + vesselSpins.current.piala, base.rotZ);
      } else {
        // 8 buttons: gentle tumbling & subtle hover lift rotation
        const btnSpeed = 0.22 + (idx % 3) * 0.08;
        grp.rotation.set(
          base.rotX + Math.sin(t * btnSpeed + idx) * 0.14 + hSpring * 0.25,
          base.rotY + t * (idx % 2 === 0 ? 0.18 : -0.16),
          base.rotZ + Math.cos(t * btnSpeed + idx) * 0.1
        );
      }
    });

    // Live firing temperature (900 -> 1250 C) + hover warm glow on ceramic materials
    const mb = matBase.current;
    const pRough = THREE.MathUtils.clamp(mb.primaryRough - heat * 0.28, 0.14, 0.92);
    const pCC = THREE.MathUtils.clamp(mb.primaryClearcoat + heat * 0.34, 0.08, 0.96);
    const pCCR = THREE.MathUtils.clamp(mb.primaryCCRough - heat * 0.24, 0.08, 0.72);

    const sRough = THREE.MathUtils.clamp(mb.secRough - heat * 0.2, 0.12, 0.85);
    const sCC = THREE.MathUtils.clamp(mb.secClearcoat + heat * 0.26, 0.12, 0.96);
    const sCCR = THREE.MathUtils.clamp(mb.secCCRough - heat * 0.16, 0.08, 0.65);

    const updateCeramicMat = (mat, rough, cc, ccr, objKey) => {
      if (!mat) return;
      const h = hoverSprings.current[objKey] || 0;
      mat.roughness = rough;
      mat.clearcoat = cc;
      mat.clearcoatRoughness = ccr;
      tmpEmissive.copy(emberColor).lerp(hoverColor, h);
      mat.emissive.copy(tmpEmissive);
      mat.emissiveIntensity = heat * 0.26 + h * 0.24;
    };

    updateCeramicMat(amphoraMatRef.current, pRough, pCC, pCCR, 'amphoraWheel');
    updateCeramicMat(mugMatRef.current, pRough, pCC, pCCR, 'mug');
    updateCeramicMat(plateMatRef.current, sRough, sCC, sCCR, 'plate');
    updateCeramicMat(pialaMatRef.current, sRough, sCC, sCCR, 'piala');

    BUTTON_SPECS.forEach((b) => {
      const bm = buttonMatRefs.current[b.key];
      if (!bm) return;
      const h = hoverSprings.current[b.key] || 0;
      bm.roughness = THREE.MathUtils.clamp(0.48 - heat * 0.12, 0.28, 0.78);
      bm.clearcoat = THREE.MathUtils.clamp(0.36 + heat * 0.16, 0.18, 0.54);
      bm.clearcoatRoughness = THREE.MathUtils.clamp(0.34 - heat * 0.1, 0.18, 0.55);
      tmpEmissive.copy(emberColor).lerp(hoverColor, h);
      bm.emissive.copy(tmpEmissive);
      bm.emissiveIntensity = heat * 0.1 + h * 0.24;
    });

    if (rimLightRef.current) {
      rimLightRef.current.intensity = mb.rimIntensity + heat * 1.15;
    }
    if (kilnPointRef.current) {
      kilnPointRef.current.intensity = 0.55 + heat * 2.35;
    }

    // 200 3D dust/ember particles with gentle rising drift & smooth cursor reaction
    if (particlesRef.current) {
      const posAttr = particlesRef.current.geometry.attributes.position;
      const arr = posAttr.array;
      const base = kilnParticles.basePos;
      const speeds = kilnParticles.speeds;
      const phases = kilnParticles.phases;
      const curWorldX = px * 4.2;
      const curWorldY = py * 2.6;

      for (let i = 0; i < kilnParticles.count; i++) {
        const i3 = i * 3;
        base[i3 + 1] += delta * speeds[i] * (0.28 + heat * 0.32);
        if (base[i3 + 1] > 3.5) {
          base[i3 + 1] = -3.4;
        }

        const driftX = Math.sin(t * 0.5 + phases[i]) * 0.14;
        const driftZ = Math.cos(t * 0.42 + phases[i]) * 0.1;
        let tx = base[i3] + driftX;
        let ty = base[i3 + 1];
        const tz = base[i3 + 2] + driftZ;

        // Smooth cursor swirl/repulsion
        const dx = tx - curWorldX;
        const dy = ty - curWorldY;
        const dSq = dx * dx + dy * dy;
        if (dSq < 3.6 && dSq > 0.0001) {
          const force = (1.0 - dSq / 3.6) * 0.48;
          const invD = 1.0 / Math.sqrt(dSq);
          tx += (dx * invD - dy * invD * 0.35) * force;
          ty += (dy * invD + dx * invD * 0.35) * force;
        }

        arr[i3] += (tx - arr[i3]) * Math.min(1, delta * 5.0);
        arr[i3 + 1] += (ty - arr[i3 + 1]) * Math.min(1, delta * 5.0);
        arr[i3 + 2] += (tz - arr[i3 + 2]) * Math.min(1, delta * 5.0);
      }
      posAttr.needsUpdate = true;
    }

    if (particlesMatRef.current) {
      particlesMatRef.current.opacity = 0.38 + heat * 0.28;
    }
  });

  const makeHoverHandlers = (objKey) => ({
    onPointerOver: (e) => {
      if (activeScene !== 1) return;
      e.stopPropagation();
      setHoveredKey(objKey);
    },
    onPointerOut: (e) => {
      if (activeScene !== 1) return;
      e.stopPropagation();
      setHoveredKey((prev) => (prev === objKey ? null : prev));
    },
  });

  const initialPreset = GLAZE_PRESETS.chamotte;

  return (
    <>
      <ambientLight
        ref={ambientRef}
        color={initialPreset.lights.ambient}
        intensity={initialPreset.lights.ambientIntensity}
      />
      <directionalLight
        ref={keyLightRef}
        position={[4.4, 5.6, 4.8]}
        color={initialPreset.lights.key}
        intensity={initialPreset.lights.keyIntensity}
      />
      <directionalLight
        ref={rimLightRef}
        position={[-4.8, 2.6, -3.4]}
        color={initialPreset.lights.rim}
        intensity={initialPreset.lights.rimIntensity}
      />
      <directionalLight
        ref={fillLightRef}
        position={[-2.4, -2.8, 3.6]}
        color={initialPreset.lights.fill}
        intensity={initialPreset.lights.fillIntensity}
      />
      <pointLight
        ref={kilnPointRef}
        position={[0.0, -1.8, 1.4]}
        color="#FF7F3F"
        intensity={0.75}
        distance={12}
        decay={2}
      />

      {/* 1. Unified Amphora + Polished Potter's Wheel Node */}
      <group
        ref={(el) => {
          groupRefs.current.amphoraWheel = el;
        }}
        name="apokrif-amphora-wheel"
        {...makeHoverHandlers('amphoraWheel')}
      >
        <mesh geometry={geometries.amphora}>
          <meshPhysicalMaterial
            ref={amphoraMatRef}
            map={textureSets.chamotte.map}
            bumpMap={textureSets.chamotte.bumpMap}
            roughnessMap={textureSets.chamotte.roughnessMap}
            color={initialPreset.primary.color}
            roughness={initialPreset.primary.roughness}
            metalness={initialPreset.primary.metalness}
            clearcoat={initialPreset.primary.clearcoat}
            clearcoatRoughness={initialPreset.primary.clearcoatRoughness}
            bumpScale={initialPreset.primary.bumpScale}
            emissive="#D85B24"
            emissiveIntensity={0}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh
          geometry={geometries.collar}
          position={[0, 0.94, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial
            ref={collarMatRef}
            color={initialPreset.collar.color}
            roughness={initialPreset.collar.roughness}
            metalness={initialPreset.collar.metalness}
          />
        </mesh>

        <mesh geometry={geometries.wheel}>
          <meshStandardMaterial
            ref={wheelMatRef}
            map={textureSets.wheel.map}
            bumpMap={textureSets.wheel.bumpMap}
            roughnessMap={textureSets.wheel.roughnessMap}
            color="#9C9084"
            roughness={0.34}
            metalness={0.78}
            bumpScale={0.014}
          />
        </mesh>
      </group>

      {/* 2. Hand-Thrown Mug with Organic TubeGeometry Handle */}
      <group
        ref={(el) => {
          groupRefs.current.mug = el;
        }}
        name="apokrif-mug"
        {...makeHoverHandlers('mug')}
      >
        <mesh geometry={geometries.mugBody}>
          <meshPhysicalMaterial
            ref={mugMatRef}
            map={textureSets.chamotte.map}
            bumpMap={textureSets.chamotte.bumpMap}
            roughnessMap={textureSets.chamotte.roughnessMap}
            color={initialPreset.primary.color}
            roughness={initialPreset.primary.roughness}
            metalness={initialPreset.primary.metalness}
            clearcoat={initialPreset.primary.clearcoat}
            clearcoatRoughness={initialPreset.primary.clearcoatRoughness}
            bumpScale={initialPreset.primary.bumpScale}
            emissive="#D85B24"
            emissiveIntensity={0}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh geometry={geometries.mugHandle}>
          <meshPhysicalMaterial
            map={textureSets.chamotte.map}
            bumpMap={textureSets.chamotte.bumpMap}
            roughnessMap={textureSets.chamotte.roughnessMap}
            color={initialPreset.primary.color}
            roughness={0.62}
            metalness={0.05}
            clearcoat={0.28}
            clearcoatRoughness={0.38}
            bumpScale={0.014}
          />
        </mesh>
      </group>

      {/* 3. Artisan Wavy-Rim Plate */}
      <group
        ref={(el) => {
          groupRefs.current.plate = el;
        }}
        name="apokrif-wavy-plate"
        {...makeHoverHandlers('plate')}
      >
        <mesh geometry={geometries.plate}>
          <meshPhysicalMaterial
            ref={plateMatRef}
            map={textureSets.porcelain.map}
            bumpMap={textureSets.porcelain.bumpMap}
            roughnessMap={textureSets.porcelain.roughnessMap}
            color={initialPreset.secondary.color}
            roughness={initialPreset.secondary.roughness}
            metalness={initialPreset.secondary.metalness}
            clearcoat={initialPreset.secondary.clearcoat}
            clearcoatRoughness={initialPreset.secondary.clearcoatRoughness}
            bumpScale={initialPreset.secondary.bumpScale}
            emissive="#D85B24"
            emissiveIntensity={0}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 4. Sculpted Tea Bowl / Piala */}
      <group
        ref={(el) => {
          groupRefs.current.piala = el;
        }}
        name="apokrif-piala"
        {...makeHoverHandlers('piala')}
      >
        <mesh geometry={geometries.piala}>
          <meshPhysicalMaterial
            ref={pialaMatRef}
            map={textureSets.porcelain.map}
            bumpMap={textureSets.porcelain.bumpMap}
            roughnessMap={textureSets.porcelain.roughnessMap}
            color={initialPreset.secondary.color}
            roughness={initialPreset.secondary.roughness}
            metalness={initialPreset.secondary.metalness}
            clearcoat={initialPreset.secondary.clearcoat}
            clearcoatRoughness={initialPreset.secondary.clearcoatRoughness}
            bumpScale={initialPreset.secondary.bumpScale}
            emissive="#D85B24"
            emissiveIntensity={0}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 5–12. Eight Floating Beveled Ceramic Buttons with Real Holes at Varied Z-Depths */}
      {BUTTON_SPECS.map((b) => (
        <group
          key={b.key}
          ref={(el) => {
            groupRefs.current[b.key] = el;
          }}
          name={`apokrif-${b.key}`}
          {...makeHoverHandlers(b.key)}
        >
          <mesh geometry={geometries.buttons[b.key]}>
            <meshPhysicalMaterial
              ref={(el) => {
                buttonMatRefs.current[b.key] = el;
              }}
              map={textureSets.porcelain.map}
              bumpMap={textureSets.porcelain.bumpMap}
              roughnessMap={textureSets.porcelain.roughnessMap}
              color={b.color}
              roughness={0.42}
              metalness={0.08}
              clearcoat={0.5}
              clearcoatRoughness={0.28}
              bumpScale={0.008}
              emissive="#D85B24"
              emissiveIntensity={0}
            />
          </mesh>
          <mesh geometry={geometries.buttonRims[b.key]} position={[0, 0, 0.032]}>
            <meshStandardMaterial color={b.color} roughness={0.38} metalness={0.12} />
          </mesh>
          <mesh geometry={geometries.buttonRims[b.key]} position={[0, 0, -0.032]}>
            <meshStandardMaterial color={b.color} roughness={0.38} metalness={0.12} />
          </mesh>
        </group>
      ))}

      {/* 200 3D Kiln Dust / Ember Particles */}
      <points ref={particlesRef} name="kiln-particles">
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={kilnParticles.count}
            array={kilnParticles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={particlesMatRef}
          color="#EAA973"
          size={0.028}
          sizeAttenuation
          transparent
          opacity={0.42}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}
