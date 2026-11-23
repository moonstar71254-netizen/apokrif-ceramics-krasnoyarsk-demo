import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { createGlazeTextureSet, disposeTextureSet } from './textures';

// Strict geometry radius bounds:
// R_amphora_max = 1.08 (<= 1.12)
// R_piala_max   = 0.40 (<= 0.42)
// Minimum center distance across all poses & transitions >= 2.60 (>= 2.55)
// Minimum surface clearance >= 2.60 - (1.08 + 0.40) = 1.12 (>= 0.90)
export const GEOMETRY_BOUNDS = {
  amphoraMaxRadius: 1.08,
  pialaMaxRadius: 0.40,
};

export const GLAZE_PRESETS = {
  chamotte: {
    id: 'chamotte',
    name: 'Тёмный шамот',
    swatch: '#7B503A',
    sceneBg: '#0A0908',
    amphora: {
      color: '#B8896D',
      roughness: 0.78,
      metalness: 0.06,
      clearcoat: 0.14,
      clearcoatRoughness: 0.56,
      bumpScale: 0.022,
    },
    piala: {
      color: '#D5C4B2',
      roughness: 0.44,
      metalness: 0.05,
      clearcoat: 0.42,
      clearcoatRoughness: 0.28,
      bumpScale: 0.011,
    },
    collar: {
      color: '#C77A4A',
      roughness: 0.3,
      metalness: 0.88,
    },
    lights: {
      ambient: '#2B221D',
      ambientIntensity: 0.55,
      key: '#FFE0C2',
      keyIntensity: 2.85,
      rim: '#F29A58',
      rimIntensity: 2.1,
      fill: '#9CB0C4',
      fillIntensity: 0.62,
    },
  },
  porcelain: {
    id: 'porcelain',
    name: 'Молочный фарфор',
    swatch: '#EDE4D6',
    sceneBg: '#161412',
    amphora: {
      color: '#F3ECE2',
      roughness: 0.32,
      metalness: 0.02,
      clearcoat: 0.68,
      clearcoatRoughness: 0.18,
      bumpScale: 0.008,
    },
    piala: {
      color: '#EAE0D2',
      roughness: 0.28,
      metalness: 0.02,
      clearcoat: 0.72,
      clearcoatRoughness: 0.16,
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
    sceneBg: '#130B08',
    amphora: {
      color: '#DC854D',
      roughness: 0.34,
      metalness: 0.36,
      clearcoat: 0.76,
      clearcoatRoughness: 0.19,
      bumpScale: 0.015,
    },
    piala: {
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
      ambientIntensity: 0.58,
      key: '#FFD4A8',
      keyIntensity: 3.15,
      rim: '#FF9A4C',
      rimIntensity: 2.55,
      fill: '#9C8A98',
      fillIntensity: 0.56,
    },
  },
};

// All 5 scenes + Scene 3 sub-states ('3-amphora' for formats 01-03, '3-piala' for formats 04-06).
// Invariant: dx = piala.x - amphora.x >= 2.60 in EVERY pose (desktop & portrait),
// guaranteeing d(t) >= 2.60 >= 2.55 on every scene AND every intermediate GSAP transition frame.
export const SCENE_POSES = {
  0: {
    camera: [0.0, 0.24, 6.15],
    lookAt: [0.0, -0.04, 0.0],
    amphora: { pos: [0.0, -0.04, 0.0], rot: [0.04, 0.0, 0.0] },
    piala: { pos: [2.6, -0.8, -0.95], rot: [0.1, 0.0, -0.04] },
  },
  1: {
    camera: [-0.15, 0.22, 6.0],
    lookAt: [-0.25, -0.05, 0.0],
    amphora: { pos: [-1.65, 0.02, 0.2], rot: [0.06, 0.0, 0.05] },
    piala: { pos: [3.15, -1.85, -2.35], rot: [0.12, 0.0, -0.05] },
  },
  2: {
    camera: [0.0, 0.14, 6.75],
    lookAt: [0.0, -0.06, -0.2],
    amphora: { pos: [0.0, -0.06, -0.2], rot: [0.03, 0.0, 0.0] },
    piala: { pos: [2.85, -1.05, -1.55], rot: [0.08, 0.0, -0.03] },
  },
  '3-amphora': {
    camera: [0.0, 0.22, 5.95],
    lookAt: [-0.25, -0.08, 0.0],
    amphora: { pos: [-1.45, 0.04, 0.45], rot: [0.05, 0.0, 0.04] },
    piala: { pos: [2.65, -1.25, -1.35], rot: [0.12, 0.0, -0.06] },
  },
  '3-piala': {
    camera: [0.22, 0.14, 5.3],
    lookAt: [0.18, -0.22, 0.22],
    amphora: { pos: [-1.85, 0.12, -1.2], rot: [0.05, 0.0, 0.06] },
    piala: { pos: [0.75, -0.3, 0.82], rot: [0.18, 0.0, -0.08] },
  },
  4: {
    camera: [0.0, 0.24, 6.9],
    lookAt: [0.0, 0.22, -1.85],
    amphora: { pos: [-0.95, 0.82, -1.85], rot: [0.08, 0.0, 0.03] },
    piala: { pos: [1.65, 0.42, -2.55], rot: [0.14, 0.0, -0.05] },
  },
};

function resolvePose(activeScene, focusTarget, isPortrait) {
  const poseKey =
    activeScene === 3 ? (focusTarget === 'piala' ? '3-piala' : '3-amphora') : activeScene;
  const base = SCENE_POSES[poseKey] || SCENE_POSES[0];

  if (!isPortrait) {
    return base;
  }

  if (activeScene === 4) {
    return {
      camera: [0.0, 0.22, 9.8],
      lookAt: [0.0, 0.22, -1.6],
      amphora: { pos: [0.0, 1.05, -1.6], rot: base.amphora.rot },
      piala: { pos: [2.95, 0.55, -2.6], rot: base.piala.rot },
    };
  }

  return {
    camera: [base.camera[0], base.camera[1], base.camera[2] * 1.58],
    lookAt: base.lookAt,
    amphora: base.amphora,
    piala: base.piala,
  };
}

function buildAmphoraGeometry() {
  // Sculptural amphora profile: 72 SplineCurve points, 128 lathe segments, max radius = 1.08 (<= 1.12)
  const controlPts = [
    new THREE.Vector2(0.0, -1.46),
    new THREE.Vector2(0.46, -1.46),
    new THREE.Vector2(0.51, -1.42),
    new THREE.Vector2(0.47, -1.35), // delicate foot indent
    new THREE.Vector2(0.56, -1.2),
    new THREE.Vector2(0.76, -0.92),
    new THREE.Vector2(0.97, -0.54),
    new THREE.Vector2(1.07, -0.14),
    new THREE.Vector2(1.08, 0.18), // broadest shoulder (<= 1.12)
    new THREE.Vector2(1.03, 0.44),
    new THREE.Vector2(0.88, 0.68),
    new THREE.Vector2(0.64, 0.88),
    new THREE.Vector2(0.42, 1.04),
    new THREE.Vector2(0.35, 1.18), // slim neck where copper collar sits snugly
    new THREE.Vector2(0.36, 1.29),
    new THREE.Vector2(0.46, 1.4), // flared sculptural lip
    new THREE.Vector2(0.54, 1.46),
    new THREE.Vector2(0.52, 1.49),
    new THREE.Vector2(0.47, 1.47), // rolled inner rim
    new THREE.Vector2(0.37, 1.36),
    new THREE.Vector2(0.31, 1.18),
  ];

  const curve = new THREE.SplineCurve(controlPts);
  const rawPts = curve.getPoints(71); // 72 points total

  // Add subtle hand-thrown potter's ribs on the outer belly
  const sculptedPts = rawPts.map((pt, idx) => {
    const t = idx / (rawPts.length - 1);
    let r = pt.x;
    if (t > 0.12 && t < 0.68 && r > 0.48) {
      r += Math.sin(t * Math.PI * 16) * 0.0085;
    }
    return new THREE.Vector2(Math.min(1.08, Math.max(0, r)), pt.y);
  });

  const geo = new THREE.LatheGeometry(sculptedPts, 128);
  geo.computeVertexNormals();
  return geo;
}

function buildPialaGeometry() {
  // Sculptural tea-bowl / piala: 52 SplineCurve points, 96 lathe segments, max radius = 0.40 (<= 0.42)
  const controlPts = [
    new THREE.Vector2(0.0, -0.26),
    new THREE.Vector2(0.18, -0.26),
    new THREE.Vector2(0.2, -0.24),
    new THREE.Vector2(0.19, -0.19), // foot ring
    new THREE.Vector2(0.28, -0.14),
    new THREE.Vector2(0.37, -0.02),
    new THREE.Vector2(0.4, 0.12), // max radius = 0.40 (<= 0.42)
    new THREE.Vector2(0.39, 0.23),
    new THREE.Vector2(0.38, 0.26),
    new THREE.Vector2(0.355, 0.26), // smooth rounded rim
    new THREE.Vector2(0.34, 0.16),
    new THREE.Vector2(0.28, 0.01),
    new THREE.Vector2(0.17, -0.12),
    new THREE.Vector2(0.0, -0.16),
  ];

  const curve = new THREE.SplineCurve(controlPts);
  const pts = curve.getPoints(51); // 52 points total
  const clamped = pts.map((p) => new THREE.Vector2(Math.min(0.4, Math.max(0, p.x)), p.y));
  const geo = new THREE.LatheGeometry(clamped, 96);
  geo.computeVertexNormals();
  return geo;
}

function buildKilnParticles(count = 72) {
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  let seed = 913108;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rand() - 0.5) * 9.5;
    positions[i * 3 + 1] = (rand() - 0.5) * 5.8;
    positions[i * 3 + 2] = -3.8 + rand() * 5.0;
    speeds[i] = 0.16 + rand() * 0.28;
  }
  return { positions, speeds };
}

