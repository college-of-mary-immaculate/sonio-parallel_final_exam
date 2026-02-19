const ballotStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

  .bp-root {
    min-height: 100vh;
    background: var(--bg-color, #f0fff4);
    color: var(--text-color, #111827);
    font-family: 'Inter', sans-serif;
  }

  /* ── header ── */
  .bp-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(240,255,244,0.92);
    backdrop-filter: blur(14px);
    border-bottom: 1.5px solid var(--border-color, #86efac);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 40px;
  }
  .bp-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .bp-header-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--primary-color, #166534);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .bp-header-icon svg {
    width: 16px;
    height: 16px;
    stroke: white;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .bp-header-title {
    font-family: 'Lora', serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--primary-color, #166534);
    letter-spacing: -0.01em;
  }
  .bp-header-meta {
    font-size: 0.78rem;
    color: var(--text-muted, #6b7280);
    font-weight: 400;
    background: var(--accent-color, #bbf7d0);
    border: 1px solid var(--border-color, #86efac);
    border-radius: 20px;
    padding: 4px 12px;
  }

  /* ── body wrapper ── */
  .bp-body {
    max-width: 900px;
    margin: 0 auto;
    padding: 48px 24px 120px;
  }

  /* ── intro ── */
  .bp-intro {
    margin-bottom: 48px;
    animation: bp-fadein 0.5s ease both;
    padding: 32px 36px;
    background: var(--surface-color, #ffffff);
    border-radius: 20px;
    border: 1.5px solid var(--border-color, #86efac);
    box-shadow: 0 4px 24px rgba(22,101,52,0.06);
    position: relative;
    overflow: hidden;
  }
  .bp-intro::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color, #166534), var(--secondary-color, #22c55e));
    border-radius: 20px 20px 0 0;
  }
  .bp-intro h1 {
    font-family: 'Lora', serif;
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 700;
    line-height: 1.2;
    margin: 0 0 10px;
    color: var(--primary-color, #166534);
  }
  .bp-intro p {
    font-size: 0.88rem;
    color: var(--text-muted, #6b7280);
    margin: 0;
    line-height: 1.65;
    font-weight: 400;
  }

  /* ── position block ── */
  .bp-position {
    margin-bottom: 48px;
    animation: bp-fadein 0.5s ease both;
  }
  .bp-position-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .bp-position-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--primary-color, #166534);
    color: white;
    font-size: 0.8rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .bp-position-name {
    font-family: 'Lora', serif;
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-color, #111827);
    margin: 0;
    flex: 1;
  }
  .bp-position-limit {
    font-size: 0.73rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--primary-color, #166534);
    font-weight: 600;
    background: var(--accent-color, #bbf7d0);
    border: 1px solid var(--border-color, #86efac);
    border-radius: 20px;
    padding: 4px 11px;
    white-space: nowrap;
  }
  .bp-position-tally {
    font-size: 0.78rem;
    color: var(--text-muted, #6b7280);
    font-weight: 400;
    margin-left: auto;
  }
  .bp-position-tally.full {
    color: var(--secondary-color, #22c55e);
    font-weight: 500;
  }
  .bp-position-divider {
    height: 1.5px;
    background: linear-gradient(90deg, var(--border-color, #86efac), transparent);
    margin-bottom: 20px;
    border-radius: 99px;
  }

  /* ── candidates grid ── */
  .bp-candidates {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
  }

  /* ── candidate card ── */
  .bp-card {
    position: relative;
    border-radius: 16px;
    border: 2px solid var(--border-color, #86efac);
    background: var(--surface-color, #ffffff);
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, transform 0.18s, box-shadow 0.2s;
    user-select: none;
    outline: none;
    box-shadow: 0 2px 8px rgba(22,101,52,0.05);
  }
  .bp-card:hover {
    border-color: var(--secondary-color, #22c55e);
    background: #f0fff4;
    transform: translateY(-3px);
    box-shadow: 0 10px 28px rgba(22,101,52,0.12);
  }
  .bp-card:focus-visible {
    box-shadow: 0 0 0 3px var(--accent-color, #bbf7d0);
  }
  .bp-card.selected {
    border-color: var(--primary-color, #166534);
    background: #f0fff4;
    box-shadow: 0 0 0 1px var(--primary-color, #166534), 0 10px 28px rgba(22,101,52,0.15);
    transform: translateY(-2px);
  }
  .bp-card-stripe {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color, #166534), var(--secondary-color, #22c55e));
    opacity: 0;
    transition: opacity 0.2s;
  }
  .bp-card.selected .bp-card-stripe { opacity: 1; }

  .bp-check {
    position: absolute;
    top: 12px; right: 12px;
    width: 26px; height: 26px;
    border-radius: 50%;
    background: var(--primary-color, #166534);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0.4) rotate(-20deg);
    transition: opacity 0.22s, transform 0.28s cubic-bezier(0.34,1.56,0.64,1);
    pointer-events: none;
    z-index: 2;
    box-shadow: 0 2px 8px rgba(22,101,52,0.35);
  }
  .bp-card.selected .bp-check { opacity: 1; transform: scale(1) rotate(0deg); }
  .bp-check svg {
    width: 13px; height: 13px;
    stroke: white; stroke-width: 2.5;
    fill: none; stroke-linecap: round; stroke-linejoin: round;
  }

  .bp-card-img {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
    object-position: top;
    display: block;
    background: var(--accent-color, #bbf7d0);
  }
  .bp-card-avatar {
    width: 100%;
    aspect-ratio: 4/3;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Lora', serif;
    font-size: 2.2rem;
    font-weight: 600;
    color: var(--primary-color, #166534);
    background: linear-gradient(135deg, #e8faf0 0%, #bbf7d0 100%);
    letter-spacing: -0.02em;
  }
  .bp-card-body { padding: 14px 16px 16px; }
  .bp-card-name {
    font-size: 0.94rem;
    font-weight: 600;
    color: var(--text-color, #111827);
    margin: 0 0 5px;
    line-height: 1.3;
  }
  .bp-card-desc {
    font-size: 0.77rem;
    color: var(--text-muted, #6b7280);
    margin: 0;
    line-height: 1.5;
    font-weight: 400;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── submit bar ── */
  .bp-submit-bar {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 60;
    backdrop-filter: blur(16px);
    background: rgba(240,255,244,0.95);
    border-top: 1.5px solid var(--border-color, #86efac);
    padding: 16px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    box-shadow: 0 -4px 24px rgba(22,101,52,0.08);
  }
  .bp-submit-summary {
    font-size: 0.84rem;
    color: var(--text-muted, #6b7280);
    font-weight: 400;
  }
  .bp-submit-summary strong {
    color: var(--primary-color, #166534);
    font-weight: 600;
  }
  .bp-submit-btn {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 12px 30px;
    border: none;
    border-radius: 50px;
    background: linear-gradient(135deg, var(--primary-color, #166534) 0%, #15803d 100%);
    color: white;
    font-family: 'Inter', sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.02em;
    transition: opacity 0.2s, transform 0.18s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(22,101,52,0.3);
    white-space: nowrap;
  }
  .bp-submit-btn:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 8px 22px rgba(22,101,52,0.38);
  }
  .bp-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
  .bp-submit-btn svg {
    width: 15px; height: 15px;
    stroke: currentColor; fill: none;
    stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
  }

  /* ── error banner ── */
  .bp-error-banner {
    margin-bottom: 24px;
    background: #fef2f2;
    border: 1.5px solid #fca5a5;
    border-radius: 12px;
    padding: 14px 18px;
    font-size: 0.87rem;
    color: var(--danger-color, #dc2626);
    animation: bp-fadein 0.3s ease both;
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .bp-error-banner svg {
    width: 16px; height: 16px;
    stroke: var(--danger-color, #dc2626);
    fill: none; stroke-width: 2; stroke-linecap: round;
    flex-shrink: 0; margin-top: 1px;
  }

  /* ── toast ── */
  .bp-toast {
    position: fixed;
    top: 76px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border: 1.5px solid #fca5a5;
    border-radius: 10px;
    padding: 11px 18px;
    font-size: 0.83rem;
    color: var(--danger-color, #dc2626);
    z-index: 100;
    pointer-events: none;
    animation: bp-toast-in 0.25s ease forwards;
    white-space: nowrap;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .bp-toast svg {
    width: 14px; height: 14px;
    stroke: var(--danger-color, #dc2626);
    fill: none; stroke-width: 2; stroke-linecap: round; flex-shrink: 0;
  }
  @keyframes bp-toast-in {
    from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  /* ── full-page states ── */
  .bp-state {
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    text-align: center;
    padding: 40px;
  }
  .bp-state-icon {
    width: 64px; height: 64px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 8px;
  }
  .bp-state-icon.loading {
    background: var(--accent-color, #bbf7d0);
    border: 2px solid var(--border-color, #86efac);
  }
  .bp-state-icon.error {
    background: #fef2f2;
    border: 2px solid #fca5a5;
  }
  .bp-state h2 {
    font-family: 'Lora', serif;
    font-size: 1.5rem; font-weight: 600;
    margin: 0;
    color: var(--text-color, #111827);
  }
  .bp-state p {
    font-size: 0.87rem;
    color: var(--text-muted, #6b7280);
    margin: 0; font-weight: 400;
    max-width: 340px; line-height: 1.6;
  }
  .bp-spinner {
    width: 24px; height: 24px;
    border: 2.5px solid var(--border-color, #86efac);
    border-top-color: var(--primary-color, #166534);
    border-radius: 50%;
    animation: bp-spin 0.75s linear infinite;
  }

  /* ── no-candidates ── */
  .bp-no-candidates {
    padding: 28px 20px;
    border-radius: 12px;
    border: 1.5px dashed var(--border-color, #86efac);
    text-align: center;
    font-size: 0.84rem;
    color: var(--text-muted, #6b7280);
    background: #f9fffe;
  }

  /* ── animations ── */
  @keyframes bp-fadein {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bp-spin { to { transform: rotate(360deg); } }

  .bp-position:nth-child(1) { animation-delay: 0.06s; }
  .bp-position:nth-child(2) { animation-delay: 0.13s; }
  .bp-position:nth-child(3) { animation-delay: 0.20s; }
  .bp-position:nth-child(4) { animation-delay: 0.27s; }
  .bp-position:nth-child(5) { animation-delay: 0.34s; }
  .bp-position:nth-child(6) { animation-delay: 0.41s; }

  @media (max-width: 600px) {
    .bp-header { padding: 12px 16px; }
    .bp-body { padding: 28px 14px 110px; }
    .bp-intro { padding: 22px 20px; }
    .bp-submit-bar { padding: 12px 16px; flex-direction: column; align-items: stretch; gap: 10px; }
    .bp-submit-btn { justify-content: center; }
    .bp-candidates { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
  }
`;

export default ballotStyles;