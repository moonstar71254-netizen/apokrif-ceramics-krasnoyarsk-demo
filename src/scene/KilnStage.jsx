import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import KilnBackdrop from './KilnBackdrop';
import CeramicComposition from './CeramicComposition';

function CrispPostProcessing({ firingTemp }) {
  const { gl, scene, camera, size } = useThree();

  const { composer, bloomPass } = useMemo(() => {
    const context = gl.getContext();
    const rendererInfo = String(context?.getParameter?.(context.RENDERER) || '');
    const isSoftware = /swiftshader|llvmpipe|software/i.test(rendererInfo);
    const samples =
      !isSoftware && gl.capabilities.isWebGL2
        ? Math.min(8, gl.capabilities.maxSamples || 4)
        : 0;

    const dpr = gl.getPixelRatio();
    const w = Math.max(1, Math.floor(size.width * dpr));
    const h = Math.max(1, Math.floor(size.height * dpr));

    const target = new THREE.WebGLRenderTarget(w, h, {
      type: THREE.HalfFloatType,
      samples,
    });

    const effectComposer = new EffectComposer(gl, target);
    effectComposer.setPixelRatio(dpr);
    effectComposer.setSize(size.width, size.height);

    const renderPass = new RenderPass(scene, camera);
    // Delicate bloom: threshold >= 0.90, strength <= 0.20 (no whiteout)
    const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.14, 0.36, 0.92);
    const outputPass = new OutputPass();

    effectComposer.addPass(renderPass);
    effectComposer.addPass(bloom);
    effectComposer.addPass(outputPass);

    return { composer: effectComposer, bloomPass: bloom };
  }, [gl, scene, camera]);

  useEffect(() => {
    const dpr = gl.getPixelRatio();
    composer.setPixelRatio(dpr);
    composer.setSize(size.width, size.height);
    bloomPass.setSize(
      Math.max(1, Math.floor(size.width * dpr)),
      Math.max(1, Math.floor(size.height * dpr))
    );
  }, [composer, bloomPass, gl, size.width, size.height]);

  useEffect(() => {
    const heat = (Math.max(900, Math.min(1250, firingTemp)) - 900) / 350;
    bloomPass.strength = 0.13 + heat * 0.05; // stays strictly <= 0.18 (<= 0.20)
    bloomPass.threshold = 0.92;
  }, [bloomPass, firingTemp]);

  useEffect(() => {
    return () => {
      composer.renderTarget1?.dispose();
      composer.renderTarget2?.dispose();
      composer.dispose();
    };
  }, [composer]);

  useFrame(() => {
    composer.render();
  }, 1);

  return null;
}

export default function KilnStage({
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
  return (
    <div className="stage-layer">
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 36, near: 0.1, far: 80, position: [0, 0.24, 6.95] }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.04,
        }}
      >
        <Environment resolution={512} frames={1}>
          <Lightformer
            form="rect"
            intensity={2.45}
            color="#FFF2E0"
            position={[4.5, 4.5, 3.5]}
            scale={[5.5, 8.5, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={1.65}
            color="#E89A5C"
            position={[-5.2, 2.2, -2.5]}
            scale={[4.5, 6.5, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="ring"
            intensity={0.95}
            color="#D6DFE8"
            position={[0, 6.5, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={6.5}
          />
        </Environment>

        <KilnBackdrop
          glazeKey={glazeKey}
          firingTemp={firingTemp}
          pointerRef={pointerRef}
        />

        <CeramicComposition
          activeScene={activeScene}
          prevScene={prevScene}
          transitionTick={transitionTick}
          glazeKey={glazeKey}
          firingTemp={firingTemp}
          formatKey={formatKey}
          wheelSpinRef={wheelSpinRef}
          dragStateRef={dragStateRef}
          pointerRef={pointerRef}
        />

        <CrispPostProcessing firingTemp={firingTemp} />
      </Canvas>
    </div>
  );
}
