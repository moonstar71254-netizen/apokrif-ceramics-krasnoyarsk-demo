import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import KilnStage from './scene/KilnStage';
import { buildWhatsappLink, getSiteConfig } from './config';

gsap.registerPlugin(Observer);
gsap.ticker.lagSmoothing(0);

const NAV_SCENES = [
  { id: 0, label: 'Вход', num: '01' },
  { id: 1, label: 'Мастерская', num: '02' },
  { id: 2, label: 'Глазури', num: '03' },
  { id: 3, label: 'Форматы', num: '04' },
  { id: 4, label: 'Контакты', num: '05' },
];

const GLAZE_UI = [
  {
    id: 'chamotte',
    label: 'Тёмный шамот',
    swatch: '#7B503A',
    bgDeep: '#0C0907',
    accent: '#D48350',
    glowTint: 'rgba(212, 131, 80, 0.22)',
  },
  {
    id: 'porcelain',
    label: 'Молочный фарфор',
    swatch: '#EFE6D9',
    bgDeep: '#151311',
    accent: '#E8DDD0',
    glowTint: 'rgba(244, 237, 228, 0.18)',
  },
  {
    id: 'copper',
    label: 'Медная печь',
    swatch: '#CC7139',
    bgDeep: '#120A07',
    accent: '#E58E4B',
    glowTint: 'rgba(229, 142, 75, 0.26)',
  },
];

function animateSceneExit(outSec, fromIdx, toIdx, dir, tl) {
  const pair = `${Math.min(fromIdx, toIdx)}-${Math.max(fromIdx, toIdx)}`;
  const items = Array.from(outSec.querySelectorAll('[data-anim]'));
  const masks = Array.from(outSec.querySelectorAll('[data-mask-inner]'));

  tl.set(outSec, { pointerEvents: 'none' }, 0);

  // 1 <-> 2: Split Horizontal (top & bottom Hero split along X in opposite directions)
  if (pair === '0-1') {
    items.forEach((el, i) => {
      const kind = el.dataset.anim;
      const x =
        kind === 'split-top'
          ? -dir * 96
          : kind === 'split-bottom'
            ? dir * 96
            : dir * -64;
      tl.to(el, { autoAlpha: 0, x, y: 0, duration: 0.28, ease: 'power2.in' }, i * 0.015);
    });
  }
  // 2 <-> 3: Orbital 85° Sweep + counter-directional top heading & bottom controls
  else if (pair === '1-2') {
    items.forEach((el, i) => {
      const kind = el.dataset.anim;
      const y = kind === 'top' ? -dir * 48 : kind === 'bottom' ? dir * 48 : 0;
      const x = kind === 'right' ? dir * -64 : 0;
      tl.to(el, { autoAlpha: 0, x, y, duration: 0.26, ease: 'power2.in' }, i * 0.015);
    });
  }
  // 3 <-> 4: Exploded View + cascading exit of rows 01–06
  else if (pair === '2-3') {
    const ordered = dir < 0 ? [...items].reverse() : items;
    ordered.forEach((el, i) => {
      const kind = el.dataset.anim;
      const x = kind === 'row' ? dir * -44 : 0;
      const y = kind === 'top' ? -dir * 36 : kind === 'bottom' ? dir * 36 : dir * -20;
      tl.to(el, { autoAlpha: 0, x, y, duration: 0.22, ease: 'power2.in' }, i * 0.018);
    });
  }
  // 4 <-> 5: Overhead Pullback + overflow-hidden mask exit
  else if (pair === '3-4') {
    if (masks.length > 0) {
      masks.forEach((el, i) => {
        tl.to(el, { yPercent: -dir * 108, duration: 0.26, ease: 'power2.in' }, i * 0.02);
      });
    }
    items.forEach((el, i) => {
      tl.to(el, { autoAlpha: 0, y: -dir * 28, duration: 0.24, ease: 'power2.in' }, i * 0.014);
    });
  } else {
    items.forEach((el, i) => {
      tl.to(el, { autoAlpha: 0, y: -dir * 26, duration: 0.24, ease: 'power2.in' }, i * 0.014);
    });
  }

  tl.to(outSec, { autoAlpha: 0, duration: 0.26, ease: 'power2.in' }, 0.04);
}

