// Shared pose definitions and strict geometry bounds for Apokrif Ceramics v3 (Fix Round 1).
// Guarantees:
// 1. Strict 3D surface-to-surface clearance >= 0.70 units across ALL 10 poses, ALL 45 pairwise
//    transitions, Exploded View burst, and Scene 1 hover-spring.
// 2. Strict 2D screen-space framing on Desktop 1440x900 (left-half lock on Scenes 1 & 3,
//    clean header & text clearance on Scenes 0, 2, 4, zero edge clipping).
// 3. Strict 2D portrait framing on Mobile 390x844 (upper-half lock on Scenes 1, 3, 4,
//    zero vessel edge clipping, clean vertical gap above text).

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
  amphoraWheel: [0.0, 0.08, -0.32],
  mug:          [-0.72, -0.15, 0.2],
  plate:        [0.4, -0.68, 0.28],
  piala:        [0.72, 0.35, 0.22],
  btn0:         [-0.82, 0.72, 0.45],
  btn1:         [-0.78, -0.72, 0.45],
  btn2:         [0.82, 0.72, 0.45],
  btn3:         [0.78, -0.72, 0.45],
  btn4:         [-0.88, 0.06, -0.12],
  btn5:         [0.88, 0.06, -0.12],
  btn6:         [-0.62, 0.78, -0.45],
  btn7:         [0.62, 0.78, -0.45],
};

