import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import KilnStage from './scene/KilnStage';
import GiftCertificateCard from './components/GiftCertificateCard';
import { buildWaUrl, getSiteConfig } from './config';

gsap.registerPlugin(Observer);
gsap.ticker.lagSmoothing(0);

const TOTAL_SCENES = 5;
const UNLOCK_DELAY_MS = 480;

function updateRadialGlow(e) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const gx = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
  const gy = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
  el.style.setProperty('--gx', `${gx.toFixed(1)}%`);
  el.style.setProperty('--gy', `${gy.toFixed(1)}%`);
}

function getTransitionProfile(fromIdx, toIdx, dir) {
  const pair = Math.min(fromIdx, toIdx);

  if (pair === 0) {
    return {
      out: { z: dir > 0 ? 180 : -160, scale: dir > 0 ? 1.08 : 0.92, rotateX: dir * 5, opacity: 0 },
      inFrom: { z: dir > 0 ? -170 : 170, scale: dir > 0 ? 0.91 : 1.07, rotateX: dir * -5, opacity: 0 },
      inTo: { z: 0, scale: 1, rotateX: 0, opacity: 1 },
      counter: false,
    };
  }

  if (pair === 1) {
    return {
      out: { x: dir * -110, z: -70, rotateY: dir * 16, opacity: 0 },
      inFrom: { x: dir * 110, z: -70, rotateY: dir * -16, opacity: 0 },
      inTo: { x: 0, z: 0, rotateY: 0, opacity: 1 },
      counter: false,
    };
  }

  if (pair === 2) {
    return {
      out: { x: dir * -45, z: -60, opacity: 0 },
      inFrom: { x: 0, z: 0, opacity: 0 },
      inTo: { x: 0, z: 0, opacity: 1 },
      counter: true,
    };
  }

  return {
    out: { z: dir > 0 ? -170 : 140, rotateX: dir * -8, scale: dir > 0 ? 0.92 : 1.06, opacity: 0 },
    inFrom: { z: dir > 0 ? 150 : -160, rotateX: dir * 8, scale: dir > 0 ? 1.06 : 0.92, opacity: 0 },
    inTo: { z: 0, rotateX: 0, scale: 1, opacity: 1 },
    counter: false,
  };
}

