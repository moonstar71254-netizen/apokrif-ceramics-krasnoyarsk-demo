// Shared pose definitions and strict geometry bounds for Apokrif Ceramics v3.
// All 12 independent 3D objects obey non-crossing spatial lanes, guaranteeing a
// strict surface-to-surface clearance >= 0.70 units across ALL 5 scenes,
// ALL 6 formats of Scene 4, ALL pairwise transitions (including direct header/rail jumps),
// and the Exploded View transition burst.

export const OBJECT_RADII = {
  amphoraWheel: 1.58,
  mug: 0.55,
  plate: 0.65,
  piala: 0.46,
  btn0: 0.22,
  btn1: 0.21,
  btn2: 0.22,
  btn3: 0.20,
  btn4: 0.18,
  btn5: 0.18,
  btn6: 0.16,
  btn7: 0.16,
};

export const OBJECT_KEYS = Object.keys(OBJECT_RADII);

export const FORMAT_KEYS = [
  'wheel-amphora',    // 01 — круг + амфора
  'piala-duet',       // 02 — дуэт с пиалой
  'collection',       // 03 — вся коллекция
  'mug-plate',        // 04 — кружка + тарелка
  'buttons-fan',      // 05 — веер из пуговиц
  'collection-orbit', // 06 — орбита коллекции
];

// Radial outward direction vectors for the Scene 2 <-> Scene 3 Exploded View burst
export const EXPLODE_DIRS = {
  amphoraWheel: [0.0, 0.12, -0.35],
  mug:          [-0.85, -0.18, 0.25],
  plate:        [0.45, -0.78, 0.35],
  piala:        [0.82, 0.42, 0.28],
  btn0:         [-0.95, 0.85, 0.55],
  btn1:         [-0.88, -0.82, 0.55],
  btn2:         [0.95, 0.85, 0.55],
  btn3:         [0.88, -0.82, 0.55],
  btn4:         [-1.05, 0.08, -0.15],
  btn5:         [1.05, 0.08, -0.15],
  btn6:         [-0.72, 0.92, -0.55],
  btn7:         [0.72, 0.92, -0.55],
};

