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
    bgDeep: '#0A0908',
    accent: '#C97A4B',
    glowTint: 'rgba(201, 122, 75, 0.22)',
  },
  {
    id: 'porcelain',
    label: 'Молочный фарфор',
    swatch: '#EFE6D9',
    bgDeep: '#161412',
    accent: '#E8DDD0',
    glowTint: 'rgba(244, 237, 228, 0.20)',
  },
  {
    id: 'copper',
    label: 'Медная печь',
    swatch: '#CC7139',
    bgDeep: '#130B08',
    accent: '#E08A48',
    glowTint: 'rgba(224, 138, 72, 0.26)',
  },
];

function getExitVector(el, fromIdx, toIdx, dir) {
  const kind = el.dataset.anim || 'center';
  const pair = `${Math.min(fromIdx, toIdx)}-${Math.max(fromIdx, toIdx)}`;

  if (pair === '0-1') {
    if (kind === 'left') return { x: -46, y: 0, scale: 0.96 };
    if (kind === 'right') return { x: 46, y: 0, scale: 0.96 };
    return { x: 0, y: dir * -22, scale: 0.97 };
  }
  if (pair === '1-2') {
    return { x: dir * -54, y: 0, scale: 0.98 };
  }
  if (pair === '2-3') {
    if (kind === 'top' || kind === 'left') return { x: -28, y: -22, scale: 0.98 };
    if (kind === 'row' || kind === 'bottom') return { x: 28, y: 22, scale: 0.98 };
    return { x: 0, y: dir * -26, scale: 0.97 };
  }
  if (pair === '3-4') {
    return { x: 0, y: dir * -24, scale: 0.95 };
  }
  return { x: 0, y: dir * -26, scale: 0.97 };
}

function getEnterVector(el, fromIdx, toIdx, dir) {
  const kind = el.dataset.anim || 'center';
  const pair = `${Math.min(fromIdx, toIdx)}-${Math.max(fromIdx, toIdx)}`;

  if (pair === '0-1') {
    if (kind === 'left') return { x: -46, y: 0, scale: 0.96 };
    if (kind === 'right') return { x: 46, y: 0, scale: 0.96 };
    return { x: 0, y: dir * 24, scale: 0.97 };
  }
  if (pair === '1-2') {
    return { x: dir * 54, y: 0, scale: 0.98 };
  }
  if (pair === '2-3') {
    if (kind === 'top' || kind === 'left') return { x: -30, y: -24, scale: 0.98 };
    if (kind === 'row' || kind === 'bottom') return { x: 30, y: 24, scale: 0.98 };
    return { x: 0, y: dir * 24, scale: 0.98 };
  }
  if (pair === '3-4') {
    return { x: 0, y: dir * 26, scale: 0.95 };
  }
  return { x: 0, y: dir * 26, scale: 0.97 };
}

