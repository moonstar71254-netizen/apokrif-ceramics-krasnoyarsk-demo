import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import {
  createAmphoraTextures,
  createParticleSprite,
  createPialaTextures,
  createPorcelainHaloTextures,
} from './textures';

const SCENE_CAMERA_POSES = [
  {
    camPos: [0.35, 0.35, 6.4],
    lookAt: [-0.95, 0.08, 0],
    groupPos: [1.35, -0.1, 0],
    groupRot: [0.06, -0.35, 0.04],
  },
  {
    camPos: [-1.15, 0.55, 5.15],
    lookAt: [-0.4, 0.15, 0],
    groupPos: [1.45, -0.05, 0.25],
    groupRot: [0.14, 0.72, -0.05],
  },
  {
    camPos: [1.4, 1.35, 5.4],
    lookAt: [-0.55, 0.0, 0],
    groupPos: [1.15, -0.18, -0.1],
    groupRot: [-0.12, 1.85, 0.08],
  },
  {
    camPos: [-0.45, 0.15, 7.0],
    lookAt: [-1.25, 0.05, 0],
    groupPos: [2.15, -0.14, -0.45],
    groupRot: [0.08, 2.75, -0.06],
  },
  {
    camPos: [0.85, -0.15, 6.55],
    lookAt: [-0.85, 0.04, 0],
    groupPos: [1.65, -0.22, -0.55],
    groupRot: [0.1, 3.85, 0.05],
  },
];

function buildAmphoraGeometry() {
  const controlPoints = [
    new THREE.Vector2(0.0, -1.62),
    new THREE.Vector2(0.46, -1.62),
    new THREE.Vector2(0.52, -1.56),
    new THREE.Vector2(0.48, -1.46),
    new THREE.Vector2(0.68, -1.18),
    new THREE.Vector2(0.96, -0.78),
    new THREE.Vector2(1.14, -0.32),
    new THREE.Vector2(1.19, 0.05),
    new THREE.Vector2(1.15, 0.36),
    new THREE.Vector2(1.18, 0.44),
    new THREE.Vector2(1.07, 0.62),
    new THREE.Vector2(0.86, 0.88),
    new THREE.Vector2(0.62, 1.06),
    new THREE.Vector2(0.65, 1.12),
    new THREE.Vector2(0.46, 1.24),
    new THREE.Vector2(0.42, 1.46),
    new THREE.Vector2(0.51, 1.66),
    new THREE.Vector2(0.61, 1.78),
    new THREE.Vector2(0.57, 1.82),
    new THREE.Vector2(0.47, 1.72),
    new THREE.Vector2(0.36, 1.44),
    new THREE.Vector2(0.34, 1.15),
  ];

  const curve = new THREE.SplineCurve(controlPoints);
  const sampled = curve.getPoints(64);
  const geom = new THREE.LatheGeometry(sampled, 112);
  geom.computeVertexNormals();
  return geom;
}

function buildPialaGeometry() {
  const controlPoints = [
    new THREE.Vector2(0.0, -0.34),
    new THREE.Vector2(0.22, -0.34),
    new THREE.Vector2(0.24, -0.28),
    new THREE.Vector2(0.34, -0.18),
    new THREE.Vector2(0.46, -0.02),
    new THREE.Vector2(0.49, 0.14),
    new THREE.Vector2(0.47, 0.28),
    new THREE.Vector2(0.49, 0.34),
    new THREE.Vector2(0.45, 0.35),
    new THREE.Vector2(0.41, 0.24),
    new THREE.Vector2(0.36, 0.02),
    new THREE.Vector2(0.22, -0.18),
    new THREE.Vector2(0.0, -0.22),
  ];

  const curve = new THREE.SplineCurve(controlPoints);
  const sampled = curve.getPoints(48);
  const geom = new THREE.LatheGeometry(sampled, 80);
  geom.computeVertexNormals();
  return geom;
}

function buildParticleField(count, zMin, zMax, spreadX, spreadY, seedOffset) {
  const positions = new Float32Array(count * 3);
  let s = (1337 + seedOffset * 911) >>> 0;
  const rand = () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (rand() - 0.5) * spreadX;
    positions[i * 3 + 1] = (rand() - 0.5) * spreadY;
    positions[i * 3 + 2] = zMin + rand() * (zMax - zMin);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geom;
}