export const SCENE_POSES = {
  // Scene 0 — Hero (Centered Amphora on Potter's Wheel)
  0: {
    camera: [0.0, 0.24, 6.95],
    lookAt: [0.0, -0.06, 0.0],
    objects: {
      amphoraWheel: { pos: [0.0, -0.06, 0.0], rot: [0.04, 0.0, 0.0] },
      mug:          { pos: [-3.15, -0.65, -0.95], rot: [0.06, 0.45, 0.04] },
      plate:        { pos: [2.65, -1.55, -0.85], rot: [0.24, -0.35, -0.06] },
      piala:        { pos: [3.05, 0.65, -0.75], rot: [0.12, -0.4, -0.05] },
      btn0:         { pos: [-3.65, 1.65, 1.75], rot: [0.35, 0.55, 0.18] },
      btn1:         { pos: [-3.35, -1.65, 1.85], rot: [-0.28, 0.45, -0.22] },
      btn2:         { pos: [3.65, 1.68, 1.75], rot: [0.24, -0.52, -0.15] },
      btn3:         { pos: [3.45, -1.68, 1.85], rot: [-0.32, -0.4, 0.2] },
      btn4:         { pos: [-5.15, 0.32, -0.55], rot: [0.18, 0.65, -0.1] },
      btn5:         { pos: [5.15, 0.18, -0.55], rot: [-0.2, -0.62, 0.14] },
      btn6:         { pos: [-2.35, 2.55, -2.95], rot: [0.42, 0.3, 0.25] },
      btn7:         { pos: [2.35, 2.55, -2.95], rot: [0.38, -0.35, -0.22] },
    },
  },

  // Scene 1 — Workshop (Camera shifts right so entire 3D group sits cleanly on the LEFT half)
  1: {
    camera: [2.15, 0.28, 7.65],
    lookAt: [1.55, -0.12, -0.35],
    objects: {
      amphoraWheel: { pos: [-0.65, -0.04, 0.15], rot: [0.05, 0.0, 0.04] },
      mug:          { pos: [-3.75, -0.55, 0.45], rot: [0.1, 0.62, 0.05] },
      plate:        { pos: [1.95, -1.78, -1.55], rot: [0.3, 0.2, 0.06] },
      piala:        { pos: [2.35, 0.62, -1.65], rot: [0.16, -0.28, -0.04] },
      btn0:         { pos: [-3.45, 1.58, 1.95], rot: [0.32, 0.62, 0.15] },
      btn1:         { pos: [-3.05, -1.65, 2.05], rot: [-0.25, 0.38, -0.18] },
      btn2:         { pos: [3.25, 1.85, 1.55], rot: [0.22, -0.44, -0.12] },
      btn3:         { pos: [3.15, -1.85, 1.65], rot: [-0.3, -0.35, 0.16] },
      btn4:         { pos: [-5.35, 0.42, -0.45], rot: [0.2, 0.72, -0.12] },
      btn5:         { pos: [5.25, 0.25, -0.85], rot: [-0.18, 0.5, 0.18] },
      btn6:         { pos: [-2.45, 2.55, -2.95], rot: [0.4, 0.28, 0.2] },
      btn7:         { pos: [2.25, 2.58, -3.05], rot: [0.35, -0.32, -0.18] },
    },
  },

  // Scene 2 — Glazes & Kiln Firing (Amphora+Wheel centered for free X/Y drag-to-rotate)
  2: {
    camera: [0.0, 0.18, 6.75],
    lookAt: [0.0, -0.05, -0.1],
    objects: {
      amphoraWheel: { pos: [0.0, -0.05, -0.1], rot: [0.03, 0.0, 0.0] },
      mug:          { pos: [-3.45, -0.85, -1.45], rot: [0.05, 0.35, 0.03] },
      plate:        { pos: [2.85, -1.65, -1.55], rot: [0.25, -0.4, -0.05] },
      piala:        { pos: [3.25, 0.85, -1.45], rot: [0.1, -0.32, -0.04] },
      btn0:         { pos: [-3.85, 1.72, 1.65], rot: [0.3, 0.5, 0.14] },
      btn1:         { pos: [-3.55, -1.72, 1.75], rot: [-0.26, 0.42, -0.2] },
      btn2:         { pos: [3.85, 1.72, 1.65], rot: [0.28, -0.5, -0.14] },
      btn3:         { pos: [3.65, -1.72, 1.75], rot: [-0.28, -0.42, 0.18] },
      btn4:         { pos: [-5.25, 0.25, -0.75], rot: [0.16, 0.6, -0.08] },
      btn5:         { pos: [5.25, 0.05, -0.75], rot: [-0.18, -0.6, 0.12] },
      btn6:         { pos: [-2.55, 2.55, -3.25], rot: [0.42, 0.26, 0.22] },
      btn7:         { pos: [2.55, 2.55, -3.25], rot: [0.38, -0.28, -0.22] },
    },
  },

  // Scene 3 — Formats 01–06 (each format focuses its signature 3D group cleanly)
  '3-wheel-amphora': {
    camera: [1.55, 0.24, 6.55],
    lookAt: [0.75, -0.05, 0.1],
    objects: {
      amphoraWheel: { pos: [-0.45, -0.04, 0.25], rot: [0.06, 0.0, 0.03] },
      mug:          { pos: [-3.65, -0.85, -1.25], rot: [0.06, 0.45, 0.04] },
      plate:        { pos: [2.55, -1.65, -1.45], rot: [0.26, -0.35, -0.05] },
      piala:        { pos: [2.95, 0.78, -1.35], rot: [0.12, -0.35, -0.04] },
      btn0:         { pos: [-3.85, 1.68, 1.65], rot: [0.32, 0.55, 0.16] },
      btn1:         { pos: [-3.55, -1.68, 1.75], rot: [-0.24, 0.4, -0.18] },
      btn2:         { pos: [3.85, 1.75, 1.55], rot: [0.24, -0.48, -0.14] },
      btn3:         { pos: [3.65, -1.65, 1.65], rot: [-0.3, -0.38, 0.16] },
      btn4:         { pos: [-5.25, 0.28, -0.65], rot: [0.18, 0.66, -0.1] },
      btn5:         { pos: [5.25, 0.05, -0.75], rot: [-0.2, -0.6, 0.12] },
      btn6:         { pos: [-2.45, 2.55, -3.05], rot: [0.4, 0.3, 0.22] },
      btn7:         { pos: [2.35, 2.55, -3.15], rot: [0.36, -0.3, -0.2] },
    },
  },

  '3-piala-duet': {
    camera: [2.55, 0.35, 6.25],
    lookAt: [1.65, 0.15, 0.15],
    objects: {
      amphoraWheel: { pos: [-0.85, 0.05, -0.45], rot: [0.05, 0.0, 0.03] },
      mug:          { pos: [-4.05, -0.85, -1.55], rot: [0.06, 0.42, 0.04] },
      plate:        { pos: [2.45, -1.85, -1.65], rot: [0.28, -0.35, -0.05] },
      piala:        { pos: [2.05, 0.45, 0.85], rot: [0.2, -0.45, -0.06] },
      btn0:         { pos: [-3.85, 1.68, 1.65], rot: [0.32, 0.55, 0.16] },
      btn1:         { pos: [-3.55, -1.68, 1.75], rot: [-0.24, 0.4, -0.18] },
      btn2:         { pos: [3.95, 1.78, 1.65], rot: [0.24, -0.48, -0.14] },
      btn3:         { pos: [3.75, -1.65, 1.75], rot: [-0.3, -0.38, 0.16] },
      btn4:         { pos: [-5.35, 0.28, -0.65], rot: [0.18, 0.66, -0.1] },
      btn5:         { pos: [5.25, 0.05, -0.75], rot: [-0.2, -0.6, 0.12] },
      btn6:         { pos: [-2.45, 2.55, -3.05], rot: [0.4, 0.3, 0.22] },
      btn7:         { pos: [2.35, 2.55, -3.15], rot: [0.36, -0.3, -0.2] },
    },
  },

  '3-collection': {
    camera: [1.85, 0.48, 8.25],
    lookAt: [0.85, -0.15, -0.45],
    objects: {
      amphoraWheel: { pos: [-0.45, 0.05, -0.55], rot: [0.05, 0.0, 0.02] },
      mug:          { pos: [-3.55, -0.55, 0.35], rot: [0.08, 0.62, 0.04] },
      plate:        { pos: [2.25, -1.55, 0.55], rot: [0.36, -0.25, -0.06] },
      piala:        { pos: [2.65, 0.72, 0.15], rot: [0.18, -0.35, -0.05] },
      btn0:         { pos: [-4.05, 1.78, 1.75], rot: [0.32, 0.55, 0.16] },
      btn1:         { pos: [-3.55, -1.85, 1.85], rot: [-0.24, 0.4, -0.18] },
      btn2:         { pos: [4.15, 1.85, 1.65], rot: [0.24, -0.48, -0.14] },
      btn3:         { pos: [3.95, -1.75, 1.75], rot: [-0.3, -0.38, 0.16] },
      btn4:         { pos: [-5.35, 0.35, -0.65], rot: [0.18, 0.66, -0.1] },
      btn5:         { pos: [5.35, 0.08, -0.75], rot: [-0.2, -0.6, 0.12] },
      btn6:         { pos: [-2.45, 2.65, -3.05], rot: [0.4, 0.3, 0.22] },
      btn7:         { pos: [2.45, 2.65, -3.15], rot: [0.36, -0.3, -0.2] },
    },
  },

  '3-mug-plate': {
    camera: [0.65, -0.55, 6.85],
    lookAt: [-0.25, -0.95, 0.75],
    objects: {
      amphoraWheel: { pos: [-0.45, 0.42, -2.55], rot: [0.04, 0.0, 0.03] },
      mug:          { pos: [-3.45, -0.45, 0.95], rot: [0.12, 0.58, 0.04] },
      plate:        { pos: [1.95, -1.55, 1.35], rot: [0.48, -0.28, -0.06] },
      piala:        { pos: [3.15, 0.95, -1.35], rot: [0.14, -0.32, -0.04] },
      btn0:         { pos: [-4.05, 1.72, 1.65], rot: [0.32, 0.55, 0.16] },
      btn1:         { pos: [-3.75, -1.92, 1.85], rot: [-0.24, 0.4, -0.18] },
      btn2:         { pos: [3.85, 1.75, 1.55], rot: [0.24, -0.48, -0.14] },
      btn3:         { pos: [3.85, -1.85, 1.85], rot: [-0.3, -0.38, 0.16] },
      btn4:         { pos: [-5.35, 0.28, -0.65], rot: [0.18, 0.66, -0.1] },
      btn5:         { pos: [5.25, 0.05, -0.75], rot: [-0.2, -0.6, 0.12] },
      btn6:         { pos: [-2.45, 2.65, -3.35], rot: [0.4, 0.3, 0.22] },
      btn7:         { pos: [2.35, 2.65, -3.35], rot: [0.36, -0.3, -0.2] },
    },
  },

  '3-buttons-fan': {
    camera: [0.95, 0.38, 7.55],
    lookAt: [0.15, 0.32, 1.65],
    objects: {
      amphoraWheel: { pos: [-0.35, 0.05, -3.05], rot: [0.05, 0.0, 0.02] },
      mug:          { pos: [-3.55, -0.75, -2.55], rot: [0.06, 0.4, 0.03] },
      plate:        { pos: [2.65, -1.65, -2.65], rot: [0.28, -0.32, -0.04] },
      piala:        { pos: [2.85, 0.85, -2.55], rot: [0.14, -0.3, -0.04] },
      btn0:         { pos: [-2.45, 1.32, 1.95], rot: [0.18, 0.32, 0.12] },
      btn1:         { pos: [-2.15, -1.25, 2.05], rot: [-0.18, 0.28, -0.15] },
      btn2:         { pos: [2.05, 1.32, 1.95], rot: [0.15, -0.25, -0.1] },
      btn3:         { pos: [1.95, -1.25, 2.05], rot: [-0.16, -0.22, 0.12] },
      btn4:         { pos: [-4.25, 0.18, 1.85], rot: [0.12, 0.38, -0.08] },
      btn5:         { pos: [3.25, 0.08, 1.55], rot: [-0.12, -0.38, 0.08] },
      btn6:         { pos: [-1.05, 2.15, 1.65], rot: [0.2, 0.12, 0.1] },
      btn7:         { pos: [0.85, 2.15, 1.65], rot: [0.2, -0.14, -0.1] },
    },
  },

  '3-collection-orbit': {
    camera: [2.45, 1.35, 7.85],
    lookAt: [0.65, -0.1, -0.35],
    objects: {
      amphoraWheel: { pos: [-0.25, 0.02, -0.35], rot: [0.06, 0.0, 0.03] },
      mug:          { pos: [-3.45, 0.15, 0.65], rot: [0.14, 0.75, -0.05] },
      plate:        { pos: [2.25, -1.55, 0.75], rot: [0.42, -0.42, 0.08] },
      piala:        { pos: [2.85, 0.78, 0.45], rot: [0.16, -0.5, -0.08] },
      btn0:         { pos: [-3.95, 1.75, 1.75], rot: [0.35, 0.55, 0.18] },
      btn1:         { pos: [-3.55, -1.75, 1.85], rot: [-0.28, 0.42, -0.2] },
      btn2:         { pos: [4.05, 1.82, 1.65], rot: [0.25, -0.5, -0.15] },
      btn3:         { pos: [3.85, -1.65, 1.75], rot: [-0.3, -0.4, 0.18] },
      btn4:         { pos: [-5.25, -0.25, -0.65], rot: [0.2, 0.65, -0.1] },
      btn5:         { pos: [5.25, 0.25, -0.75], rot: [-0.2, -0.62, 0.14] },
      btn6:         { pos: [-2.35, 2.65, -2.95], rot: [0.4, 0.28, 0.2] },
      btn7:         { pos: [2.35, 2.65, -2.95], rot: [0.36, -0.32, -0.2] },
    },
  },

  // Scene 4 — Contacts (Overhead-diagonal pullback over the grand arc of the entire collection)
  4: {
    camera: [0.95, 3.35, 7.85],
    lookAt: [0.0, -0.35, -1.15],
    objects: {
      amphoraWheel: { pos: [0.0, 0.25, -1.55], rot: [0.08, 0.0, 0.02] },
      mug:          { pos: [-3.25, -0.05, -0.75], rot: [0.12, 0.65, 0.04] },
      plate:        { pos: [2.45, -1.35, -0.45], rot: [0.28, -0.42, -0.05] },
      piala:        { pos: [3.05, 0.72, -0.55], rot: [0.14, -0.35, -0.04] },
      btn0:         { pos: [-3.95, 1.65, 1.55], rot: [0.32, 0.5, 0.15] },
      btn1:         { pos: [-3.25, -1.55, 1.65], rot: [-0.22, 0.38, -0.18] },
      btn2:         { pos: [3.95, 1.65, 1.55], rot: [0.26, -0.48, -0.14] },
      btn3:         { pos: [3.55, -1.55, 1.65], rot: [-0.28, -0.38, 0.16] },
      btn4:         { pos: [-5.15, 0.35, -1.25], rot: [0.18, 0.62, -0.1] },
      btn5:         { pos: [5.15, 0.35, -1.25], rot: [-0.18, -0.62, 0.12] },
      btn6:         { pos: [-2.45, 2.55, -3.25], rot: [0.42, 0.26, 0.22] },
      btn7:         { pos: [2.45, 2.55, -3.25], rot: [0.38, -0.28, -0.22] },
    },
  },
};