function animateSceneEnter(inSec, fromIdx, toIdx, dir, tl) {
  const pair = `${Math.min(fromIdx, toIdx)}-${Math.max(fromIdx, toIdx)}`;
  const items = Array.from(inSec.querySelectorAll('[data-anim]'));
  const masks = Array.from(inSec.querySelectorAll('[data-mask-inner]'));

  tl.set(inSec, { autoAlpha: 1 }, 0.24);

  // 1 <-> 2: Split Horizontal
  if (pair === '0-1') {
    items.forEach((el, i) => {
      const kind = el.dataset.anim;
      const fromX =
        kind === 'split-top'
          ? dir * 96
          : kind === 'split-bottom'
            ? -dir * 96
            : dir * 68;
      tl.fromTo(
        el,
        { autoAlpha: 0, x: fromX, y: 0 },
        { autoAlpha: 1, x: 0, y: 0, duration: 0.54, ease: 'power3.out' },
        0.24 + i * 0.05
      );
    });
  }
  // 2 <-> 3: Orbital 85° Sweep + opposing top/bottom enter
  else if (pair === '1-2') {
    items.forEach((el, i) => {
      const kind = el.dataset.anim;
      const fromY = kind === 'top' ? -dir * 48 : kind === 'bottom' ? dir * 48 : 0;
      const fromX = kind === 'right' ? dir * 64 : 0;
      tl.fromTo(
        el,
        { autoAlpha: 0, x: fromX, y: fromY },
        { autoAlpha: 1, x: 0, y: 0, duration: 0.54, ease: 'power3.out' },
        0.26 + i * 0.055
      );
    });
  }
  // 3 <-> 4: Exploded View + cascading 01–06 rows
  else if (pair === '2-3') {
    const ordered = dir < 0 ? [...items].reverse() : items;
    ordered.forEach((el, i) => {
      const kind = el.dataset.anim;
      const fromX = kind === 'row' ? dir * 46 : 0;
      const fromY = kind === 'top' ? -dir * 32 : kind === 'bottom' ? dir * 32 : dir * 18;
      tl.fromTo(
        el,
        { autoAlpha: 0, x: fromX, y: fromY },
        { autoAlpha: 1, x: 0, y: 0, duration: 0.48, ease: 'power3.out' },
        0.25 + i * 0.042
      );
    });
  }
  // 4 <-> 5: Overhead Pullback + overflow-hidden mask reveal
  else if (pair === '3-4') {
    if (masks.length > 0) {
      masks.forEach((el, i) => {
        tl.fromTo(
          el,
          { yPercent: dir * 108 },
          { yPercent: 0, duration: 0.62, ease: 'power3.out' },
          0.26 + i * 0.055
        );
      });
    }
    items.forEach((el, i) => {
      tl.fromTo(
        el,
        { autoAlpha: 0, x: 0, y: masks.length > 0 ? 0 : dir * 26 },
        { autoAlpha: 1, x: 0, y: 0, duration: 0.52, ease: 'power3.out' },
        0.26 + i * 0.045
      );
    });
  } else {
    if (masks.length > 0) {
      tl.set(masks, { yPercent: 0 }, 0.24);
    }
    items.forEach((el, i) => {
      tl.fromTo(
        el,
        { autoAlpha: 0, x: 0, y: dir * 26 },
        { autoAlpha: 1, x: 0, y: 0, duration: 0.48, ease: 'power3.out' },
        0.24 + i * 0.045
      );
    });
  }
}