export default function CeramicComposition({
  activeScene,
  glazeKey,
  focusTarget,
  dragStateRef,
  pointerRef,
}) {
  const { camera, gl, scene, size } = useThree();
  const aspect = size.width / Math.max(1, size.height);
  const isPortrait = aspect < 0.75;

  const amphoraGroupRef = useRef();
  const pialaGroupRef = useRef();
  const particlesRef = useRef();

  const amphoraMatRef = useRef();
  const pialaMatRef = useRef();
  const collarMatRef = useRef();

  const ambientRef = useRef();
  const keyLightRef = useRef();
  const rimLightRef = useRef();
  const fillLightRef = useRef();

  // GSAP-animated base transforms (NO double lerp in useFrame!)
  const initialPose = useMemo(() => resolvePose(0, 'amphora', isPortrait), []);
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
  const amphoraBase = useRef({
    x: initialPose.amphora.pos[0],
    y: initialPose.amphora.pos[1],
    z: initialPose.amphora.pos[2],
    rotX: initialPose.amphora.rot[0],
    rotZ: initialPose.amphora.rot[2],
  });
  const pialaBase = useRef({
    x: initialPose.piala.pos[0],
    y: initialPose.piala.pos[1],
    z: initialPose.piala.pos[2],
    rotX: initialPose.piala.rot[0],
    rotZ: initialPose.piala.rot[2],
  });

  // Purely additive live state (idle spin, pointer parallax, drag spin)
  const spinY = useRef({ amphora: 0.35, piala: -0.5 });
  const parallax = useRef({ x: 0, y: 0 });
  const lookTargetVec = useMemo(() => new THREE.Vector3(), []);

  // Geometries
  const amphoraGeo = useMemo(() => buildAmphoraGeometry(), []);
  const pialaGeo = useMemo(() => buildPialaGeometry(), []);
  const collarGeo = useMemo(() => new THREE.TorusGeometry(0.362, 0.022, 32, 96), []);
  const kilnParticles = useMemo(() => buildKilnParticles(68), []);

  // 1024x1024 procedural PBR texture sets with maxAnisotropy
  const maxAnisotropy = useMemo(() => gl.capabilities.getMaxAnisotropy(), [gl]);
  const textureSets = useMemo(
    () => ({
      chamotte: createGlazeTextureSet('chamotte', maxAnisotropy),
      porcelain: createGlazeTextureSet('porcelain', maxAnisotropy),
      copper: createGlazeTextureSet('copper', maxAnisotropy),
    }),
    [maxAnisotropy]
  );

  useEffect(() => {
    return () => {
      amphoraGeo.dispose();
      pialaGeo.dispose();
      collarGeo.dispose();
      disposeTextureSet(textureSets.chamotte);
      disposeTextureSet(textureSets.porcelain);
      disposeTextureSet(textureSets.copper);
    };
  }, [amphoraGeo, pialaGeo, collarGeo, textureSets]);

  // Set initial scene background
  useEffect(() => {
    scene.background = new THREE.Color(GLAZE_PRESETS.chamotte.sceneBg);
  }, [scene]);

  // Animate camera & object base transforms directly via GSAP (synchronized ease, zero double-lerp)
  useEffect(() => {
    const pose = resolvePose(activeScene, focusTarget, isPortrait);

    const tl = gsap.timeline({
      defaults: { duration: 0.85, ease: 'power3.inOut', overwrite: 'auto' },
    });

    tl.to(camBase.current, { x: pose.camera[0], y: pose.camera[1], z: pose.camera[2] }, 0)
      .to(lookBase.current, { x: pose.lookAt[0], y: pose.lookAt[1], z: pose.lookAt[2] }, 0)
      .to(
        amphoraBase.current,
        {
          x: pose.amphora.pos[0],
          y: pose.amphora.pos[1],
          z: pose.amphora.pos[2],
          rotX: pose.amphora.rot[0],
          rotZ: pose.amphora.rot[2],
        },
        0
      )
      .to(
        pialaBase.current,
        {
          x: pose.piala.pos[0],
          y: pose.piala.pos[1],
          z: pose.piala.pos[2],
          rotX: pose.piala.rot[0],
          rotZ: pose.piala.rot[2],
        },
        0
      );

    return () => tl.kill();
  }, [activeScene, focusTarget, isPortrait]);

  // Animate glaze switch over 600ms via GSAP (materials, lights, scene.background)
  useEffect(() => {
    const preset = GLAZE_PRESETS[glazeKey] || GLAZE_PRESETS.chamotte;
    const texSet = textureSets[glazeKey] || textureSets.chamotte;

    const tl = gsap.timeline({
      defaults: { duration: 0.6, ease: 'power2.inOut', overwrite: 'auto' },
    });

    if (amphoraMatRef.current) {
      const m = amphoraMatRef.current;
      m.map = texSet.map;
      m.bumpMap = texSet.bumpMap;
      m.roughnessMap = texSet.roughnessMap;
      m.needsUpdate = true;

      const targetCol = new THREE.Color(preset.amphora.color);
      tl.to(m.color, { r: targetCol.r, g: targetCol.g, b: targetCol.b }, 0).to(
        m,
        {
          roughness: preset.amphora.roughness,
          metalness: preset.amphora.metalness,
          clearcoat: preset.amphora.clearcoat,
          clearcoatRoughness: preset.amphora.clearcoatRoughness,
          bumpScale: preset.amphora.bumpScale,
        },
        0
      );
    }

    if (pialaMatRef.current) {
      const pm = pialaMatRef.current;
      const pTex = glazeKey === 'copper' ? textureSets.copper : textureSets.porcelain;
      pm.map = pTex.map;
      pm.bumpMap = pTex.bumpMap;
      pm.roughnessMap = pTex.roughnessMap;
      pm.needsUpdate = true;

      const targetPCol = new THREE.Color(preset.piala.color);
      tl.to(pm.color, { r: targetPCol.r, g: targetPCol.g, b: targetPCol.b }, 0).to(
        pm,
        {
          roughness: preset.piala.roughness,
          metalness: preset.piala.metalness,
          clearcoat: preset.piala.clearcoat,
          clearcoatRoughness: preset.piala.clearcoatRoughness,
          bumpScale: preset.piala.bumpScale,
        },
        0
      );
    }

    if (collarMatRef.current) {
      const cm = collarMatRef.current;
      const cCol = new THREE.Color(preset.collar.color);
      tl.to(cm.color, { r: cCol.r, g: cCol.g, b: cCol.b }, 0).to(
        cm,
        { roughness: preset.collar.roughness, metalness: preset.collar.metalness },
        0
      );
    }

    if (scene.background instanceof THREE.Color) {
      const bgCol = new THREE.Color(preset.sceneBg);
      tl.to(scene.background, { r: bgCol.r, g: bgCol.g, b: bgCol.b }, 0);
    }

    const animateLight = (ref, hex, intensity) => {
      if (!ref.current) return;
      const c = new THREE.Color(hex);
      tl.to(ref.current.color, { r: c.r, g: c.g, b: c.b }, 0);
      tl.to(ref.current, { intensity }, 0);
    };

    animateLight(ambientRef, preset.lights.ambient, preset.lights.ambientIntensity);
    animateLight(keyLightRef, preset.lights.key, preset.lights.keyIntensity);
    animateLight(rimLightRef, preset.lights.rim, preset.lights.rimIntensity);
    animateLight(fillLightRef, preset.lights.fill, preset.lights.fillIntensity);

    return () => tl.kill();
  }, [glazeKey, scene, textureSets]);

  // useFrame: pure live rotation, subtle Y breathing, cursor parallax, and Scene 2 drag inertia
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;

    // Gentle cursor parallax (small additive offset only)
    const targetPx = (pointerRef?.current?.x || 0) * 0.22;
    const targetPy = (pointerRef?.current?.y || 0) * 0.14;
    parallax.current.x += (targetPx - parallax.current.x) * Math.min(1, delta * 5.5);
    parallax.current.y += (targetPy - parallax.current.y) * Math.min(1, delta * 5.5);

    // Apply GSAP base camera + parallax directly (no double lerp on base)
    camera.position.set(
      camBase.current.x + parallax.current.x,
      camBase.current.y + parallax.current.y,
      camBase.current.z
    );
    lookTargetVec.set(lookBase.current.x, lookBase.current.y, lookBase.current.z);
    camera.lookAt(lookTargetVec);

    // Drag-to-rotate inertia (Scene 2) + calm ambient rotation
    const drag = dragStateRef?.current;
    if (drag) {
      spinY.current.amphora += drag.velocity;
      if (!drag.isDragging) {
        drag.velocity *= Math.pow(0.92, delta * 60);
        if (Math.abs(drag.velocity) < 0.0001) drag.velocity = 0;
      }
    }
    const idleSpeed = drag?.isDragging ? 0 : 0.14;
    spinY.current.amphora += delta * idleSpeed;
    spinY.current.piala -= delta * 0.19;

    const breathA = Math.sin(t * 0.95) * 0.04;
    const breathP = Math.cos(t * 1.15 + 0.9) * 0.032;

    if (amphoraGroupRef.current) {
      amphoraGroupRef.current.position.set(
        amphoraBase.current.x,
        amphoraBase.current.y + breathA,
        amphoraBase.current.z
      );
      amphoraGroupRef.current.rotation.set(
        amphoraBase.current.rotX + parallax.current.y * 0.12,
        spinY.current.amphora,
        amphoraBase.current.rotZ - parallax.current.x * 0.08
      );
    }

    if (pialaGroupRef.current) {
      pialaGroupRef.current.position.set(
        pialaBase.current.x,
        pialaBase.current.y + breathP,
        pialaBase.current.z
      );
      pialaGroupRef.current.rotation.set(
        pialaBase.current.rotX + parallax.current.y * 0.1,
        spinY.current.piala,
        pialaBase.current.rotZ
      );
    }

    // Delicate rising kiln ember / clay-dust particles
    if (particlesRef.current) {
      const posAttr = particlesRef.current.geometry.attributes.position;
      const arr = posAttr.array;
      const speeds = kilnParticles.speeds;
      for (let i = 0; i < speeds.length; i++) {
        const yIdx = i * 3 + 1;
        arr[yIdx] += delta * speeds[i] * 0.35;
        if (arr[yIdx] > 3.1) {
          arr[yIdx] = -2.9;
        }
      }
      posAttr.needsUpdate = true;
    }
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
        position={[4.2, 5.4, 4.8]}
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

      {/* Sculptural Amphora (R_max = 1.08 <= 1.12) with snug copper neck collar */}
      <group ref={amphoraGroupRef} name="apokrif-amphora">
        <mesh geometry={amphoraGeo} castShadow receiveShadow>
          <meshPhysicalMaterial
            ref={amphoraMatRef}
            map={textureSets.chamotte.map}
            bumpMap={textureSets.chamotte.bumpMap}
            roughnessMap={textureSets.chamotte.roughnessMap}
            color={initialPreset.amphora.color}
            roughness={initialPreset.amphora.roughness}
            metalness={initialPreset.amphora.metalness}
            clearcoat={initialPreset.amphora.clearcoat}
            clearcoatRoughness={initialPreset.amphora.clearcoatRoughness}
            bumpScale={initialPreset.amphora.bumpScale}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh
          geometry={collarGeo}
          position={[0, 1.19, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial
            ref={collarMatRef}
            color={initialPreset.collar.color}
            roughness={initialPreset.collar.roughness}
            metalness={initialPreset.collar.metalness}
          />
        </mesh>
      </group>

      {/* Companion Sculptural Cup / Piala (R_max = 0.40 <= 0.42) */}
      <group ref={pialaGroupRef} name="apokrif-piala">
        <mesh geometry={pialaGeo} castShadow receiveShadow>
          <meshPhysicalMaterial
            ref={pialaMatRef}
            map={textureSets.porcelain.map}
            bumpMap={textureSets.porcelain.bumpMap}
            roughnessMap={textureSets.porcelain.roughnessMap}
            color={initialPreset.piala.color}
            roughness={initialPreset.piala.roughness}
            metalness={initialPreset.piala.metalness}
            clearcoat={initialPreset.piala.clearcoat}
            clearcoatRoughness={initialPreset.piala.clearcoatRoughness}
            bumpScale={initialPreset.piala.bumpScale}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Delicate Kiln Particles */}
      <points ref={particlesRef} name="kiln-particles">
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={kilnParticles.speeds.length}
            array={kilnParticles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#E6A975"
          size={0.026}
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