export function resolvePose(activeScene, formatKey, isPortrait) {
  const poseKey =
    activeScene === 3 ? `3-${formatKey || 'wheel-amphora'}` : activeScene;
  const base = SCENE_POSES[poseKey] || SCENE_POSES[0];

  if (!isPortrait) {
    return base;
  }

  // Portrait adaptation (aspect < 0.75, e.g. 390x844):
  // Pull camera further back and adjust X so the 3D composition fits comfortably without edge clipping.
  if (activeScene === 1) {
    return {
      camera: [-0.55, 0.55, 10.85],
      lookAt: [-0.65, -0.35, -0.2],
      objects: base.objects,
    };
  }
  if (activeScene === 3) {
    return {
      camera: [base.camera[0] * 0.25, base.camera[1] + 0.35, base.camera[2] * 1.54],
      lookAt: [base.lookAt[0] * 0.25, base.lookAt[1] - 0.15, base.lookAt[2]],
      objects: base.objects,
    };
  }
  if (activeScene === 4) {
    return {
      camera: [0.0, 4.05, 11.65],
      lookAt: [0.0, -0.25, -1.15],
      objects: base.objects,
    };
  }
  return {
    camera: [base.camera[0] * 0.5, base.camera[1] + 0.12, base.camera[2] * 1.58],
    lookAt: [base.lookAt[0] * 0.5, base.lookAt[1], base.lookAt[2]],
    objects: base.objects,
  };
}
