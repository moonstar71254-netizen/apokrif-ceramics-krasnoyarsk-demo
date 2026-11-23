import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import CeramicComposition from './CeramicComposition';

function detectSoftwareRenderer(gl) {
  try {
    const ctx = gl.getContext();
    const ext = ctx.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return false;
    const renderer = ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '';
    return /SwiftShader|llvmpipe|Software|Mesa OffScreen/i.test(renderer);
  } catch {
    return false;
  }
}

function CursorKilnLight({ pointerRef }) {
  const lightRef = useRef(null);

  useFrame((_, delta) => {
    if (!lightRef.current) return;
    const dt = Math.min(delta, 0.05);
    const px = pointerRef.current ? pointerRef.current.x : 0;
    const py = pointerRef.current ? pointerRef.current.y : 0;
    const tx = 1.1 + px * 3.4;
    const ty = 0.6 + py * 2.2;
    lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, tx, dt * 6);
    lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, ty, dt * 6);
  });

  return (
    <pointLight
      ref={lightRef}
      position={[1.1, 0.6, 3.2]}
      intensity={16}
      distance={11}
      decay={2}
      color="#E6B07B"
    />
  );
}

function PostProcessingRig() {
  const { gl, scene, camera, size } = useThree();

  const { composer, bloomPass, smaaPass } = useMemo(() => {
    const software = detectSoftwareRenderer(gl);
    const samples =
      !software && gl.capabilities.isWebGL2
        ? Math.min(8, gl.capabilities.maxSamples || 4)
        : 0;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, size.width);
    const height = Math.max(1, size.height);

    const renderTarget = new THREE.WebGLRenderTarget(
      Math.floor(width * pixelRatio),
      Math.floor(height * pixelRatio),
      {
        type: THREE.HalfFloatType,
        samples,
      }
    );

    const effectComposer = new EffectComposer(gl, renderTarget);
    effectComposer.setPixelRatio(pixelRatio);
    effectComposer.setSize(width, height);

    const renderPass = new RenderPass(scene, camera);
    effectComposer.addPass(renderPass);

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.22,
      0.45,
      0.92
    );
    effectComposer.addPass(bloom);

    const outputPass = new OutputPass();
    effectComposer.addPass(outputPass);

    let smaa = null;
    if (!software) {
      smaa = new SMAAPass(
        Math.floor(width * pixelRatio),
        Math.floor(height * pixelRatio)
      );
      effectComposer.addPass(smaa);
    }

    return { composer: effectComposer, bloomPass: bloom, smaaPass: smaa };
  }, [gl, scene, camera]);

  useEffect(() => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, size.width);
    const height = Math.max(1, size.height);
    composer.setPixelRatio(pixelRatio);
    composer.setSize(width, height);
    bloomPass.resolution.set(width, height);
    if (smaaPass) {
      smaaPass.setSize(Math.floor(width * pixelRatio), Math.floor(height * pixelRatio));
    }
  }, [composer, bloomPass, smaaPass, size.width, size.height]);

  useEffect(() => {
    return () => {
      composer.dispose();
    };
  }, [composer]);

  useFrame(() => {
    composer.render();
  }, 1);

  return null;
}

export default function KilnStage({ activeScene, pointerRef }) {
  return (
    <div className="canvas-stage" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0.35, 0.35, 6.4], fov: 38, near: 0.1, far: 40 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.04,
        }}
      >
        <color attach="background" args={['#0B0A09']} />
        <fog attach="fog" args={['#0B0A09', 9.5, 22]} />

        <ambientLight intensity={0.28} color="#EADAD0" />
        <directionalLight position={[4.5, 5.2, 4.2]} intensity={1.8} color="#F5DFC6" />
        <directionalLight position={[-4.5, -1.8, -3.0]} intensity={1.05} color="#C98A55" />
        <spotLight
          position={[-2.5, 4.8, 3.0]}
          angle={0.48}
          penumbra={0.85}
          intensity={14}
          color="#E0A976"
        />

        <CursorKilnLight pointerRef={pointerRef} />

        <Environment resolution={512} frames={1}>
          <Lightformer
            form="ring"
            intensity={1.9}
            color="#E0A976"
            scale={[7, 7, 1]}
            position={[4, 2.5, 3]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={2.2}
            color="#F3ECE4"
            scale={[5, 8, 1]}
            position={[-4.5, 3, 2]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={1.7}
            color="#C98A55"
            scale={[8, 4, 1]}
            position={[1, -3.8, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="circle"
            intensity={1.5}
            color="#7A482B"
            scale={[6, 6, 1]}
            position={[0, 1.5, -5]}
            target={[0, 0, 0]}
          />
        </Environment>

        <CeramicComposition activeScene={activeScene} pointerRef={pointerRef} />
        <PostProcessingRig />
      </Canvas>
    </div>
  );
}
