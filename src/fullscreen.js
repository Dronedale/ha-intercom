/* Vollbild-Ebene: grosses Livebild mit den Anrufknoepfen, wird an document.body gehaengt. */

import { LitElement, html, css, nothing } from "lit";
import { tokens, controls } from "./styles.js";
import { ICONS, createCard } from "./common.js";
import { SIP } from "./sip.js";

const icon = (name) => html`<svg viewBox="0 0 24 24"><path d=${ICONS[name]}></path></svg>`;

export class IntercomFullscreen extends LitElement {
  static properties = {
    hass: { attribute: false },
    cameraConfig: { attribute: false },
    t: { attribute: false },
    label: { attribute: false },
    view: { attribute: false },
    ratio: { attribute: false },
    _camera: { state: true },
    _confirm: { state: true },
  };

  static styles = [
    tokens,
    controls,
    css`
      :host {
        position: fixed;
        inset: 0;
        z-index: 10000;
        background: #000;
        display: block;
        color: #f3f5f7;
      }
      .stage {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        --ha-card-border-radius: 0;
        --ha-card-box-shadow: none;
        --ha-card-border-width: 0;
      }
      .stage > * {
        width: min(100%, calc(100vh * var(--fs-ratio, 1.7778)));
        width: min(100%, calc(100dvh * var(--fs-ratio, 1.7778)));
        max-height: 100%;
      }
      .ov {
        position: absolute;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 11px;
        border-radius: 999px;
        background: rgba(10, 12, 14, 0.6);
        color: #f3f5f7;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.06em;
        backdrop-filter: blur(6px);
        top: 16px;
        left: 16px;
        max-width: calc(100% - 200px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ov .dot {
        background: #ff5a4f;
        box-shadow: 0 0 0 3px rgba(255, 90, 79, 0.25);
      }
      .close {
        position: absolute;
        top: 16px;
        right: 16px;
        height: 36px;
        padding: 0 12px;
        border: 0;
        border-radius: 9px;
        background: rgba(10, 12, 14, 0.6);
        color: #f3f5f7;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
        backdrop-filter: blur(6px);
      }
      .bar {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 16px 20px max(22px, env(safe-area-inset-bottom));
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 14px;
        align-items: center;
        background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.75));
      }
      .tools {
        display: flex;
        gap: 6px;
      }
      .tools button {
        width: 44px;
        height: 44px;
        border: 0;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.14);
        color: #f3f5f7;
        display: grid;
        place-items: center;
      }
      .tools button.on {
        background: var(--ic-danger);
      }
      .mid {
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
      }
      .mid .btn {
        min-width: 150px;
        padding: 15px 18px;
        font-size: 16px;
      }
      .title {
        position: absolute;
        left: 20px;
        right: 20px;
        bottom: 96px;
        text-align: center;
        text-shadow: 0 1px 6px rgba(0, 0, 0, 0.7);
        pointer-events: none;
      }
      .title .big {
        font-size: 20px;
        font-weight: 500;
      }
      .title .meta {
        font-size: 13px;
        opacity: 0.85;
        font-variant-numeric: tabular-nums;
      }
      .ph {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: #9aa3ae;
      }
      @media (max-width: 700px) {
        .bar {
          grid-template-columns: 1fr;
          justify-items: center;
        }
        .mid .btn {
          min-width: 120px;
          padding: 12px 14px;
          font-size: 15px;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.view = {};
    this._camera = null;
    this._confirm = false;
    this._onKey = (e) => {
      if (e.key === "Escape") this._emit("close");
    };
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("keydown", this._onKey);
    this._buildCamera();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this._onKey);
  }

  async _buildCamera() {
    if (!this.cameraConfig) return;
    try {
      const el = await createCard(this.cameraConfig);
      el.hass = this.hass;
      this._camera = el;
    } catch (e) {
      this._camera = null;
    }
  }

  updated(changed) {
    if (changed.has("hass") && this._camera) this._camera.hass = this.hass;
    if (changed.has("ratio") && this.ratio) this.style.setProperty("--fs-ratio", String(this.ratio));
  }

  _emit(name) {
    this.dispatchEvent(new CustomEvent(`intercom-${name}`, { bubbles: false }));
  }

  _door() {
    if (this.view.doorConfirm && !this._confirm) {
      this._confirm = true;
      window.setTimeout(() => {
        this._confirm = false;
      }, 5000);
      return;
    }
    this._confirm = false;
    this._emit("door");
  }

  render() {
    const t = this.t || ((k) => k);
    const v = this.view || {};
    const sip = v.sip || SIP.IDLE;
    return html`
      <div class="stage">${this._camera || html`<div class="ph">${icon("image")}</div>`}</div>
      <div class="ov"><span class="dot"></span>${t("live")}${this.label ? ` · ${this.label}` : ""}</div>
      <button type="button" class="close" @click=${() => this._emit("close")}>${icon("close")}${t("shrink")}</button>
      ${v.title
        ? html`<div class="title">
            <div class="big">${v.title}</div>
            ${v.meta ? html`<div class="meta">${v.meta}</div>` : nothing}
          </div>`
        : nothing}
      <div class="bar">
        <div class="tools">
          ${sip === SIP.CONNECTED
            ? html`<button type="button" class=${v.muted ? "on" : ""} aria-label=${v.muted ? t("unmute") : t("mute")} @click=${() => this._emit("mute")}>
                ${icon(v.muted ? "micOff" : "mic")}
              </button>`
            : nothing}
        </div>
        <div class="mid">
          ${sip === SIP.INCOMING
            ? html`<button type="button" class="btn ok" @click=${() => this._emit("answer")}>${icon("phone")}${t("answer")}</button>
                <button type="button" class="btn danger" @click=${() => this._emit("hangup")}>${icon("hangup")}${t("reject")}</button>`
            : nothing}
          ${sip === SIP.OUTGOING || sip === SIP.CONNECTING || sip === SIP.CONNECTED
            ? html`<button type="button" class="btn danger" @click=${() => this._emit("hangup")}>${icon("hangup")}${t("hangup")}</button>`
            : nothing}
          ${sip === SIP.IDLE && v.sipAvailable
            ? html`<button type="button" class="btn ok" @click=${() => this._emit("call")}>${icon("phone")}${t("call_door")}</button>`
            : nothing}
          ${v.doorAvailable
            ? html`<button type="button" class="btn ${this._confirm ? "danger" : "ghost"}" ?disabled=${v.doorBusy} @click=${this._door}>
                ${icon("lockOpen")}${this._confirm ? t("really_open") : v.doorBusy ? t("door_busy") : t("open_door")}
              </button>`
            : nothing}
        </div>
        <div></div>
      </div>
    `;
  }
}

customElements.define("intercom-fullscreen", IntercomFullscreen);