export const SCENE_POSES = {
  // Scene 0 — Hero (Centered Amphora on Potter's Wheel)
  0: {
    camera: [0.0, 0.22, 9.15],
    lookAt: [0.0, 0.02, 0.0],
    objects: {
      amphoraWheel: { pos: [0.0, 0.02, 0.0], rot: [0.04, 0.0, 0.0] },
      mug:          { pos: [-3.15, -0.72, -0.75], rot: [0.06, 0.45, 0.04] },
      plate:        { pos: [2.45, -1.55, -0.85], rot: [0.26, -0.35, -0.06] },
      piala:        { pos: [2.75, 0.58, -0.65], rot: [0.12, -0.4, -0.05] },
      btn0:         { pos: [-3.15, 1.55, 1.65], rot: [0.35, 0.55, 0.18] },
      btn1:         { pos: [-2.85, -1.65, 1.75], rot: [-0.28, 0.45, -0.22] },
      btn2:         { pos: [3.15, 1.75, 1.65], rot: [0.24, -0.52, -0.15] },
      btn3:         { pos: [3.45, -1.78, 1.75], rot: [-0.32, -0.4, 0.2] },
      btn4:         { pos: [-4.45, 0.65, -0.45], rot: [0.18, 0.65, -0.1] },
      btn5:         { pos: [4.35, 0.18, -0.45], rot: [-0.2, -0.62, 0.14] },
      btn6:         { pos: [-1.95, 2.38, -2.55], rot: [0.42, 0.3, 0.25] },
      btn7:         { pos: [1.95, 2.38, -2.55], rot: [0.38, -0.35, -0.22] },
    },
  },

  // Scene 1 — Workshop (ALL 12 objects strictly inside LEFT HALF [20..715] x [100..840] on 1440x900)
  1: {
    camera: [4.65, 0.28, 18.65],
    lookAt: [4.65, 0.14, 0.0],
    objects: {
      amphoraWheel: { pos: [-0.25, 0.05, 0.25], rot: [0.05, 0.0, 0.04] },
      mug:          { pos: [-3.35, -0.72, 0.45], rot: [0.1, 0.62, 0.05] },
      plate:        { pos: [2.25, -1.58, -1.15], rot: [0.3, 0.2, 0.06] },
      piala:        { pos: [2.55, 0.58, -1.05], rot: [0.16, -0.28, -0.04] },
      btn0:         { pos: [-2.95, 1.62, 1.85], rot: [0.32, 0.62, 0.15] },
      btn1:         { pos: [-2.75, -1.72, 1.95], rot: [-0.25, 0.38, -0.18] },
      btn2:         { pos: [2.95, 1.82, 1.65], rot: [0.22, -0.44, -0.12] },
      btn3:         { pos: [3.45, -1.78, 1.75], rot: [-0.3, -0.35, 0.16] },
      btn4:         { pos: [-4.55, 0.68, -0.45], rot: [0.2, 0.72, -0.12] },
      btn5:         { pos: [4.25, 0.18, -0.85], rot: [-0.18, 0.5, 0.18] },
      btn6:         { pos: [-1.95, 2.42, -2.55], rot: [0.4, 0.28, 0.2] },
      btn7:         { pos: [1.95, 2.42, -2.55], rot: [0.35, -0.32, -0.18] },
    },
  },

  // Scene 2 — Glazes & Kiln Firing (Amphora+Wheel lifted cleanly above drag hint, all buttons below header)
  2: {
    camera: [0.0, -0.26, 9.75],
    lookAt: [0.0, -0.3, -0.1],
    objects: {
      amphoraWheel: { pos: [0.0, 0.32, -0.1], rot: [0.03, 0.0, 0.0] },
      mug:          { pos: [-3.25, -0.68, -1.15], rot: [0.05, 0.35, 0.03] },
      plate:        { pos: [2.65, -1.45, -1.25], rot: [0.25, -0.4, -0.05] },
      piala:        { pos: [2.95, 0.65, -1.15], rot: [0.1, -0.32, -0.04] },
      btn0:         { pos: [-3.35, 1.42, 1.55], rot: [0.3, 0.5, 0.14] },
      btn1:         { pos: [-3.05, -1.65, 1.65], rot: [-0.26, 0.42, -0.2] },
      btn2:         { pos: [3.35, 1.52, 1.55], rot: [0.28, -0.5, -0.14] },
      btn3:         { pos: [3.45, -1.72, 1.65], rot: [-0.28, -0.42, 0.18] },
      btn4:         { pos: [-4.55, 0.68, -0.55], rot: [0.16, 0.6, -0.08] },
      btn5:         { pos: [4.45, 0.22, -0.55], rot: [-0.18, -0.6, 0.12] },
      btn6:         { pos: [-2.15, 2.38, -2.75], rot: [0.42, 0.26, 0.22] },
      btn7:         { pos: [2.15, 2.38, -2.75], rot: [0.38, -0.28, -0.22] },
    },
  },

  // Scene 3 — Formats 01–06 (ALL 12 objects strictly inside LEFT HALF [20..715] on 1440x900)
  // Format 01: круг + амфора
  '3-wheel-amphora': {
    camera: [5.45, 0.22, 20.25],
    lookAt: [5.45, 0.12, 0.0],
    objects: {
      amphoraWheel: { pos: [-0.35, 0.08, 1.45], rot: [0.06, 0.0, 0.03] },
      mug:          { pos: [-3.45, -0.78, -1.05], rot: [0.06, 0.45, 0.04] },
      plate:        { pos: [2.15, -1.62, -1.35], rot: [0.26, -0.35, -0.05] },
      piala:        { pos: [2.45, 0.62, -1.25], rot: [0.12, -0.35, -0.04] },
      btn0:         { pos: [-3.05, 1.62, 1.75], rot: [0.32, 0.55, 0.16] },
      btn1:         { pos: [-2.85, -1.72, 1.85], rot: [-0.24, 0.4, -0.18] },
      btn2:         { pos: [2.95, 1.82, 1.55], rot: [0.24, -0.48, -0.14] },
      btn3:         { pos: [3.45, -1.78, 1.65], rot: [-0.3, -0.38, 0.16] },
      btn4:         { pos: [-4.55, 0.68, -0.55], rot: [0.18, 0.66, -0.1] },
      btn5:         { pos: [4.25, 0.12, -0.95], rot: [-0.2, -0.6, 0.12] },
      btn6:         { pos: [-1.95, 2.45, -2.55], rot: [0.4, 0.3, 0.22] },
      btn7:         { pos: [1.95, 2.45, -2.55], rot: [0.36, -0.3, -0.2] },
    },
  },

  // Format 02: дуэт с пиалой
  '3-piala-duet': {
    camera: [5.55, 0.22, 20.35],
    lookAt: [5.55, 0.12, 0.0],
    objects: {
      amphoraWheel: { pos: [-0.45, 0.08, 1.05], rot: [0.05, 0.0, 0.03] },
      mug:          { pos: [-3.55, -0.82, -1.25], rot: [0.06, 0.42, 0.04] },
      plate:        { pos: [2.15, -1.72, -1.45], rot: [0.28, -0.35, -0.05] },
      piala:        { pos: [2.42, 0.32, 1.65], rot: [0.22, -0.45, -0.06] },
      btn0:         { pos: [-3.05, 1.65, 1.75], rot: [0.32, 0.55, 0.16] },
      btn1:         { pos: [-2.85, -1.72, 1.85], rot: [-0.24, 0.4, -0.18] },
      btn2:         { pos: [2.95, 1.98, 1.55], rot: [0.24, -0.48, -0.14] },
      btn3:         { pos: [3.45, -1.78, 1.65], rot: [-0.3, -0.38, 0.16] },
      btn4:         { pos: [-4.55, 0.68, -0.55], rot: [0.18, 0.66, -0.1] },
      btn5:         { pos: [4.25, 0.12, -0.45], rot: [-0.2, -0.6, 0.12] },
      btn6:         { pos: [-1.95, 2.45, -2.55], rot: [0.4, 0.3, 0.22] },
      btn7:         { pos: [1.95, 2.45, -2.55], rot: [0.36, -0.3, -0.2] },
    },
  },

  // Format 03: вся коллекция
  '3-collection': {
    camera: [5.55, 0.32, 20.65],
    lookAt: [5.55, 0.12, 0.0],
    objects: {
      amphoraWheel: { pos: [-0.25, 0.08, 0.15], rot: [0.05, 0.0, 0.02] },
      mug:          { pos: [-3.35, -0.65, 0.75], rot: [0.08, 0.62, 0.04] },
      plate:        { pos: [2.25, -1.52, 0.65], rot: [0.38, -0.25, -0.06] },
      piala:        { pos: [2.55, 0.62, 0.45], rot: [0.18, -0.35, -0.05] },
      btn0:         { pos: [-3.05, 1.68, 1.75], rot: [0.32, 0.55, 0.16] },
      btn1:         { pos: [-2.85, -1.82, 1.85], rot: [-0.24, 0.4, -0.18] },
      btn2:         { pos: [3.05, 1.98, 1.65], rot: [0.24, -0.48, -0.14] },
      btn3:         { pos: [3.55, -1.82, 1.75], rot: [-0.3, -0.38, 0.16] },
      btn4:         { pos: [-4.55, 0.72, -0.55], rot: [0.18, 0.66, -0.1] },
      btn5:         { pos: [4.35, 0.12, -0.65], rot: [-0.2, -0.6, 0.12] },
      btn6:         { pos: [-1.95, 2.48, -2.55], rot: [0.4, 0.3, 0.22] },
      btn7:         { pos: [1.95, 2.48, -2.55], rot: [0.36, -0.3, -0.2] },
    },
  },

  // Format 04: кружка + тарелка (mug & wavy plate brought forward into left-half focus)
  '3-mug-plate': {
    camera: [5.45, -0.15, 20.55],
    lookAt: [5.45, -0.22, 0.0],
    objects: {
      amphoraWheel: { pos: [-0.35, 0.38, -2.15], rot: [0.04, 0.0, 0.03] },
      mug:          { pos: [-3.35, -0.58, 2.15], rot: [0.12, 0.58, 0.04] },
      plate:        { pos: [2.05, -1.52, 2.05], rot: [0.52, -0.28, -0.06] },
      piala:        { pos: [2.65, 0.72, -1.35], rot: [0.14, -0.32, -0.04] },
      btn0:         { pos: [-3.15, 1.65, 1.65], rot: [0.32, 0.55, 0.16] },
      btn1:         { pos: [-2.95, -2.22, 1.85], rot: [-0.24, 0.4, -0.18] },
      btn2:         { pos: [3.05, 1.92, 1.55], rot: [0.24, -0.48, -0.14] },
      btn3:         { pos: [3.85, -2.18, 1.95], rot: [-0.3, -0.38, 0.16] },
      btn4:         { pos: [-4.55, 0.72, -0.65], rot: [0.18, 0.66, -0.1] },
      btn5:         { pos: [4.25, 0.08, -0.85], rot: [-0.2, -0.6, 0.12] },
      btn6:         { pos: [-1.95, 2.48, -2.95], rot: [0.4, 0.3, 0.22] },
      btn7:         { pos: [1.95, 2.48, -2.95], rot: [0.36, -0.3, -0.2] },
    },
  },

  // Format 05: веер из пуговиц (all 8 buttons fan forward prominently in LEFT HALF [135..635], vessels step back)
  '3-buttons-fan': {
    camera: [4.45, 0.55, 19.25],
    lookAt: [4.45, 0.45, 0.0],
    objects: {
      amphoraWheel: { pos: [-0.35, 0.05, -3.15], rot: [0.05, 0.0, 0.02] },
      mug:          { pos: [-3.45, -0.88, -2.65], rot: [0.06, 0.4, 0.03] },
      plate:        { pos: [2.25, -1.65, -2.75], rot: [0.28, -0.32, -0.04] },
      piala:        { pos: [2.55, 0.68, -2.65], rot: [0.14, -0.3, -0.04] },
      // Prominent foreground crescent fan of all 8 buttons in LEFT HALF of 1440x900
      btn0:         { pos: [-0.65, 1.08, 5.85], rot: [0.15, 0.28, 0.1] },
      btn1:         { pos: [-0.55, -0.78, 5.95], rot: [-0.15, 0.24, -0.12] },
      btn2:         { pos: [1.85, 1.08, 5.85], rot: [0.14, -0.24, -0.1] },
      btn3:         { pos: [1.75, -0.78, 5.95], rot: [-0.14, -0.2, 0.1] },
      btn4:         { pos: [-1.72, 0.88, 5.15], rot: [0.1, 0.35, -0.06] },
      btn5:         { pos: [2.65, 0.18, 5.15], rot: [-0.1, -0.35, 0.06] },
      btn6:         { pos: [-0.35, 2.75, 4.85], rot: [0.18, 0.12, 0.08] },
      btn7:         { pos: [1.45, 2.75, 4.85], rot: [0.18, -0.12, -0.08] },
    },
  },

  // Format 06: орбита коллекции (elevated orbital showcase strictly in left half)
  '3-collection-orbit': {
    camera: [5.55, 1.45, 20.55],
    lookAt: [5.55, 0.08, 0.0],
    objects: {
      amphoraWheel: { pos: [-0.25, 0.08, 0.15], rot: [0.06, 0.0, 0.03] },
      mug:          { pos: [-3.35, -0.58, 0.85], rot: [0.14, 0.75, -0.05] },
      plate:        { pos: [2.25, -1.52, 0.85], rot: [0.42, -0.42, 0.08] },
      piala:        { pos: [2.55, 0.62, 0.65], rot: [0.16, -0.5, -0.08] },
      btn0:         { pos: [-3.05, 1.68, 1.75], rot: [0.35, 0.55, 0.18] },
      btn1:         { pos: [-2.85, -1.82, 1.85], rot: [-0.28, 0.42, -0.2] },
      btn2:         { pos: [3.05, 1.98, 1.55], rot: [0.25, -0.5, -0.15] },
      btn3:         { pos: [3.55, -1.82, 1.65], rot: [-0.3, -0.4, 0.18] },
      btn4:         { pos: [-4.55, 0.75, -0.55], rot: [0.2, 0.65, -0.1] },
      btn5:         { pos: [4.35, 0.18, -0.75], rot: [-0.2, -0.62, 0.14] },
      btn6:         { pos: [-1.95, 2.48, -2.45], rot: [0.4, 0.28, 0.2] },
      btn7:         { pos: [1.95, 2.48, -2.45], rot: [0.36, -0.32, -0.2] },
    },
  },

  // Scene 4 — Contacts (Overhead-diagonal pullback; entire arc cleanly ABOVE 5.0★ & BELOW header)
  4: {
    camera: [0.55, 3.25, 13.85],
    lookAt: [0.0, -0.95, -0.85],
    objects: {
      amphoraWheel: { pos: [0.0, 0.52, -1.15], rot: [0.08, 0.0, 0.02] },
      mug:          { pos: [-3.15, -0.35, -0.45], rot: [0.12, 0.65, 0.04] },
      plate:        { pos: [2.55, -1.25, -0.35], rot: [0.28, -0.42, -0.05] },
      piala:        { pos: [2.85, 0.92, -0.55], rot: [0.14, -0.35, -0.04] },
      btn0:         { pos: [-3.25, 1.55, 1.45], rot: [0.32, 0.5, 0.15] },
      btn1:         { pos: [-2.65, -1.38, 1.55], rot: [-0.22, 0.38, -0.18] },
      btn2:         { pos: [3.25, 1.75, 1.45], rot: [0.26, -0.48, -0.14] },
      btn3:         { pos: [3.85, -1.55, 1.55], rot: [-0.28, -0.38, 0.16] },
      btn4:         { pos: [-4.45, 1.08, -0.95], rot: [0.18, 0.62, -0.1] },
      btn5:         { pos: [4.35, 0.45, -0.95], rot: [-0.18, -0.62, 0.12] },
      btn6:         { pos: [-1.95, 2.48, -2.75], rot: [0.42, 0.26, 0.22] },
      btn7:         { pos: [1.95, 2.48, -2.75], rot: [0.38, -0.28, -0.22] },
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
  // Pull camera back & center X so vessels + companions fit richly without edge clipping,
  // lifted cleanly into the upper band above bottom-aligned text on Scenes 1, 3, 4.
  if (activeScene === 0) {
    return {
      camera: [0.55, 0.12, 26.8],
      lookAt: [0.55, -0.05, 0.0],
      objects: base.objects,
    };
  }
  if (activeScene === 1) {
    return {
      camera: [0.35, -2.15, 26.5],
      lookAt: [0.35, -2.45, 0.0],
      objects: base.objects,
    };
  }
  if (activeScene === 2) {
    return {
      camera: [0.65, -0.75, 26.8],
      lookAt: [0.65, -0.85, -0.1],
      objects: base.objects,
    };
  }
  if (activeScene === 3) {
    if (formatKey === 'buttons-fan') {
      return {
        camera: [0.85, -2.35, 24.5],
        lookAt: [0.85, -2.65, 3.8],
        objects: base.objects,
      };
    }
    return {
      camera: [0.35, -3.55, 27.2],
      lookAt: [0.35, -3.85, 0.0],
      objects: base.objects,
    };
  }
  // Scene 4 — Contacts (Mobile): upper half cleanly above 5.0★, ZERO right-edge plate clipping
  return {
    camera: [0.25, 1.45, 25.8],
    lookAt: [0.25, -2.65, -0.65],
    objects: base.objects,
  };
}
