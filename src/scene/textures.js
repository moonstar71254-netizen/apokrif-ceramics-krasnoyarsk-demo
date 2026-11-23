import * as THREE from 'three';

const TEX_SIZE = 1024;

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  return canvas;
}

function configureTexture(canvas, { isColor = false, maxAnisotropy = 4, repeatX = 2, repeatY = 1 }) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = Math.max(1, maxAnisotropy);
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  if (isColor) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates crisp 1024x1024 procedural PBR maps (map, bumpMap, roughnessMap)
 * for a given glaze preset: 'chamotte' | 'porcelain' | 'copper'.
 */
export function createGlazeTextureSet(presetKey, maxAnisotropy = 4) {
  const colorCanvas = makeCanvas();
  const bumpCanvas = makeCanvas();
  const roughCanvas = makeCanvas();

  const cCtx = colorCanvas.getContext('2d');
  const bCtx = bumpCanvas.getContext('2d');
  const rCtx = roughCanvas.getContext('2d');

  if (presetKey === 'porcelain') {
    const rand = mulberry32(202602);
    // Warm satin milk-porcelain vertical glaze gradient
    const grad = cCtx.createLinearGradient(0, 0, 0, TEX_SIZE);
    grad.addColorStop(0.0, '#F5EFE6');
    grad.addColorStop(0.28, '#EFE6D9');
    grad.addColorStop(0.65, '#E7DCCB');
    grad.addColorStop(1.0, '#D9CBB8');
    cCtx.fillStyle = grad;
    cCtx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    rCtx.fillStyle = '#5C5C5C';
    rCtx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Subtle wheel-turned satin bands
    for (let y = 0; y < TEX_SIZE; y += 2) {
      const wave = Math.sin(y * 0.085) * 0.5 + Math.sin(y * 0.23) * 0.5;
      const alpha = 0.018 + Math.abs(wave) * 0.02;
      cCtx.fillStyle = wave > 0 ? `rgba(255,252,247,${alpha})` : `rgba(176,158,138,${alpha})`;
      cCtx.fillRect(0, y, TEX_SIZE, 2);

      const bVal = Math.round(128 + wave * 12);
      bCtx.fillStyle = `rgb(${bVal},${bVal},${bVal})`;
      bCtx.fillRect(0, y, TEX_SIZE, 2);

      const rVal = Math.round(88 + wave * 10);
      rCtx.fillStyle = `rgb(${rVal},${rVal},${rVal})`;
      rCtx.fillRect(0, y, TEX_SIZE, 2);
    }

    // Ultra-fine porcelain mineral flecks
    for (let i = 0; i < 6500; i++) {
      const x = rand() * TEX_SIZE;
      const y = rand() * TEX_SIZE;
      const size = 0.7 + rand() * 1.4;
      const dark = rand() > 0.65;
      cCtx.fillStyle = dark ? 'rgba(130,114,98,0.08)' : 'rgba(255,253,249,0.14)';
      cCtx.fillRect(x, y, size, size);

      const b = dark ? 116 : 140;
      bCtx.fillStyle = `rgba(${b},${b},${b},0.28)`;
      bCtx.fillRect(x, y, size, size);
    }
  } else if (presetKey === 'copper') {
    const rand = mulberry32(202603);
    // Kiln-fired copper-amber reduction glaze
    const grad = cCtx.createLinearGradient(0, 0, 0, TEX_SIZE);
    grad.addColorStop(0.0, '#A85C32');
    grad.addColorStop(0.22, '#C87542');
    grad.addColorStop(0.48, '#8E4422');
    grad.addColorStop(0.76, '#652E18');
    grad.addColorStop(1.0, '#3C1B10');
    cCtx.fillStyle = grad;
    cCtx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    rCtx.fillStyle = '#525252';
    rCtx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Reduction glaze flow bands & subtle kiln shimmer
    for (let y = 0; y < TEX_SIZE; y += 2) {
      const n1 = Math.sin(y * 0.055) + Math.sin(y * 0.19) * 0.5;
      const warm = n1 > 0;
      cCtx.fillStyle = warm
        ? `rgba(232,146,82,${0.045 + Math.abs(n1) * 0.03})`
        : `rgba(48,20,10,${0.055 + Math.abs(n1) * 0.035})`;
      cCtx.fillRect(0, y, TEX_SIZE, 2);

      const bVal = Math.round(128 + n1 * 18);
      bCtx.fillStyle = `rgb(${bVal},${bVal},${bVal})`;
      bCtx.fillRect(0, y, TEX_SIZE, 2);

      const rVal = Math.round(78 - n1 * 18);
      rCtx.fillStyle = `rgb(${rVal},${rVal},${rVal})`;
      rCtx.fillRect(0, y, TEX_SIZE, 2);
    }

    // Subtle vertical glaze drips from rim
    for (let i = 0; i < 42; i++) {
      const x = rand() * TEX_SIZE;
      const w = 4 + rand() * 14;
      const h = 140 + rand() * 320;
      const drip = cCtx.createLinearGradient(0, 0, 0, h);
      drip.addColorStop(0, 'rgba(240,164,98,0.16)');
      drip.addColorStop(0.65, 'rgba(180,92,44,0.08)');
      drip.addColorStop(1, 'rgba(180,92,44,0)');
      cCtx.fillStyle = drip;
      cCtx.fillRect(x, 0, w, h);

      const rDrip = rCtx.createLinearGradient(0, 0, 0, h);
      rDrip.addColorStop(0, 'rgba(42,42,42,0.4)');
      rDrip.addColorStop(1, 'rgba(42,42,42,0)');
      rCtx.fillStyle = rDrip;
      rCtx.fillRect(x, 0, w, h);
    }

    // Fine metallic mineral crystallization flecks
    for (let i = 0; i < 11000; i++) {
      const x = rand() * TEX_SIZE;
      const y = rand() * TEX_SIZE;
      const size = 0.8 + rand() * 1.9;
      const bright = rand() > 0.6;
      cCtx.fillStyle = bright ? 'rgba(246,184,122,0.16)' : 'rgba(34,14,8,0.22)';
      cCtx.fillRect(x, y, size, size);

      const b = bright ? 152 : 104;
      bCtx.fillStyle = `rgba(${b},${b},${b},0.35)`;
      bCtx.fillRect(x, y, size, size);
    }
  } else {
    // Default: 'chamotte' — dark stoneware clay with lively mineral grain & potter's grooves
    const rand = mulberry32(202601);
    const grad = cCtx.createLinearGradient(0, 0, 0, TEX_SIZE);
    grad.addColorStop(0.0, '#6E4C3B');
    grad.addColorStop(0.32, '#53382C');
    grad.addColorStop(0.7, '#3C2820');
    grad.addColorStop(1.0, '#281B16');
    cCtx.fillStyle = grad;
    cCtx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    rCtx.fillStyle = '#C4C4C4';
    rCtx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Distinct potter's wheel grooves (fine horizontal ribbing)
    for (let y = 0; y < TEX_SIZE; y += 2) {
      const groove =
        Math.sin(y * 0.14) * 0.55 +
        Math.sin(y * 0.37) * 0.3 +
        Math.sin(y * 0.032) * 0.15;
      const light = groove > 0;
      cCtx.fillStyle = light
        ? `rgba(186,136,104,${0.055 + Math.abs(groove) * 0.05})`
        : `rgba(22,14,10,${0.08 + Math.abs(groove) * 0.06})`;
      cCtx.fillRect(0, y, TEX_SIZE, 2);

      const bVal = Math.round(128 + groove * 34);
      bCtx.fillStyle = `rgb(${bVal},${bVal},${bVal})`;
      bCtx.fillRect(0, y, TEX_SIZE, 2);

      const rVal = Math.round(196 - groove * 18);
      rCtx.fillStyle = `rgb(${rVal},${rVal},${rVal})`;
      rCtx.fillRect(0, y, TEX_SIZE, 2);
    }

    // Lively chamotte grog speckles (terracotta, quartz, dark iron)
    for (let i = 0; i < 22000; i++) {
      const x = rand() * TEX_SIZE;
      const y = rand() * TEX_SIZE;
      const size = 0.8 + rand() * 2.1;
      const kind = rand();
      if (kind < 0.45) {
        cCtx.fillStyle = 'rgba(20,13,10,0.34)';
        bCtx.fillStyle = 'rgba(84,84,84,0.48)';
      } else if (kind < 0.82) {
        cCtx.fillStyle = 'rgba(184,126,90,0.22)';
        bCtx.fillStyle = 'rgba(168,168,168,0.44)';
      } else {
        cCtx.fillStyle = 'rgba(228,198,168,0.18)';
        bCtx.fillStyle = 'rgba(192,192,192,0.46)';
      }
      cCtx.fillRect(x, y, size, size);
      bCtx.fillRect(x, y, size, size);

      const rVal = kind < 0.45 ? 225 : 170;
      rCtx.fillStyle = `rgba(${rVal},${rVal},${rVal},0.35)`;
      rCtx.fillRect(x, y, size, size);
    }
  }

  return {
    map: configureTexture(colorCanvas, { isColor: true, maxAnisotropy, repeatX: 2, repeatY: 1 }),
    bumpMap: configureTexture(bumpCanvas, { isColor: false, maxAnisotropy, repeatX: 2, repeatY: 1 }),
    roughnessMap: configureTexture(roughCanvas, { isColor: false, maxAnisotropy, repeatX: 2, repeatY: 1 }),
  };
}

export function disposeTextureSet(set) {
  if (!set) return;
  set.map?.dispose();
  set.bumpMap?.dispose();
  set.roughnessMap?.dispose();
}
