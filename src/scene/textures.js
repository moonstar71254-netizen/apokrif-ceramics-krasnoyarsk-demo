import * as THREE from 'three';

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

function makeCanvas(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function configureTexture(canvas, isColor = false, repeatX = 2, repeatY = 1) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 4;
  if (isColor) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  tex.needsUpdate = true;
  return tex;
}

export function createAmphoraTextures() {
  const size = 512;
  const rand = mulberry32(41029);

  const colorCanvas = makeCanvas(size);
  const bumpCanvas = makeCanvas(size);
  const roughCanvas = makeCanvas(size);

  const cCtx = colorCanvas.getContext('2d');
  const bCtx = bumpCanvas.getContext('2d');
  const rCtx = roughCanvas.getContext('2d');

  const cGrad = cCtx.createLinearGradient(0, 0, 0, size);
  cGrad.addColorStop(0.0, '#D9A77A');
  cGrad.addColorStop(0.18, '#B87646');
  cGrad.addColorStop(0.45, '#8A4E2E');
  cGrad.addColorStop(0.75, '#593320');
  cGrad.addColorStop(1.0, '#382217');
  cCtx.fillStyle = cGrad;
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  const rGrad = rCtx.createLinearGradient(0, 0, 0, size);
  rGrad.addColorStop(0.0, 'rgb(104,104,104)');
  rGrad.addColorStop(0.5, 'rgb(114,114,114)');
  rGrad.addColorStop(1.0, 'rgb(126,126,126)');
  rCtx.fillStyle = rGrad;
  rCtx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 1) {
    const wave =
      Math.sin((y / size) * Math.PI * 56) * 0.45 +
      Math.sin((y / size) * Math.PI * 140 + 1.1) * 0.3 +
      (rand() - 0.5) * 0.35;

    const bumpVal = Math.max(40, Math.min(220, Math.round(128 + wave * 34)));
    bCtx.fillStyle = `rgb(${bumpVal},${bumpVal},${bumpVal})`;
    bCtx.fillRect(0, y, size, 1);

    const roughShift = Math.round(wave * 10);
    const roughVal = Math.max(92, Math.min(148, 114 - roughShift));
    rCtx.fillStyle = `rgba(${roughVal},${roughVal},${roughVal},0.45)`;
    rCtx.fillRect(0, y, size, 1);

    if (Math.abs(wave) > 0.35) {
      cCtx.fillStyle = wave > 0 ? 'rgba(232,182,134,0.06)' : 'rgba(20,12,8,0.09)';
      cCtx.fillRect(0, y, size, 1);
    }
  }

  for (let i = 0; i < 28; i += 1) {
    const x = rand() * size;
    const w = 4 + rand() * 14;
    const h = 40 + rand() * 145;
    const g = cCtx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(224,169,118,0.16)');
    g.addColorStop(0.7, 'rgba(201,138,85,0.08)');
    g.addColorStop(1, 'rgba(201,138,85,0)');
    cCtx.fillStyle = g;
    cCtx.fillRect(x, 0, w, h);
  }

  for (let i = 0; i < 4200; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const radius = 0.5 + rand() * 1.35;
    const dark = rand() > 0.42;

    cCtx.fillStyle = dark
      ? `rgba(26, 15, 10, ${0.12 + rand() * 0.18})`
      : `rgba(243, 224, 202, ${0.07 + rand() * 0.12})`;
    cCtx.beginPath();
    cCtx.arc(x, y, radius, 0, Math.PI * 2);
    cCtx.fill();

    const bTone = dark ? 96 : 162;
    bCtx.fillStyle = `rgba(${bTone},${bTone},${bTone},0.35)`;
    bCtx.fillRect(x, y, radius * 1.4, radius * 1.4);

    const rTone = dark ? 140 : 100;
    rCtx.fillStyle = `rgba(${rTone},${rTone},${rTone},0.28)`;
    rCtx.fillRect(x, y, radius * 1.5, radius * 1.5);
  }

  return {
    map: configureTexture(colorCanvas, true, 2, 1),
    bumpMap: configureTexture(bumpCanvas, false, 2, 1),
    roughnessMap: configureTexture(roughCanvas, false, 2, 1),
  };
}