export default function App() {
  const config = useMemo(() => getSiteConfig(), []);
  const [activeScene, setActiveScene] = useState(0);
  const [prevScene, setPrevScene] = useState(0);
  const [transitionTick, setTransitionTick] = useState(0);
  const [glazeKey, setGlazeKey] = useState('chamotte');
  const [firingTemp, setFiringTemp] = useState(1060);
  const [selectedFormatIdx, setSelectedFormatIdx] = useState(0);
  const [isDraggingGlaze, setIsDraggingGlaze] = useState(false);

  const activeSceneRef = useRef(0);
  const lastNavTimeRef = useRef(0);
  const sectionRefs = useRef([]);
  const transitionTlRef = useRef(null);

  // Shared live refs for WebGL
  const pointerRef = useRef({ x: 0, y: 0 });
  const lastMouseXRef = useRef(null);
  const wheelSpinRef = useRef({ isDragging: false, velocity: 0 });
  const dragStateRef = useRef({ isDragging: false, velX: 0, velY: 0 });
  const dragTrackRef = useRef({
    active: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0,
    mode: null,
  });

  const activeFormat = config.formats[selectedFormatIdx] || config.formats[0];
  const formatKey = activeFormat?.focus || 'wheel-amphora';

  // Initialize scene visibility cleanly on mount
  useEffect(() => {
    sectionRefs.current.forEach((sec, idx) => {
      if (!sec) return;
      gsap.set(sec, { autoAlpha: idx === 0 ? 1 : 0 });
      const items = sec.querySelectorAll('[data-anim]');
      if (idx === 0) {
        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.06, ease: 'power3.out' }
        );
      } else {
        gsap.set(items, { autoAlpha: 0 });
      }
    });
  }, []);

  // Animate CSS theme variables smoothly over 600ms on glaze change
  useEffect(() => {
    const theme = GLAZE_UI.find((g) => g.id === glazeKey) || GLAZE_UI[0];
    const root = document.documentElement;
    gsap.to(root, {
      '--bg-deep': theme.bgDeep,
      '--accent': theme.accent,
      '--glow-tint': theme.glowTint,
      duration: 0.6,
      ease: 'power2.inOut',
      overwrite: 'auto',
    });
  }, [glazeKey]);

  // Pointer parallax + Scene 0 mouse-motion potter's wheel spin impulse
  useEffect(() => {
    const onPointerMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      pointerRef.current.x = nx;
      pointerRef.current.y = ny;

      // On Scene 0, moving mouse horizontally gently spins the potter's wheel with inertia
      if (activeSceneRef.current === 0 && e.pointerType === 'mouse') {
        if (lastMouseXRef.current !== null) {
          const dx = e.clientX - lastMouseXRef.current;
          wheelSpinRef.current.velocity += gsap.utils.clamp(-0.028, 0.028, dx * 0.00055);
        }
        lastMouseXRef.current = e.clientX;
      } else {
        lastMouseXRef.current = null;
      }
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  // Scene navigation with 480ms cooldown (force = true for direct clicks on header & .chapter-rail)
  const goToScene = useCallback((nextIdx, force = false) => {
    const target = Math.max(0, Math.min(NAV_SCENES.length - 1, nextIdx));
    const current = activeSceneRef.current;
    if (target === current) return;

    const now = performance.now();
    if (!force && now - lastNavTimeRef.current < 480) return;
    lastNavTimeRef.current = now;

    const dir = target > current ? 1 : -1;
    activeSceneRef.current = target;
    setPrevScene(current);
    setActiveScene(target);
    setTransitionTick((n) => n + 1);

    if (transitionTlRef.current) {
      transitionTlRef.current.kill();
    }

    const outSec = sectionRefs.current[current];
    const inSec = sectionRefs.current[target];
    const tl = gsap.timeline();
    transitionTlRef.current = tl;

    if (outSec) animateSceneExit(outSec, current, target, dir, tl);
    if (inSec) animateSceneEnter(inSec, current, target, dir, tl);
  }, []);

  // GSAP Observer strictly 'wheel,touch' (NO 'pointer' so text selection never scrolls scenes)
  useEffect(() => {
    const observer = Observer.create({
      type: 'wheel,touch',
      wheelSpeed: 1,
      tolerance: 18,
      preventDefault: true,
      onDown: (self) => {
        if (dragStateRef.current.isDragging || wheelSpinRef.current.isDragging) return;
        if (self.event?.target?.closest?.('input[type="range"]')) return;
        goToScene(activeSceneRef.current + 1, false);
      },
      onUp: (self) => {
        if (dragStateRef.current.isDragging || wheelSpinRef.current.isDragging) return;
        if (self.event?.target?.closest?.('input[type="range"]')) return;
        goToScene(activeSceneRef.current - 1, false);
      },
    });

    const onKeyDown = (e) => {
      if (e.target?.tagName === 'INPUT') return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goToScene(activeSceneRef.current + 1, false);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToScene(activeSceneRef.current - 1, false);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToScene(0, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToScene(NAV_SCENES.length - 1, true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      observer.kill();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [goToScene]);

  // Scene 0: Drag-to-spin potter's wheel on center zone
  const handleWheelDragDown = useCallback((e) => {
    if (activeSceneRef.current !== 0) return;
    dragTrackRef.current = {
      active: true,
      pointerId: e.pointerId,
      lastX: e.clientX,
      lastY: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      mode: e.pointerType === 'mouse' ? 'wheel' : null,
    };
    if (e.pointerType === 'mouse') {
      wheelSpinRef.current.isDragging = true;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
  }, []);

  const handleWheelDragMove = useCallback((e) => {
    const track = dragTrackRef.current;
    if (!track.active || track.pointerId !== e.pointerId) return;

    if (!track.mode) {
      const adx = Math.abs(e.clientX - track.startX);
      const ady = Math.abs(e.clientY - track.startY);
      if (adx < 6 && ady < 6) return;
      if (adx > ady) {
        track.mode = 'wheel';
        wheelSpinRef.current.isDragging = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } else {
        track.mode = 'scroll';
        return;
      }
    }

    if (track.mode === 'wheel') {
      const dx = e.clientX - track.lastX;
      track.lastX = e.clientX;
      wheelSpinRef.current.velocity = dx * 0.011;
    }
  }, []);

  const handleWheelDragEnd = useCallback((e) => {
    const track = dragTrackRef.current;
    if (!track.active || track.pointerId !== e.pointerId) return;
    track.active = false;
    track.mode = null;
    wheelSpinRef.current.isDragging = false;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  // Scene 2: Free X/Y drag-to-rotate amphora with inertia
  const handleGlazePointerDown = useCallback((e) => {
    if (activeSceneRef.current !== 2) return;
    dragTrackRef.current = {
      active: true,
      pointerId: e.pointerId,
      lastX: e.clientX,
      lastY: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      mode: 'glaze',
    };
    dragStateRef.current.isDragging = true;
    setIsDraggingGlaze(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, []);

  const handleGlazePointerMove = useCallback((e) => {
    const track = dragTrackRef.current;
    if (!track.active || track.pointerId !== e.pointerId || track.mode !== 'glaze') return;

    const dx = e.clientX - track.lastX;
    const dy = e.clientY - track.lastY;
    track.lastX = e.clientX;
    track.lastY = e.clientY;
    dragStateRef.current.velY = dx * 0.0085;
    dragStateRef.current.velX = dy * 0.0065;
  }, []);

  const handleGlazePointerEnd = useCallback((e) => {
    const track = dragTrackRef.current;
    if (!track.active || track.pointerId !== e.pointerId) return;
    track.active = false;
    track.mode = null;
    dragStateRef.current.isDragging = false;
    setIsDraggingGlaze(false);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  const heroWhatsapp = buildWhatsappLink(
    config.whatsappUrl,
    'Здравствуйте, Катя! Хочу записаться в мастерскую «Апокриф».'
  );
  const formatWhatsapp = buildWhatsappLink(
    config.whatsappUrl,
    `Здравствуйте, Катя! Интересует формат «${activeFormat.title}» в мастерской «Апокриф».`
  );

  return (
    <div className="app-shell">
      <div className="ambient-glow" aria-hidden="true" />

      <KilnStage
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

      {/* Editorial Top Header */}
      <header className="site-header">
        <button
          type="button"
          className="brand-mark"
          onClick={() => goToScene(0, true)}
          aria-label="Перейти на первый экран"
        >
          {config.brand}
        </button>

        <nav className="header-nav" aria-label="Навигация по разделам">
          {NAV_SCENES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`header-nav-link ${activeScene === item.id ? 'is-active' : ''}`}
              onClick={() => goToScene(item.id, true)}
              aria-current={activeScene === item.id ? 'step' : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <a
          className="header-cta"
          href={heroWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
        >
          Записаться
        </a>
      </header>

      {/* Right Vertical Chapter Rail (1-to-1 synced with header aria-current="step") */}
      <aside className="chapter-rail" aria-label="Индикатор секций">
        <span className="rail-counter">{NAV_SCENES[activeScene].num}</span>
        <div className="rail-dots">
          {NAV_SCENES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`rail-dot ${activeScene === item.id ? 'is-active' : ''}`}
              onClick={() => goToScene(item.id, true)}
              aria-label={`Секция ${item.num}: ${item.label}`}
              aria-current={activeScene === item.id ? 'step' : undefined}
            />
          ))}
        </div>
        <span className="rail-total">05</span>
      </aside>

      {/* 5 Editorial Scenes */}
      <main className="scenes-stage">
        {/* SCENE 0 — HERO (CENTERED AROUND POTTER'S WHEEL + AMPHORA) */}
        <section
          ref={(el) => {
            sectionRefs.current[0] = el;
          }}
          className={`scene scene-hero ${activeScene === 0 ? 'is-current' : ''}`}
          aria-label="Вход"
        >
          <div className="hero-top interactive-block" data-anim="split-top">
            <span className="eyebrow">Красноярск · мастерская керамики и фарфора</span>
            <h1 className="hero-title">{config.brand}</h1>
          </div>

          <div
            className="hero-wheel-zone interactive-block"
            onPointerDown={handleWheelDragDown}
            onPointerMove={handleWheelDragMove}
            onPointerUp={handleWheelDragEnd}
            onPointerCancel={handleWheelDragEnd}
            role="application"
            aria-label="Раскрутите гончарный круг движением или перетаскиванием"
          />

          <div className="hero-bottom interactive-block" data-anim="split-bottom">
            <p className="hero-subtitle">Тихая глина, живой фарфор</p>
            <div className="hero-actions">
              <a
                className="btn-primary"
                href={heroWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                Написать в WhatsApp
              </a>
            </div>
            <button
              type="button"
              className="scroll-cue"
              onClick={() => goToScene(1, true)}
              aria-label="Перейти к мастерской"
            >
              <span>Листайте вниз</span>
              <span className="scroll-line" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* SCENE 1 — WORKSHOP (3D LEFT WITH RAYCASTER HOVER, 3 SHORT EDITORIAL LINES RIGHT) */}
        <section
          ref={(el) => {
            sectionRefs.current[1] = el;
          }}
          className={`scene scene-workshop ${activeScene === 1 ? 'is-current' : ''}`}
          aria-label="Мастерская"
        >
          <div className="workshop-column interactive-block">
            <span className="eyebrow" data-anim="right">
              Мастер {config.master}
            </span>
            <h2 className="scene-heading" data-anim="right">
              Место, где время течёт медленнее
            </h2>

            <ul className="editorial-list">
              <li className="editorial-item" data-anim="right">
                <span className="editorial-label">Камерный ритм</span>
                <span className="editorial-desc">лепка без спешки и таймера</span>
              </li>
              <li className="editorial-item" data-anim="right">
                <span className="editorial-label">Пёс {config.dog}</span>
                <span className="editorial-desc">дружелюбный хозяин студии</span>
              </li>
              <li className="editorial-item" data-anim="right">
                <span className="editorial-label">{config.addressShort}</span>
                <span className="editorial-desc">{config.hours}</span>
              </li>
            </ul>
          </div>
        </section>

        {/* SCENE 2 — GLAZES & KILN FIRING (CENTER + FREE X/Y DRAG + 3 GLAZES + FIRING SLIDER) */}
        <section
          ref={(el) => {
            sectionRefs.current[2] = el;
          }}
          className={`scene scene-glazes ${activeScene === 2 ? 'is-current' : ''}`}
          aria-label="Глазури и обжиг"
        >
          <div className="glaze-header interactive-block" data-anim="top">
            <span className="eyebrow">Фактура и обжиг</span>
            <h2 className="scene-heading">Живая глазурь</h2>
          </div>

          <div
            className={`glaze-drag-zone interactive-block ${isDraggingGlaze ? 'is-dragging' : ''}`}
            data-anim="center"
            onPointerDown={handleGlazePointerDown}
            onPointerMove={handleGlazePointerMove}
            onPointerUp={handleGlazePointerEnd}
            onPointerCancel={handleGlazePointerEnd}
            role="application"
            aria-label="Свободное вращение 3D-амфоры по осям X и Y"
          >
            <span className="drag-hint">Потяните по X / Y, чтобы повернуть</span>
          </div>

          <div className="glaze-controls interactive-block" data-anim="bottom">
            <div className="glaze-switcher" role="radiogroup" aria-label="Выбор глазури">
              {GLAZE_UI.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  role="radio"
                  aria-checked={glazeKey === g.id}
                  className={`glaze-option ${glazeKey === g.id ? 'is-active' : ''}`}
                  onClick={() => setGlazeKey(g.id)}
                >
                  <span
                    className="glaze-swatch"
                    style={{ backgroundColor: g.swatch }}
                    aria-hidden="true"
                  />
                  <span className="glaze-name">{g.label}</span>
                </button>
              ))}
            </div>

            <div className="firing-control">
              <label className="firing-label" htmlFor="kiln-temp-slider">
                <span>Обжиг</span>
                <span className="firing-temp-value">{firingTemp}°C</span>
              </label>
              <div className="firing-slider-wrap">
                <span className="firing-bound">900°C</span>
                <input
                  id="kiln-temp-slider"
                  type="range"
                  min={900}
                  max={1250}
                  step={5}
                  value={firingTemp}
                  onChange={(e) => setFiringTemp(Number(e.target.value))}
                  className="firing-slider"
                  aria-label="Температура обжига от 900 до 1250 градусов Цельсия"
                />
                <span className="firing-bound">1250°C</span>
              </div>
            </div>
          </div>
        </section>

        {/* SCENE 3 — FORMATS 01–06 (6 DISTINCT 3D FOCUSES, STABLE HITBOX, FIXED DETAIL BAR) */}
        <section
          ref={(el) => {
            sectionRefs.current[3] = el;
          }}
          className={`scene scene-formats ${activeScene === 3 ? 'is-current' : ''}`}
          aria-label="Форматы"
        >
          <div className="formats-layout interactive-block">
            <div className="formats-head" data-anim="top">
              <span className="eyebrow">Мастер-классы и изделия</span>
              <h2 className="scene-heading">Шесть форматов</h2>
            </div>

            <div className="formats-list" role="listbox" aria-label="Форматы мастерской">
              {config.formats.map((fmt, idx) => {
                const isSelected = idx === selectedFormatIdx;
                return (
                  <button
                    key={fmt.num}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`format-row ${isSelected ? 'is-active' : ''}`}
                    data-anim="row"
                    onMouseEnter={() => setSelectedFormatIdx(idx)}
                    onFocus={() => setSelectedFormatIdx(idx)}
                    onClick={() => setSelectedFormatIdx(idx)}
                  >
                    <span className="format-num">{fmt.num}</span>
                    <span className="format-title">{fmt.title}</span>
                    <span className="format-status">{fmt.status}</span>
                  </button>
                );
              })}
            </div>

            <div className="formats-detail-bar" data-anim="bottom">
              <div className="formats-detail-copy">
                <span className="formats-detail-num">{activeFormat.num}</span>
                <p className="formats-detail-note">{activeFormat.note}</p>
              </div>
              <a
                className="btn-inline"
                href={formatWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                Уточнить в WhatsApp →
              </a>
            </div>
          </div>
        </section>

        {/* SCENE 4 — CONTACTS (OVERHEAD PULLBACK + OVERFLOW-HIDDEN MASK REVEAL) */}
        <section
          ref={(el) => {
            sectionRefs.current[4] = el;
          }}
          className={`scene scene-contacts ${activeScene === 4 ? 'is-current' : ''}`}
          aria-label="Контакты"
        >
          <div className="contacts-inner interactive-block">
            <div className="mask-wrap" data-anim="center">
              <span className="eyebrow mask-inner" data-mask-inner>
                {config.rating} · {config.reviewsNote}
              </span>
            </div>
            <div className="mask-wrap" data-anim="center">
              <h2 className="scene-heading contacts-heading mask-inner" data-mask-inner>
                Ждём в мастерской
              </h2>
            </div>
            <div className="mask-wrap" data-anim="center">
              <p className="contacts-address mask-inner" data-mask-inner>
                {config.addressFull} · {config.hours}
              </p>
            </div>
            <div className="mask-wrap" data-anim="center">
              <p className="contacts-landmark mask-inner" data-mask-inner>
                {config.landmark}
              </p>
            </div>
            <div className="mask-wrap" data-anim="center">
              <p className="contacts-gift mask-inner" data-mask-inner>
                {config.giftNote}
              </p>
            </div>

            <div className="contacts-links" data-anim="center">
              <a
                className="btn-primary"
                href={heroWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
              <a
                className="btn-ghost"
                href={config.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Telegram
              </a>
              <a
                className="btn-ghost"
                href={config.telegramChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {config.telegramChannelLabel}
              </a>
              <a
                className="btn-ghost"
                href={config.vkUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                ВКонтакте
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