export default function App() {
  const cfg = useMemo(() => getSiteConfig(), []);
  const navItems = cfg.navigation || [];
  const formatItems = (cfg.formats && cfg.formats.items) || [];

  const [activeScene, setActiveScene] = useState(0);
  const [selectedServiceIdx, setSelectedServiceIdx] = useState(0);

  const activeSceneRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const unlockTimerRef = useRef(null);
  const activeTimelineRef = useRef(null);
  const sceneRefs = useRef([]);
  const pointerRef = useRef({ x: 0, y: 0 });

  const goToScene = useCallback((targetIdx, immediate = false) => {
    const nextIdx = Math.max(0, Math.min(TOTAL_SCENES - 1, targetIdx));
    const prevIdx = activeSceneRef.current;

    if (nextIdx === prevIdx) return;
    if (!immediate && isTransitioningRef.current) return;

    if (unlockTimerRef.current) {
      clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }

    if (activeTimelineRef.current) {
      activeTimelineRef.current.kill();
      activeTimelineRef.current = null;
    }

    isTransitioningRef.current = true;
    const dir = nextIdx > prevIdx ? 1 : -1;
    const prevEl = sceneRefs.current[prevIdx];
    const nextEl = sceneRefs.current[nextIdx];

    activeSceneRef.current = nextIdx;
    setActiveScene(nextIdx);

    const profile = getTransitionProfile(prevIdx, nextIdx, dir);

    sceneRefs.current.forEach((el, idx) => {
      if (!el || idx === prevIdx || idx === nextIdx) return;
      gsap.set(el, { autoAlpha: 0, pointerEvents: 'none', clearProps: 'transform' });
    });

    const tl = gsap.timeline({
      onComplete: () => {
        if (prevEl) {
          gsap.set(prevEl, { autoAlpha: 0, pointerEvents: 'none', clearProps: 'transform' });
        }
        if (nextEl) {
          gsap.set(nextEl, { clearProps: 'transform' });
          const counters = nextEl.querySelectorAll('[data-counter]');
          if (counters.length) {
            gsap.set(counters, { clearProps: 'transform,opacity' });
          }
        }
      },
    });
    activeTimelineRef.current = tl;

    if (prevEl) {
      gsap.set(prevEl, { pointerEvents: 'none' });
      tl.to(
        prevEl,
        {
          ...profile.out,
          autoAlpha: 0,
          duration: 0.24,
          ease: 'power2.in',
        },
        0
      );
    }

    if (nextEl) {
      gsap.set(nextEl, {
        ...profile.inFrom,
        autoAlpha: 0,
        pointerEvents: 'auto',
      });

      tl.to(
        nextEl,
        {
          ...profile.inTo,
          autoAlpha: 1,
          duration: 0.48,
          ease: 'expo.out',
        },
        0.22
      );

      if (profile.counter) {
        const groupA = nextEl.querySelectorAll('[data-counter="a"]');
        const groupB = nextEl.querySelectorAll('[data-counter="b"]');
        if (groupA.length) {
          tl.fromTo(
            groupA,
            { x: dir * -72, z: -50, rotateY: dir * 10, opacity: 0 },
            { x: 0, z: 0, rotateY: 0, opacity: 1, duration: 0.48, ease: 'expo.out' },
            0.22
          );
        }
        if (groupB.length) {
          tl.fromTo(
            groupB,
            { x: dir * 72, z: 45, rotateY: dir * -10, opacity: 0 },
            { x: 0, z: 0, rotateY: 0, opacity: 1, duration: 0.48, ease: 'expo.out' },
            0.22
          );
        }
      }
    }

    unlockTimerRef.current = setTimeout(() => {
      isTransitioningRef.current = false;
      unlockTimerRef.current = null;
    }, UNLOCK_DELAY_MS);
  }, []);

  useEffect(() => {
    sceneRefs.current.forEach((el, idx) => {
      if (!el) return;
      if (idx === 0) {
        gsap.set(el, { autoAlpha: 1, pointerEvents: 'auto', clearProps: 'transform' });
      } else {
        gsap.set(el, { autoAlpha: 0, pointerEvents: 'none', clearProps: 'transform' });
      }
    });
  }, []);

  useEffect(() => {
    const observer = Observer.create({
      type: 'wheel,touch',
      wheelSpeed: 1,
      tolerance: 24,
      preventDefault: true,
      onDown: (self) => {
        if (self.event && self.event.type && self.event.type.startsWith('touch')) {
          goToScene(activeSceneRef.current - 1);
        } else {
          goToScene(activeSceneRef.current + 1);
        }
      },
      onUp: (self) => {
        if (self.event && self.event.type && self.event.type.startsWith('touch')) {
          goToScene(activeSceneRef.current + 1);
        } else {
          goToScene(activeSceneRef.current - 1);
        }
      },
    });

    const handleKeyDown = (e) => {
      const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'PageDown' || (e.key === 'ArrowDown' && activeSceneRef.current !== 3)) {
        e.preventDefault();
        goToScene(activeSceneRef.current + 1);
      } else if (e.key === 'PageUp' || (e.key === 'ArrowUp' && activeSceneRef.current !== 3)) {
        e.preventDefault();
        goToScene(activeSceneRef.current - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToScene(0, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToScene(TOTAL_SCENES - 1, true);
      }
    };

    const handlePointerMove = (e) => {
      if (e.pointerType === 'touch') return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerRef.current.x = Math.max(-1, Math.min(1, nx));
      pointerRef.current.y = Math.max(-1, Math.min(1, ny));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      observer.kill();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointermove', handlePointerMove);
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
      if (activeTimelineRef.current) activeTimelineRef.current.kill();
    };
  }, [goToScene]);

  const selectedService = formatItems[selectedServiceIdx] || formatItems[0] || {};
  const waBase = (cfg.contacts && cfg.contacts.whatsappBase) || 'https://wa.me/79131080835';
  const heroWaHref = buildWaUrl(waBase, cfg.contacts && cfg.contacts.whatsappDefaultMessage);
  const selectedServiceWaHref = buildWaUrl(waBase, selectedService.waMessage);

  const handleServiceKeyDown = (e, idx) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (idx + 1) % formatItems.length;
      setSelectedServiceIdx(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (idx - 1 + formatItems.length) % formatItems.length;
      setSelectedServiceIdx(prev);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedServiceIdx(idx);
    }
  };

  return (
    <div className="app-shell">
      <KilnStage activeScene={activeScene} pointerRef={pointerRef} />
      <div className="vignette-layer" aria-hidden="true" />

      <header className="site-header">
        <button
          type="button"
          className="brand-mark"
          onClick={() => goToScene(0, true)}
          aria-label="Перейти на первый экран — Апокриф"
        >
          <span className="brand-emblem" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 4.5h6c-1.1 1.7-1.1 3.3 0 5.1 2.1 2.3 3 4.8 2.4 7.8-.5 2.5-2.4 4.1-5.4 4.1s-4.9-1.6-5.4-4.1c-.6-3 .3-5.5 2.4-7.8 1.1-1.8 1.1-3.4 0-5.1z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="brand-text">
            <span className="brand-name">{cfg.brand?.name || 'Апокриф'}</span>
            <span className="brand-sub">{cfg.brand?.city || 'Красноярск'}</span>
          </span>
        </button>

        <nav className="header-nav" aria-label="Разделы сайта">
          {navItems.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              className={`nav-link${activeScene === idx ? ' is-active' : ''}`}
              aria-current={activeScene === idx ? 'step' : undefined}
              onClick={() => goToScene(idx, true)}
              onPointerMove={updateRadialGlow}
            >
              <span className="nav-index">{item.shortLabel}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <a
          href={heroWaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="header-cta"
          onPointerMove={updateRadialGlow}
        >
          Запись
        </a>
      </header>

      <aside className="chapter-rail" aria-label="Шкала сцен">
        {navItems.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            className={`chapter-dot${activeScene === idx ? ' is-active' : ''}`}
            aria-label={`Сцена ${idx + 1}: ${item.label}`}
            aria-current={activeScene === idx ? 'step' : undefined}
            onClick={() => goToScene(idx, true)}
          >
            <span className="chapter-dot-pip" />
            <span className="chapter-dot-label">{item.label}</span>
          </button>
        ))}
      </aside>

      <main className="scene-viewport">
        <section
          ref={(el) => {
            sceneRefs.current[0] = el;
          }}
          className="scene scene-hero"
          aria-hidden={activeScene !== 0}
        >
          <div className="scene-inner hero-layout">
            <div className="hero-content">
              <div className="eyebrow">{cfg.hero?.eyebrow}</div>
              <h1 className="hero-title">
                <span>{cfg.hero?.titleLine1}</span>
                <span className="accent-italic">{cfg.hero?.titleLine2}</span>
              </h1>
              <p className="hero-lead">{cfg.hero?.description}</p>

              <div className="hero-actions">
                <a
                  href={heroWaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  onPointerMove={updateRadialGlow}
                >
                  {cfg.hero?.primaryCta}
                </a>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => goToScene(3, true)}
                  onPointerMove={updateRadialGlow}
                >
                  {cfg.hero?.secondaryCta}
                </button>
              </div>

              <div className="hero-meta-strip">
                <div className="rating-pill">
                  <span className="rating-star" aria-hidden="true">★</span>
                  <strong>{cfg.hero?.ratingScore}</strong>
                  <span>{cfg.hero?.ratingMeta}</span>
                </div>
                <span className="scroll-cue">{cfg.hero?.scrollHint}</span>
              </div>
            </div>
          </div>
        </section>

        <section
          ref={(el) => {
            sceneRefs.current[1] = el;
          }}
          className="scene scene-studio"
          aria-hidden={activeScene !== 1}
        >
          <div className="scene-inner studio-layout">
            <div className="studio-header">
              <div className="eyebrow">{cfg.studio?.eyebrow}</div>
              <h2 className="section-title">{cfg.studio?.title}</h2>
              <p className="section-lead">{cfg.studio?.lead}</p>
            </div>

            <div className="studio-cards">
              {(cfg.studio?.highlights || []).map((card) => (
                <article
                  key={card.label}
                  className="glass-card"
                  onPointerMove={updateRadialGlow}
                >
                  <div className="card-kicker">{card.label}</div>
                  <h3 className="card-heading">{card.value}</h3>
                  <p className="card-body">{card.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          ref={(el) => {
            sceneRefs.current[2] = el;
          }}
          className="scene scene-craft"
          aria-hidden={activeScene !== 2}
        >
          <div className="scene-inner craft-layout">
            <div className="craft-header">
              <div className="eyebrow">{cfg.craft?.eyebrow}</div>
              <h2 className="section-title">{cfg.craft?.title}</h2>
              <p className="section-lead">{cfg.craft?.lead}</p>
            </div>

            <div className="craft-stages">
              {(cfg.craft?.stages || []).map((stage) => (
                <article
                  key={stage.index}
                  className="stage-row"
                  onPointerMove={updateRadialGlow}
                >
                  <div className="stage-roman">{stage.index}</div>
                  <div className="stage-copy">
                    <h3>{stage.title}</h3>
                    <p>{stage.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          ref={(el) => {
            sceneRefs.current[3] = el;
          }}
          className="scene scene-formats"
          aria-hidden={activeScene !== 3}
        >
          <div className="scene-inner formats-layout">
            <div className="formats-header" data-counter="a">
              <div className="eyebrow">{cfg.formats?.eyebrow}</div>
              <h2 className="section-title">{cfg.formats?.title}</h2>
            </div>

            <div className="formats-list" role="listbox" aria-label="Форматы и изделия" data-counter="a">
              {formatItems.map((item, idx) => {
                const isSelected = idx === selectedServiceIdx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`service-row${isSelected ? ' is-selected' : ''}`}
                    onClick={() => setSelectedServiceIdx(idx)}
                    onPointerEnter={(e) => {
                      if (e.pointerType === 'mouse') {
                        setSelectedServiceIdx(idx);
                      }
                    }}
                    onPointerMove={updateRadialGlow}
                    onKeyDown={(e) => handleServiceKeyDown(e, idx)}
                  >
                    <span className="service-id">{item.id}</span>
                    <span className="service-name">{item.title}</span>
                    <span className="service-price">{item.priceLabel}</span>
                  </button>
                );
              })}
            </div>

            <div className="service-detail-bar" data-counter="b" aria-live="polite">
              <div className="service-detail-copy">
                <div className="service-detail-head">
                  <span className="service-detail-id">{selectedService.id}</span>
                  <strong className="service-detail-title">{selectedService.title}</strong>
                </div>
                <p className="service-detail-desc">{selectedService.description}</p>
              </div>
              <a
                href={selectedServiceWaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary service-detail-cta"
                onPointerMove={updateRadialGlow}
              >
                {cfg.formats?.ctaPrefix || 'Обсудить в WhatsApp'}: {selectedService.title}
              </a>
            </div>
          </div>
        </section>

        <section
          ref={(el) => {
            sceneRefs.current[4] = el;
          }}
          className="scene scene-contacts"
          aria-hidden={activeScene !== 4}
        >
          <div className="scene-inner contacts-layout">
            <div className="contacts-info">
              <div className="eyebrow">{cfg.contacts?.eyebrow}</div>
              <h2 className="section-title">{cfg.contacts?.title}</h2>

              <div className="contacts-meta-list">
                <div className="contact-fact">
                  <span className="fact-label">Адрес</span>
                  <span className="fact-value">{cfg.contacts?.address}</span>
                  <span className="fact-sub">{cfg.contacts?.landmark}</span>
                </div>
                <div className="contact-fact-row">
                  <div className="contact-fact">
                    <span className="fact-label">Режим работы</span>
                    <span className="fact-value">{cfg.contacts?.hours}</span>
                  </div>
                  <div className="contact-fact">
                    <span className="fact-label">Отзывы</span>
                    <span className="fact-value">{cfg.contacts?.rating}</span>
                  </div>
                </div>
              </div>

              <div className="contact-links">
                <a
                  href={heroWaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  onPointerMove={updateRadialGlow}
                >
                  WhatsApp · {cfg.contacts?.phoneDisplay}
                </a>
                <a
                  href={cfg.contacts?.telegramDirect}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  onPointerMove={updateRadialGlow}
                >
                  Telegram
                </a>
                <a
                  href={cfg.contacts?.telegramChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-subtle"
                  onPointerMove={updateRadialGlow}
                >
                  {cfg.contacts?.telegramChannelLabel}
                </a>
                <a
                  href={cfg.contacts?.vkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-subtle"
                  onPointerMove={updateRadialGlow}
                >
                  {cfg.contacts?.vkLabel}
                </a>
              </div>
            </div>

            <div className="contacts-cert-col">
              {cfg.contacts?.certificate && (
                <GiftCertificateCard
                  cert={cfg.contacts.certificate}
                  whatsappBase={waBase}
                />
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