export function createPorcelainHaloTextures() {
  const size = 512;
  const rand = mulberry32(90211);

  const colorCanvas = makeCanvas(size);
  const bumpCanvas = makeCanvas(size);
  const roughCanvas = makeCanvas(size);

  const cCtx = colorCanvas.getContext('2d');
  const bCtx = bumpCanvas.getContext('2d');
  const rCtx = roughCanvas.getContext('2d');

  cCtx.fillStyle = '#E8DDD0';
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = 'rgb(112,112,112)';
  rCtx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 2) {
    const ripple = Math.sin((y / size) * Math.PI * 44) * 0.5 + (rand() - 0.5) * 0.25;
    const bVal = Math.round(128 + ripple * 22);
    bCtx.fillStyle = `rgb(${bVal},${bVal},${bVal})`;
    bCtx.fillRect(0, y, size, 2);

    const rVal = Math.round(112 - ripple * 10);
    rCtx.fillStyle = `rgb(${rVal},${rVal},${rVal})`;
    rCtx.fillRect(0, y, size, 2);

    cCtx.fillStyle = ripple > 0 ? 'rgba(255,250,244,0.08)' : 'rgba(138,108,84,0.06)';
    cCtx.fillRect(0, y, size, 2);
  }

  for (let i = 0; i < 2200; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 0.5 + rand() * 1.1;
    cCtx.fillStyle = `rgba(92, 68, 52, ${0.06 + rand() * 0.1})`;
    cCtx.beginPath();
    cCtx.arc(x, y, r, 0, Math.PI * 2);
    cCtx.fill();

    rCtx.fillStyle = 'rgba(130,130,130,0.22)';
    rCtx.fillRect(x, y, 1.5, 1.5);
  }

  return {
    map: configureTexture(colorCanvas, true, 4, 1),
    bumpMap: configureTexture(bumpCanvas, false, 4, 1),
    roughnessMap: configureTexture(roughCanvas, false, 4, 1),
  };
}

export function createPialaTextures() {
  const size = 512;
  const rand = mulberry32(73319);

  const colorCanvas = makeCanvas(size);
  const bumpCanvas = makeCanvas(size);
  const roughCanvas = makeCanvas(size);

  const cCtx = colorCanvas.getContext('2d');
  const bCtx = bumpCanvas.getContext('2d');
  const rCtx = roughCanvas.getContext('2d');

  const grad = cCtx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0.0, '#E0A976');
  grad.addColorStop(0.28, '#A9673B');
  grad.addColorStop(0.65, '#4A2B1D');
  grad.addColorStop(1.0, '#271710');
  cCtx.fillStyle = grad;
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = 'rgb(110,110,110)';
  rCtx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 1) {
    const groove = Math.sin((y / size) * Math.PI * 64) * 0.55 + (rand() - 0.5) * 0.25;
    const bVal = Math.max(50, Math.min(210, Math.round(128 + groove * 28)));
    bCtx.fillStyle = `rgb(${bVal},${bVal},${bVal})`;
    bCtx.fillRect(0, y, size, 1);

    const rVal = Math.max(96, Math.min(138, Math.round(112 - groove * 10)));
    rCtx.fillStyle = `rgb(${rVal},${rVal},${rVal})`;
    rCtx.fillRect(0, y, size, 1);
  }

  for (let i = 0; i < 2600; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 0.5 + rand() * 1.1;
    cCtx.fillStyle = rand() > 0.5 ? 'rgba(24,14,10,0.18)' : 'rgba(240,206,170,0.1)';
    cCtx.beginPath();
    cCtx.arc(x, y, r, 0, Math.PI * 2);
    cCtx.fill();
  }

  return {
    map: configureTexture(colorCanvas, true, 2, 1),
    bumpMap: configureTexture(bumpCanvas, false, 2, 1),
    roughnessMap: configureTexture(roughCanvas, false, 2, 1),
  };
}

export function createParticleSprite() {
  const size = 64;
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255, 238, 214, 1)');
  grad.addColorStop(0.35, 'rgba(224, 169, 118, 0.72)');
  grad.addColorStop(0.7, 'rgba(201, 138, 85, 0.18)');
  grad.addColorStop(1, 'rgba(201, 138, 85, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
