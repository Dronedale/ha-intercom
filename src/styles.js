import { css } from "lit";

/* Farb- und Formvariablen, abgeleitet aus dem HA-Theme; eigene Werte per --intercom-* ueberschreibbar. */
export const tokens = css`
  :host {
    --ic-card: var(--ha-card-background, var(--card-background-color, #ffffff));
    --ic-card-2: var(--intercom-surface, var(--secondary-background-color, #eef1f5));
    --ic-line: var(--divider-color, #dfe4ea);
    --ic-text: var(--primary-text-color, #1f2429);
    --ic-text-2: var(--secondary-text-color, #6b7480);
    --ic-accent: var(--intercom-accent, var(--primary-color, #0b8bd6));
    --ic-accent-soft: var(--intercom-accent-soft, rgba(var(--rgb-primary-color, 11, 139, 214), 0.14));
    --ic-ok: var(--intercom-ok, var(--success-color, #2e9e5b));
    --ic-ok-soft: rgba(var(--rgb-success-color, 46, 158, 91), 0.14);
    --ic-danger: var(--error-color, #d4443b);
    --ic-danger-soft: rgba(var(--rgb-error-color, 212, 68, 59), 0.14);
    --ic-live-ground: #14171b;
    /* Eigene Rundung, Schatten und Rand: Panel-Ansichten setzen die ha-card-Variablen auf 0/none, das soll hier nicht durchschlagen */
    --ic-shadow: var(--intercom-shadow, 0 1px 2px rgba(20, 30, 40, 0.06), 0 6px 18px rgba(20, 30, 40, 0.06));
    --ic-radius: var(--intercom-radius, 14px);
    --ic-border: 1px solid var(--intercom-border-color, var(--divider-color, rgba(128, 128, 128, 0.18)));
    --ic-font: var(--ha-font-family-body, var(--primary-font-family, Roboto, "Segoe UI", system-ui, -apple-system, sans-serif));
    color: var(--ic-text);
    font-family: var(--ic-font);
    font-size: 14px;
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  button {
    font: inherit;
    color: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  button:disabled {
    opacity: 0.45;
    cursor: default;
  }
  button:focus-visible,
  [tabindex]:focus-visible,
  input:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--ic-accent);
    outline-offset: 2px;
  }
  svg {
    width: 22px;
    height: 22px;
    fill: currentColor;
    flex: none;
  }
  [hidden] {
    display: none !important;
  }
`;

/* Wiederkehrende Bausteine: Karte, Kopfzeile, Knoepfe, Punkte, Schalter, Regler. */
export const controls = css`
  .card {
    background: var(--ic-card);
    border-radius: var(--ic-radius);
    box-shadow: var(--ic-shadow);
    border: var(--ic-border);
    min-height: 0;
  }
  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 16px 2px;
    min-height: 46px;
  }
  .card-head h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 500;
  }
  .card-head .r {
    display: flex;
    gap: 8px;
    align-items: center;
    min-height: 32px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--ic-ok);
    display: inline-block;
    flex: none;
  }
  .dot.off {
    background: var(--ic-text-2);
  }
  .dot.bad {
    background: var(--ic-danger);
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.03em;
    border-radius: 999px;
    padding: 3px 10px;
    background: var(--ic-accent-soft);
    color: var(--ic-accent);
    white-space: nowrap;
  }
  .badge .dot {
    background: currentColor;
  }
  .badge.ok {
    background: var(--ic-ok-soft);
    color: var(--ic-ok);
  }
  .badge.muted {
    background: var(--ic-card-2);
    color: var(--ic-text-2);
  }
  .badge.danger {
    background: var(--ic-danger-soft);
    color: var(--ic-danger);
  }
  .btn {
    border: 0;
    border-radius: 12px;
    padding: 13px 14px;
    font-size: 15px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    background: var(--ic-card-2);
    color: var(--ic-text);
    white-space: nowrap;
  }
  .btn.ok {
    background: var(--ic-ok);
    color: #fff;
  }
  .btn.danger {
    background: var(--ic-danger);
    color: #fff;
  }
  .btn.accent {
    background: var(--ic-accent);
    color: #fff;
  }
  .btn.ghost {
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
  }
  .pill {
    border: 0;
    border-radius: 999px;
    padding: 8px 14px;
    background: var(--ic-card-2);
    color: var(--ic-text);
    font-weight: 500;
    white-space: nowrap;
  }
  .pill.accent {
    background: var(--ic-accent-soft);
    color: var(--ic-accent);
  }
  .pill.danger {
    background: var(--ic-danger-soft);
    color: var(--ic-danger);
  }
  .pill.small {
    padding: 6px 11px;
    font-size: 13px;
  }
  .icb {
    width: 38px;
    height: 38px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: var(--ic-text-2);
    display: grid;
    place-items: center;
    flex: none;
  }
  .icb:hover {
    background: var(--ic-card-2);
  }
  .icb.on {
    background: var(--ic-accent-soft);
    color: var(--ic-accent);
  }
  .icb.danger {
    color: var(--ic-danger);
  }
  .ctl {
    display: flex;
    gap: 2px;
    align-items: center;
  }
  .confirm {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--ic-text-2);
    white-space: nowrap;
  }
  .sw {
    width: 46px;
    height: 26px;
    border-radius: 999px;
    border: 0;
    background: var(--ic-line);
    position: relative;
    flex: none;
    padding: 0;
  }
  .sw::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transition: left 0.15s;
  }
  .sw[aria-checked="true"] {
    background: var(--ic-accent);
  }
  .sw[aria-checked="true"]::after {
    left: 23px;
  }
  .slider {
    position: relative;
    height: 36px;
    border-radius: 11px;
    background: var(--ic-card-2);
    overflow: hidden;
    min-width: 0;
  }
  .slider .fill {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: var(--pct, 50%);
    background: var(--ic-accent-soft);
    border-right: 3px solid var(--ic-accent);
    pointer-events: none;
  }
  .slider .val {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    padding-left: 12px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    pointer-events: none;
  }
  .slider .val small {
    color: var(--ic-text-2);
    font-weight: 400;
    margin-left: 6px;
  }
  .slider input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: pointer;
    touch-action: none;
  }
  .sel {
    font: inherit;
    color: var(--ic-text);
    background: var(--ic-card-2);
    border: 1px solid var(--ic-line);
    border-radius: 10px;
    padding: 8px 10px;
    max-width: 100%;
  }
  .txt {
    font: inherit;
    color: var(--ic-text);
    background: var(--ic-card);
    border: 1px solid var(--ic-line);
    border-radius: 8px;
    padding: 6px 8px;
    width: 100%;
    min-width: 0;
  }
  .empty {
    padding: 22px 16px;
    color: var(--ic-text-2);
    text-align: center;
    font-size: 13px;
  }
  .note {
    padding: 10px 16px;
    color: var(--ic-danger);
    font-size: 13px;
  }
`;
