import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import CeramicComposition from './CeramicComposition';

function CrispPostProcessing() {
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
    const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.14, 0.38, 0.94);
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
  glazeKey,
  focusTarget,
  dragStateRef,
  pointerRef,
}) {
  return (
    <div className="stage-layer" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 36, near: 0.1, far: 60, position: [0, 0.24, 6.15] }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
      >
        <Environment resolution={256} frames={1}>
          <Lightformer
            form="rect"
            intensity={2.4}
            color="#FFF2E0"
            position={[4, 4, 3]}
            scale={[5, 8, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={1.5}
            color="#E89A5C"
            position={[-5, 2, -2]}
            scale={[4, 6, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="ring"
            intensity={0.9}
            color="#D6DFE8"
            position={[0, 6, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={6}
          />
        </Environment>

        <CeramicComposition
          activeScene={activeScene}
          glazeKey={glazeKey}
          focusTarget={focusTarget}
          dragStateRef={dragStateRef}
          pointerRef={pointerRef}
        />

        <CrispPostProcessing />
      </Canvas>
    </div>
  );
}
