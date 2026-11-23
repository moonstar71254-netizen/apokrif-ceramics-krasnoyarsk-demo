import React, { useEffect, useRef } from 'react';
import { buildWaUrl } from '../config';

const LERP = 0.14;
const MAX_TILT = 10;

export default function GiftCertificateCard({ cert, whatsappBase }) {
  const wrapRef = useRef(null);
  const cardRef = useRef(null);
  const rafRef = useRef(0);
  const stateRef = useRef({
    active: false,
    targetRx: 0,
    targetRy: 0,
    targetGx: 50,
    targetGy: 50,
    curRx: 0,
    curRy: 0,
    curGx: 50,
    curGy: 50,
  });

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const tick = () => {
    const s = stateRef.current;
    const card = cardRef.current;
    if (!card) {
      rafRef.current = 0;
      return;
    }

    s.curRx += (s.targetRx - s.curRx) * LERP;
    s.curRy += (s.targetRy - s.curRy) * LERP;
    s.curGx += (s.targetGx - s.curGx) * LERP;
    s.curGy += (s.targetGy - s.curGy) * LERP;

    card.style.setProperty('--rx', `${s.curRx.toFixed(3)}deg`);
    card.style.setProperty('--ry', `${s.curRy.toFixed(3)}deg`);
    card.style.setProperty('--gx', `${s.curGx.toFixed(2)}%`);
    card.style.setProperty('--gy', `${s.curGy.toFixed(2)}%`);

    const settled =
      !s.active &&
      Math.abs(s.curRx) < 0.03 &&
      Math.abs(s.curRy) < 0.03 &&
      Math.abs(s.curGx - 50) < 0.2 &&
      Math.abs(s.curGy - 50) < 0.2;

    if (settled) {
      s.curRx = 0;
      s.curRy = 0;
      s.curGx = 50;
      s.curGy = 50;
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--gx', '50%');
      card.style.setProperty('--gy', '50%');
      card.style.transform = 'none';
      rafRef.current = 0;
      return;
    }

    card.style.transform = `rotateX(${s.curRx.toFixed(3)}deg) rotateY(${s.curRy.toFixed(3)}deg)`;
    rafRef.current = requestAnimationFrame(tick);
  };

  const ensureLoop = () => {
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  const handlePointerMove = (e) => {
    if (e.pointerType === 'touch') return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const px = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const py = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));

    const s = stateRef.current;
    s.active = true;
    s.targetRy = (px - 0.5) * 2 * MAX_TILT;
    s.targetRx = (0.5 - py) * 2 * MAX_TILT;
    s.targetGx = px * 100;
    s.targetGy = py * 100;
    ensureLoop();
  };

  const handlePointerLeave = () => {
    const s = stateRef.current;
    s.active = false;
    s.targetRx = 0;
    s.targetRy = 0;
    s.targetGx = 50;
    s.targetGy = 50;
    ensureLoop();
  };

  const waHref = buildWaUrl(whatsappBase, cert.waMessage);

  return (
    <div
      ref={wrapRef}
      className="cert-stage-wrap"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div ref={cardRef} className="cert-card-3d" style={{ transform: 'none' }}>
        <div className="cert-card-edge" aria-hidden="true" />
        <div className="cert-card-glare" aria-hidden="true" />

        <div className="cert-card-face">
          <div className="cert-top-row">
            <span className="cert-badge">{cert.badge}</span>
            <span className="cert-seal" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.2" opacity="0.65" />
                <path
                  d="M9.5 6.5h5c-1 1.4-1 2.7 0 4.2 1.7 1.9 2.4 4 1.9 6.3-.4 2-2 3.2-4.4 3.2s-4-1.2-4.4-3.2c-.5-2.3.2-4.4 1.9-6.3 1-1.5 1-2.8 0-4.2z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </div>

          <div className="cert-center">
            <div className="cert-title">{cert.title}</div>
            <div className="cert-subtitle">{cert.subtitle}</div>
            <p className="cert-note">{cert.note}</p>
          </div>

          <div className="cert-bottom-row">
            <div className="cert-meta">
              <span>{cert.footerLeft}</span>
              <span>{cert.footerRight}</span>
            </div>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="cert-cta"
            >
              {cert.priceLabel}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
