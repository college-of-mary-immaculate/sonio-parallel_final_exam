/* ─── SuccessModal ───────────────────────────────────────────────
   Shown after a ballot is successfully submitted.
   Props:
     onGoBack — callback fired when the user clicks "Back to Elections"
─────────────────────────────────────────────────────────────── */

const successModalStyles = `
.bpsm-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1.5rem;
  animation: bpsm-fade-in 0.2s ease;
}
@keyframes bpsm-fade-in { from { opacity: 0; } to { opacity: 1; } }
.bpsm-card {
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-card, 14px);
  padding: 2.5rem 2rem 2rem;
  max-width: 400px; width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  animation: bpsm-slide-up 0.25s ease;
}
@keyframes bpsm-slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.bpsm-icon-wrap {
  width: 72px; height: 72px; border-radius: 50%;
  background: var(--color-primary-subtle, #dcfce7);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.5rem;
}
.bpsm-icon-wrap svg {
  width: 36px; height: 36px;
  color: var(--color-primary-dark, #15803d);
  stroke: currentColor;
}
.bpsm-card h2 {
  font-size: 1.35rem; font-weight: 700;
  color: var(--color-text-heading, #111827);
  margin: 0 0 0.5rem;
}
.bpsm-card p {
  font-size: 0.9rem; color: var(--color-text-muted, #6b7280);
  margin: 0 0 2rem; line-height: 1.6;
}
.bpsm-btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 0.45rem; width: 100%;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-btn, 8px);
  background: var(--color-primary, #22c55e);
  color: var(--color-primary-contrast, #ffffff);
  font-size: 0.95rem; font-weight: 600;
  border: none; cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
}
.bpsm-btn:hover  { background: var(--color-primary-dark, #16a34a); }
.bpsm-btn:active { transform: scale(0.98); }
.bpsm-btn svg    { width: 16px; height: 16px; stroke: currentColor; }
`;

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export default function SuccessModal({ onGoBack }) {
  return (
    <>
      <style>{successModalStyles}</style>
      <div className="bpsm-overlay">
        <div className="bpsm-card">
          <div className="bpsm-icon-wrap">
            <CheckIcon />
          </div>
          <h2>Vote Submitted!</h2>
          <p>Your ballot has been recorded successfully. Thank you for participating.</p>
          <button className="bpsm-btn" onClick={onGoBack}>
            <ArrowLeftIcon />
            Back to Elections
          </button>
        </div>
      </div>
    </>
  );
}