export default function App() {
  const config = useMemo(() => getSiteConfig(), []);
  const [activeScene, setActiveScene] = useState(0);
  const [glazeKey, setGlazeKey] = useState('chamotte');
  const [selectedFormatIdx, setSelectedFormatIdx] = useState(0);
  const [isDraggingGlaze, setIsDraggingGlaze] = useState(false);

  const activeSceneRef = useRef(0);
  const lastNavTimeRef = useRef(0);
  const sectionRefs = useRef([]);
  const transitionTlRef = useRef(null);

  // Shared refs for WebGL (cursor parallax & Scene 2 drag-to-rotate)
  const pointerRef = useRef({ x: 0, y: 0 });
  const dragStateRef = useRef({ isDragging: false, velocity: 0 });
  const dragTrackRef = useRef({ active: false, pointerId: null, lastX: 0, startX: 0, startY: 0, lockedAxis: null });

  const activeFormat = config.formats[selectedFormatIdx] || config.formats[0];
  const focusTarget = activeFormat?.focus || (selectedFormatIdx >= 3 ? 'piala' : 'amphora');

  // Initialize scene visibility cleanly on mount
  useEffect(() => {
    sectionRefs.current.forEach((sec, idx) => {
      if (!sec) return;
      gsap.set(sec, {
        autoAlpha: idx === 0 ? 1 : 0,
        pointerEvents: idx === 0 ? 'auto' : 'none',
      });
      const items = sec.querySelectorAll('[data-anim]');
      if (idx === 0) {
        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 18, scale: 0.98 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.65, stagger: 0.06, ease: 'power3.out' }
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

  // Subtle pointer parallax
  useEffect(() => {
    const onPointerMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      pointerRef.current.x = nx;
      pointerRef.current.y = ny;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  // Clean per-element scene transition (NO rotateX/rotateY on <section>)
  const goToScene = useCallback((nextIdx) => {
    const target = Math.max(0, Math.min(NAV_SCENES.length - 1, nextIdx));
    const current = activeSceneRef.current;
    if (target === current) return;

    const now = performance.now();
    if (now - lastNavTimeRef.current < 480) return;
    lastNavTimeRef.current = now;

    const dir = target > current ? 1 : -1;
    activeSceneRef.current = target;
    setActiveScene(target);

    if (transitionTlRef.current) {
      transitionTlRef.current.kill();
    }

    const outSec = sectionRefs.current[current];
    const inSec = sectionRefs.current[target];

    const tl = gsap.timeline();
    transitionTlRef.current = tl;

    if (outSec) {
      const outItems = Array.from(outSec.querySelectorAll('[data-anim]'));
      tl.set(outSec, { pointerEvents: 'none' }, 0);
      outItems.forEach((el, i) => {
        const v = getExitVector(el, current, target, dir);
        tl.to(
          el,
          {
            autoAlpha: 0,
            x: v.x,
            y: v.y,
            scale: v.scale,
            duration: 0.24,
            ease: 'power2.in',
          },
          i * 0.015
        );
      });
      tl.to(outSec, { autoAlpha: 0, duration: 0.24, ease: 'power2.in' }, 0);
    }

    if (inSec) {
      const inItems = Array.from(inSec.querySelectorAll('[data-anim]'));
      tl.set(inSec, { autoAlpha: 1, pointerEvents: 'auto' }, 0.24);
      inItems.forEach((el, i) => {
        const v = getEnterVector(el, current, target, dir);
        tl.fromTo(
          el,
          { autoAlpha: 0, x: v.x, y: v.y, scale: v.scale },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.48,
            ease: 'power3.out',
          },
          0.24 + i * 0.05
        );
      });
    }
  }, []);

  // GSAP Observer strictly 'wheel,touch' (NO 'pointer')
  useEffect(() => {
    const observer = Observer.create({
      type: 'wheel,touch',
      wheelSpeed: 1,
      tolerance: 18,
      preventDefault: true,
      onDown: () => {
        if (dragStateRef.current.isDragging) return;
        goToScene(activeSceneRef.current + 1);
      },
      onUp: () => {
        if (dragStateRef.current.isDragging) return;
        goToScene(activeSceneRef.current - 1);
      },
    });

    const onKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goToScene(activeSceneRef.current + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToScene(activeSceneRef.current - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToScene(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToScene(NAV_SCENES.length - 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      observer.kill();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [goToScene]);

  // Scene 2: Drag-to-rotate handlers on .glaze-drag-zone (horizontal only, no conflict with vertical swipe)
  const handleGlazePointerDown = useCallback((e) => {
    if (activeSceneRef.current !== 2) return;
    dragTrackRef.current = {
      active: true,
      pointerId: e.pointerId,
      lastX: e.clientX,
      startX: e.clientX,
      startY: e.clientY,
      lockedAxis: e.pointerType === 'mouse' ? 'x' : null,
    };
    if (e.pointerType === 'mouse') {
      dragStateRef.current.isDragging = true;
      setIsDraggingGlaze(true);
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
  }, []);

  const handleGlazePointerMove = useCallback((e) => {
    const track = dragTrackRef.current;
    if (!track.active || track.pointerId !== e.pointerId) return;

    if (!track.lockedAxis) {
      const totalDx = Math.abs(e.clientX - track.startX);
      const totalDy = Math.abs(e.clientY - track.startY);
      if (totalDx < 6 && totalDy < 6) return;
      if (totalDx > totalDy) {
        track.lockedAxis = 'x';
        dragStateRef.current.isDragging = true;
        setIsDraggingGlaze(true);
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } else {
        track.lockedAxis = 'y';
        return;
      }
    }

    if (track.lockedAxis === 'x') {
      const dx = e.clientX - track.lastX;
      track.lastX = e.clientX;
      dragStateRef.current.velocity = dx * 0.0085;
    }
  }, []);

  const handleGlazePointerEnd = useCallback((e) => {
    const track = dragTrackRef.current;
    if (!track.active || track.pointerId !== e.pointerId) return;
    track.active = false;
    track.lockedAxis = null;
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
        glazeKey={glazeKey}
        focusTarget={focusTarget}
        dragStateRef={dragStateRef}
        pointerRef={pointerRef}
      />

      {/* Editorial Top Header */}
      <header className="site-header">
        <button
          type="button"
          className="brand-mark"
          onClick={() => goToScene(0)}
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
              onClick={() => goToScene(item.id)}
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

      {/* Right Vertical Progress Rail (1-to-1 synced with header) */}
      <aside className="scene-rail" aria-label="Индикатор секций">
        <span className="rail-counter">{NAV_SCENES[activeScene].num}</span>
        <div className="rail-dots">
          {NAV_SCENES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`rail-dot ${activeScene === item.id ? 'is-active' : ''}`}
              onClick={() => goToScene(item.id)}
              aria-label={`Секция ${item.num}: ${item.label}`}
              aria-current={activeScene === item.id ? 'step' : undefined}
            />
          ))}
        </div>
        <span className="rail-total">05</span>
      </aside>

      {/* 5 Editorial Scenes */}
      <main className="scenes-stage">
        {/* SCENE 0 — HERO (CENTERED AROUND AMPHORA) */}
        <section
          ref={(el) => {
            sectionRefs.current[0] = el;
          }}
          className="scene scene-hero"
          aria-label="Вход"
        >
          <div className="hero-top" data-anim="left">
            <span className="eyebrow">Красноярск · мастерская керамики и фарфора</span>
            <h1 className="hero-title">{config.brand}</h1>
          </div>

          <div className="hero-bottom" data-anim="right">
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
              onClick={() => goToScene(1)}
              aria-label="Перейти к мастерской"
            >
              <span>Листайте вниз</span>
              <span className="scroll-line" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* SCENE 1 — WORKSHOP (3D LEFT, EDITORIAL TEXT RIGHT) */}
        <section
          ref={(el) => {
            sectionRefs.current[1] = el;
          }}
          className="scene scene-workshop"
          aria-label="Мастерская"
        >
          <div className="workshop-column">
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
                <span className="editorial-label">Пёс Шлёпа</span>
                <span className="editorial-desc">дружелюбный хозяин студии</span>
              </li>
              <li className="editorial-item" data-anim="right">
                <span className="editorial-label">ул. Ломоносова, 50/1</span>
                <span className="editorial-desc">по записи с 10:00, 2 этаж</span>
              </li>
            </ul>
          </div>
        </section>

        {/* SCENE 2 — GLAZE SHOWCASE (CENTER + INTERACTIVE DRAG-TO-ROTATE) */}
        <section
          ref={(el) => {
            sectionRefs.current[2] = el;
          }}
          className="scene scene-glazes"
          aria-label="Глазури"
        >
          <div className="glaze-header" data-anim="top">
            <span className="eyebrow">Фактура и обжиг</span>
            <h2 className="scene-heading">Живая глазурь</h2>
          </div>

          <div
            className={`glaze-drag-zone ${isDraggingGlaze ? 'is-dragging' : ''}`}
            data-anim="center"
            onPointerDown={handleGlazePointerDown}
            onPointerMove={handleGlazePointerMove}
            onPointerUp={handleGlazePointerEnd}
            onPointerCancel={handleGlazePointerEnd}
            role="application"
            aria-label="Интерактивная область вращения 3D-амфоры"
          >
            <span className="drag-hint">Потяните, чтобы повернуть</span>
          </div>

          <div className="glaze-switcher" data-anim="bottom" role="radiogroup" aria-label="Выбор глазури">
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
        </section>

        {/* SCENE 3 — FORMATS (DIAGONAL / CENTER, ZERO BOXES, FIXED DETAIL BAR) */}
        <section
          ref={(el) => {
            sectionRefs.current[3] = el;
          }}
          className="scene scene-formats"
          aria-label="Форматы"
        >
          <div className="formats-layout">
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

        {/* SCENE 4 — CONTACTS (CLEAN CENTER FINALE) */}
        <section
          ref={(el) => {
            sectionRefs.current[4] = el;
          }}
          className="scene scene-contacts"
          aria-label="Контакты"
        >
          <div className="contacts-inner">
            <span className="eyebrow" data-anim="center">
              {config.rating} · {config.reviewsNote}
            </span>
            <h2 className="scene-heading contacts-heading" data-anim="center">
              Ждём в мастерской
            </h2>
            <p className="contacts-address" data-anim="center">
              {config.addressFull} · с 10:00 по записи
            </p>
            <p className="contacts-landmark" data-anim="center">
              {config.landmark}
            </p>
            <p className="contacts-gift" data-anim="center">
              {config.giftNote}
            </p>

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
                Канал {config.telegramChannelLabel}
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