export default function CeramicComposition({ activeScene, pointerRef }) {
  const { camera, size } = useThree();
  const rootGroupRef = useRef(null);
  const amphoraRef = useRef(null);
  const haloGroupRef = useRef(null);
  const pialaOrbitRef = useRef(null);
  const pialaMeshRef = useRef(null);
  const nearDustRef = useRef(null);
  const farSparksRef = useRef(null);

  const lookAtTargetRef = useRef(new THREE.Vector3(-0.95, 0.08, 0));
  const poseStateRef = useRef({
    gx: SCENE_CAMERA_POSES[0].groupPos[0],
    gy: SCENE_CAMERA_POSES[0].groupPos[1],
    gz: SCENE_CAMERA_POSES[0].groupPos[2],
    rx: SCENE_CAMERA_POSES[0].groupRot[0],
    ry: SCENE_CAMERA_POSES[0].groupRot[1],
    rz: SCENE_CAMERA_POSES[0].groupRot[2],
  });

  const amphoraGeom = useMemo(() => buildAmphoraGeometry(), []);
  const pialaGeom = useMemo(() => buildPialaGeometry(), []);
  const porcelainHaloGeom = useMemo(() => new THREE.TorusGeometry(1.92, 0.072, 40, 112), []);
  const glazeRimGeom = useMemo(() => new THREE.TorusGeometry(2.06, 0.022, 40, 112), []);
  const neckCollarGeom = useMemo(() => new THREE.TorusGeometry(0.455, 0.024, 36, 96), []);

  const nearDustGeom = useMemo(() => buildParticleField(120, -1.2, 3.2, 11, 7, 1), []);
  const farSparksGeom = useMemo(() => buildParticleField(95, -5.2, -1.0, 14, 9, 2), []);

  const amphoraMaps = useMemo(() => createAmphoraTextures(), []);
  const haloMaps = useMemo(() => createPorcelainHaloTextures(), []);
  const pialaMaps = useMemo(() => createPialaTextures(), []);
  const particleSprite = useMemo(() => createParticleSprite(), []);

  useEffect(() => {
    return () => {
      amphoraGeom.dispose();
      pialaGeom.dispose();
      porcelainHaloGeom.dispose();
      glazeRimGeom.dispose();
      neckCollarGeom.dispose();
      nearDustGeom.dispose();
      farSparksGeom.dispose();
      particleSprite.dispose();
      Object.values(amphoraMaps).forEach((t) => t.dispose());
      Object.values(haloMaps).forEach((t) => t.dispose());
      Object.values(pialaMaps).forEach((t) => t.dispose());
    };
  }, [
    amphoraGeom,
    pialaGeom,
    porcelainHaloGeom,
    glazeRimGeom,
    neckCollarGeom,
    nearDustGeom,
    farSparksGeom,
    particleSprite,
    amphoraMaps,
    haloMaps,
    pialaMaps,
  ]);

  useEffect(() => {
    const pose = SCENE_CAMERA_POSES[activeScene] || SCENE_CAMERA_POSES[0];
    const isCompact = size.width < 820;

    const targetCamX = isCompact ? pose.camPos[0] * 0.45 : pose.camPos[0];
    const targetCamY = isCompact ? pose.camPos[1] + 0.15 : pose.camPos[1];
    const targetCamZ = isCompact ? pose.camPos[2] + 1.55 : pose.camPos[2];

    const targetLookX = isCompact ? 0.0 : pose.lookAt[0];
    const targetLookY = isCompact ? -0.15 : pose.lookAt[1];

    const targetGroupX = isCompact ? 0.0 : pose.groupPos[0];
    const targetGroupY = isCompact ? 0.25 : pose.groupPos[1];

    const ctx = gsap.context(() => {
      gsap.to(camera.position, {
        x: targetCamX,
        y: targetCamY,
        z: targetCamZ,
        duration: 0.85,
        ease: 'expo.out',
        overwrite: 'auto',
      });

      gsap.to(lookAtTargetRef.current, {
        x: targetLookX,
        y: targetLookY,
        z: pose.lookAt[2],
        duration: 0.85,
        ease: 'expo.out',
        overwrite: 'auto',
      });

      gsap.to(poseStateRef.current, {
        gx: targetGroupX,
        gy: targetGroupY,
        gz: pose.groupPos[2],
        rx: pose.groupRot[0],
        ry: pose.groupRot[1],
        rz: pose.groupRot[2],
        duration: 0.85,
        ease: 'expo.out',
        overwrite: 'auto',
      });
    });

    return () => ctx.revert();
  }, [activeScene, camera, size.width]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const px = pointerRef.current ? pointerRef.current.x : 0;
    const py = pointerRef.current ? pointerRef.current.y : 0;

    camera.lookAt(lookAtTargetRef.current);

    if (rootGroupRef.current) {
      const p = poseStateRef.current;
      const targetX = p.gx + px * 0.18;
      const targetY = p.gy + Math.sin(t * 0.65) * 0.07 + py * 0.12;
      const targetRx = p.rx - py * 0.09;
      const targetRy = p.ry + px * 0.14;

      rootGroupRef.current.position.x = THREE.MathUtils.lerp(rootGroupRef.current.position.x, targetX, dt * 5.2);
      rootGroupRef.current.position.y = THREE.MathUtils.lerp(rootGroupRef.current.position.y, targetY, dt * 5.2);
      rootGroupRef.current.position.z = THREE.MathUtils.lerp(rootGroupRef.current.position.z, p.gz, dt * 5.2);

      rootGroupRef.current.rotation.x = THREE.MathUtils.lerp(rootGroupRef.current.rotation.x, targetRx, dt * 4.5);
      rootGroupRef.current.rotation.y = THREE.MathUtils.lerp(rootGroupRef.current.rotation.y, targetRy, dt * 4.5);
      rootGroupRef.current.rotation.z = THREE.MathUtils.lerp(rootGroupRef.current.rotation.z, p.rz, dt * 4.5);
    }

    if (amphoraRef.current) {
      amphoraRef.current.rotation.y += dt * 0.14;
    }

    if (haloGroupRef.current) {
      haloGroupRef.current.rotation.z = t * 0.16;
      haloGroupRef.current.rotation.x = 1.18 + Math.sin(t * 0.42) * 0.08;
      haloGroupRef.current.rotation.y = -0.34 + Math.cos(t * 0.35) * 0.08;
    }

    if (pialaOrbitRef.current && pialaMeshRef.current) {
      const angle = t * 0.36 + 0.9;
      const orbitR = 2.38;
      pialaOrbitRef.current.position.x = Math.cos(angle) * orbitR;
      pialaOrbitRef.current.position.z = Math.sin(angle) * orbitR * 0.78;
      pialaOrbitRef.current.position.y = 0.25 + Math.sin(t * 0.95) * 0.24;

      pialaMeshRef.current.rotation.y -= dt * 0.42;
      pialaMeshRef.current.rotation.z = 0.22 + Math.sin(t * 0.7) * 0.08;
      pialaMeshRef.current.rotation.x = 0.18 + Math.cos(t * 0.6) * 0.06;
    }

    if (nearDustRef.current) {
      nearDustRef.current.rotation.y = t * 0.025 + px * 0.06;
      nearDustRef.current.position.y = Math.sin(t * 0.3) * 0.12 - py * 0.08;
    }

    if (farSparksRef.current) {
      farSparksRef.current.rotation.y = -t * 0.018 + px * 0.03;
      farSparksRef.current.position.y = Math.cos(t * 0.24) * 0.15;
    }
  });

  return (
    <>
      <group ref={rootGroupRef} position={[1.35, -0.1, 0]}>
        <group ref={amphoraRef}>
          <mesh geometry={amphoraGeom} castShadow receiveShadow>
            <meshPhysicalMaterial
              map={amphoraMaps.map}
              bumpMap={amphoraMaps.bumpMap}
              bumpScale={0.018}
              roughnessMap={amphoraMaps.roughnessMap}
              roughness={0.42}
              metalness={0.08}
              clearcoat={0.42}
              clearcoatRoughness={0.38}
              envMapIntensity={1.15}
            />
          </mesh>

          <mesh geometry={neckCollarGeom} position={[0, 1.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <meshPhysicalMaterial
              color="#D4955F"
              roughness={0.39}
              metalness={0.45}
              clearcoat={0.42}
              clearcoatRoughness={0.36}
              envMapIntensity={1.25}
            />
          </mesh>
        </group>

        <group ref={haloGroupRef} rotation={[1.18, -0.34, 0]}>
          <mesh geometry={porcelainHaloGeom}>
            <meshPhysicalMaterial
              map={haloMaps.map}
              bumpMap={haloMaps.bumpMap}
              bumpScale={0.012}
              roughnessMap={haloMaps.roughnessMap}
              color="#F0E6DA"
              roughness={0.44}
              metalness={0.04}
              clearcoat={0.42}
              clearcoatRoughness={0.4}
              envMapIntensity={1.08}
            />
          </mesh>
          <mesh geometry={glazeRimGeom} position={[0, 0, 0.05]}>
            <meshPhysicalMaterial
              color="#E0A976"
              roughness={0.38}
              metalness={0.58}
              clearcoat={0.42}
              clearcoatRoughness={0.36}
              emissive="#7A482B"
              emissiveIntensity={0.22}
              envMapIntensity={1.2}
            />
          </mesh>
        </group>

        <group ref={pialaOrbitRef}>
          <mesh ref={pialaMeshRef} geometry={pialaGeom}>
            <meshPhysicalMaterial
              map={pialaMaps.map}
              bumpMap={pialaMaps.bumpMap}
              bumpScale={0.014}
              roughnessMap={pialaMaps.roughnessMap}
              roughness={0.4}
              metalness={0.1}
              clearcoat={0.42}
              clearcoatRoughness={0.38}
              envMapIntensity={1.15}
            />
          </mesh>
        </group>
      </group>

      <points ref={nearDustRef} geometry={nearDustGeom}>
        <pointsMaterial
          map={particleSprite}
          size={0.085}
          color="#E6B688"
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      <points ref={farSparksRef} geometry={farSparksGeom}>
        <pointsMaterial
          map={particleSprite}
          size={0.12}
          color="#C98A55"
          transparent
          opacity={0.36}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </>
  );
}
