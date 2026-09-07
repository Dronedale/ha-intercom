/* Einstellungskarte: Klingeln, Anrufbeantworter, weitere Gruppen aus der Konfiguration, Status. */

import { LitElement, html, css, nothing } from "lit";
import { tokens, controls } from "./styles.js";
import { ICONS, fetchInfo, makeT, pickLanguage, stateOf, fmtWhen, friendlyName } from "./common.js";

const icon = (name) => html`<svg viewBox="0 0 24 24"><path d=${ICONS[name]}></path></svg>`;

function domainOf(entityId) {
  return String(entityId || "").split(".")[0];
}

export class IntercomSettingsCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    popup: { type: Boolean },
    _config: { state: true },
    _info: { state: true },
    _error: { state: true },
    _drag: { state: true },
  };

  static styles = [
    tokens,
    controls,
    css`
      :host {
        display: block;
      }
      .wrap {
        background: var(--ic-card);
        border-radius: var(--ic-radius);
        box-shadow: var(--ic-shadow);
        border: var(--ic-border);
      }
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 18px 8px;
        position: sticky;
        top: 0;
        background: var(--ic-card);
        z-index: 1;
        border-radius: var(--ic-radius) var(--ic-radius) 0 0;
      }
      .head h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
      .close {
        width: 36px;
        height: 36px;
        border: 0;
        border-radius: 10px;
        background: var(--ic-card-2);
        color: var(--ic-text-2);
        display: grid;
        place-items: center;
      }
      .group {
        padding: 4px 18px 10px;
      }
      .group h3 {
        margin: 12px 0 4px;
        font-size: 12px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--ic-text-2);
        font-weight: 500;
      }
      .srow {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        align-items: center;
        padding: 10px 0;
        border-top: 1px solid var(--ic-line);
      }
      .srow:first-of-type {
        border-top: 0;
      }
      .srow .t {
        font-weight: 500;
      }
      .srow .s {
        color: var(--ic-text-2);
        font-size: 12px;
      }
      .srow.wide {
        grid-template-columns: 1fr;
      }
      .srow .slider {
        height: 34px;
        margin-top: 6px;
      }
      .foot {
        padding: 6px 18px 16px;
        color: var(--ic-text-2);
        font-size: 12px;
      }
    `,
  ];

  constructor() {
    super();
    this.popup = false;
    this._config = {};
    this._info = undefined;
    this._error = null;
    this._drag = {};
    this._pendingInfo = false;
  }

  setConfig(config) {
    this._config = { ...(config || {}) };
    this._info = undefined;
    if (this.hass) this._loadInfo();
    else this._pendingInfo = true;
  }

  getCardSize() {
    return 10;
  }

  async _loadInfo() {
    if (!this.hass) return;
    try {
      this._info = await fetchInfo(this.hass, this._config.entry_id);
      this._error = null;
    } catch (e) {
      this._info = null;
      this._error = e && e.message ? e.message : String(e);
    }
  }

  updated(changed) {
    if (changed.has("hass") && this.hass && (this._pendingInfo || this._info === undefined)) {
      this._pendingInfo = false;
      this._loadInfo();
    }
  }

  get t() {
    return makeT(pickLanguage(this.hass, this._config));
  }

  _groups(t) {
    const ents = (this._info && this._info.entities) || {};
    const groups = [];
    if (this._config.show_defaults !== false && this._info) {
      groups.push({
        name: t("g_ring"),
        rows: [
          { entity: ents.klingeldauer, name: t("s_klingeldauer"), description: t("s_klingeldauer_d") },
          { entity: ents.freizeichen, name: t("s_freizeichen"), description: t("s_freizeichen_d") },
          { entity: ents.klingelton, name: t("s_klingelton"), description: t("s_klingelton_d") },
        ],
      });
      groups.push({
        name: t("g_answering"),
        rows: [
          { entity: ents.mailbox, name: t("s_mailbox"), description: t("s_mailbox_d") },
          { entity: ents.sprachansage, name: t("s_sprachansage"), description: t("s_sprachansage_d") },
          { entity: ents.ansage, name: t("s_ansage"), description: t("s_ansage_d") },
          { entity: ents.sprechzeit, name: t("s_sprechzeit"), description: t("s_sprechzeit_d") },
          { entity: ents.aufbewahrung, name: t("s_aufbewahrung"), description: t("s_aufbewahrung_d") },
        ],
      });
    }
    for (const g of this._config.groups || []) {
      const rows = (g.rows || g.entities || []).map((r) => (typeof r === "string" ? { entity: r } : r));
      groups.push({ name: g.name || "", rows });
    }
    return groups
      .map((g) => ({ ...g, rows: g.rows.filter((r) => r && r.entity && stateOf(this.hass, r.entity)) }))
      .filter((g) => g.rows.length);
  }

  _call(domain, service, data) {
    return this.hass.callService(domain, service, data);
  }

  _toggle(entityId) {
    this._call("homeassistant", "toggle", { entity_id: entityId });
  }

  _setNumber(entityId, value) {
    const d = domainOf(entityId);
    this._call(d === "input_number" ? "input_number" : "number", "set_value", { entity_id: entityId, value });
  }

  _setOption(entityId, option) {
    const d = domainOf(entityId);
    this._call(d === "input_select" ? "input_select" : "select", "select_option", { entity_id: entityId, option });
  }

  _renderRow(row, t) {
    const st = stateOf(this.hass, row.entity);
    const d = domainOf(row.entity);
    const name = row.name || friendlyName(this.hass, row.entity);
    const desc = row.description || "";
    const label = html`<div><div class="t">${name}</div>${desc ? html`<div class="s">${desc}</div>` : nothing}</div>`;
    if (d === "switch" || d === "input_boolean") {
      const on = st.state === "on";
      return html`<div class="srow">
        ${label}
        <button type="button" class="sw" role="switch" aria-checked=${on ? "true" : "false"} aria-label=${name} @click=${() => this._toggle(row.entity)}></button>
      </div>`;
    }
    if (d === "number" || d === "input_number") {
      const a = st.attributes || {};
      const min = Number(a.min ?? 0);
      const max = Number(a.max ?? 100);
      const step = Number(a.step ?? 1);
      const unit = row.unit || a.unit_of_measurement || "";
      const cur = this._drag[row.entity] !== undefined ? this._drag[row.entity] : Number(st.state);
      const val = Number.isFinite(cur) ? cur : min;
      const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
      return html`<div class="srow wide">
        ${label}
        <div class="slider" style="--pct:${pct}%">
          <div class="fill"></div>
          <div class="val">${Number.isInteger(step) ? Math.round(val) : val}<small>${unit}</small></div>
          <input
            type="range"
            aria-label=${name}
            min=${min}
            max=${max}
            step=${step}
            .value=${String(val)}
            @input=${(e) => {
              this._drag = { ...this._drag, [row.entity]: Number(e.target.value) };
            }}
            @change=${(e) => {
              const v = Number(e.target.value);
              const next = { ...this._drag };
              delete next[row.entity];
              this._drag = next;
              this._setNumber(row.entity, v);
            }}
          />
        </div>
      </div>`;
    }
    if (d === "select" || d === "input_select") {
      const options = (st.attributes && st.attributes.options) || [];
      return html`<div class="srow">
        ${label}
        <select class="sel" aria-label=${name} @change=${(e) => this._setOption(row.entity, e.target.value)}>
          ${options.map((o) => html`<option value=${o} ?selected=${o === st.state}>${o}</option>`)}
        </select>
      </div>`;
    }
    const unit = (st.attributes && st.attributes.unit_of_measurement) || "";
    let text = st.state;
    if (st.attributes && st.attributes.device_class === "timestamp") text = fmtWhen(st.state, pickLanguage(this.hass, this._config), t);
    if (d === "binary_sensor") text = st.state === "on" ? t("st_running") : t("st_idle");
    return html`<div class="srow">${label}<span class="badge muted">${text}${unit ? ` ${unit}` : ""}</span></div>`;
  }

  _statusRows(t) {
    const info = this._info;
    if (!info) return [];
    const ents = info.entities || {};
    const rows = [];
    const reg = (ext, key) => {
      const id = `binary_sensor.${ext}_registered`;
      const st = stateOf(this.hass, id);
      if (!ext || !st) return;
      const on = st.state === "on";
      rows.push({ name: t(key, { ext }), value: on ? t("st_registered") : t("st_not_registered"), cls: on ? "ok" : "danger" });
    };
    reg(info.ext_door, "st_door");
    reg(info.ext_tablet, "st_tablet");
    const ami = stateOf(this.hass, info.ami_connected_entity);
    if (ami) rows.push({ name: t("st_asterisk"), value: ami.state === "on" ? t("st_connected") : t("st_disconnected"), cls: ami.state === "on" ? "ok" : "danger" });
    const rec = stateOf(this.hass, ents.aufnahme);
    if (rec) rows.push({ name: t("st_recording"), value: rec.state === "on" ? t("st_running") : t("st_idle"), cls: rec.state === "on" ? "" : "muted" });
    const last = stateOf(this.hass, ents.letztes_klingeln);
    if (last) {
      const ok = last.state && last.state !== "unknown" && last.state !== "unavailable";
      rows.push({ name: t("last_ring"), value: ok ? fmtWhen(last.state, pickLanguage(this.hass, this._config), t) : t("never"), cls: "muted" });
    }
    return rows;
  }

  render() {
    const t = this.t;
    const title = this._config.title || t("settings_title");
    let body;
    if (this._info === undefined) body = html`<div class="empty">${t("loading")}</div>`;
    else if (this._info === null) body = html`<div class="empty">${t("not_configured")}<br /><small>${this._error || t("not_configured_hint")}</small></div>`;
    else {
      const groups = this._groups(t);
      const status = this._config.show_status === false ? [] : this._statusRows(t);
      body = html`
        ${groups.map(
          (g) => html`<div class="group">
            ${g.name ? html`<h3>${g.name}</h3>` : nothing}
            ${g.rows.map((r) => this._renderRow(r, t))}
          </div>`
        )}
        ${status.length
          ? html`<div class="group">
              <h3>${t("g_status")}</h3>
              ${status.map(
                (r) => html`<div class="srow">
                  <div><div class="t">${r.name}</div></div>
                  <span class="badge ${r.cls}">${r.cls === "ok" || r.cls === "danger" ? html`<span class="dot"></span>` : nothing}${r.value}</span>
                </div>`
              )}
            </div>`
          : nothing}
        ${this._config.footer ? html`<div class="foot">${this._config.footer}</div>` : html`<div style="height:8px"></div>`}
      `;
    }
    return html`<div class="wrap">
      <div class="head">
        <h2>${title}</h2>
        ${this.popup
          ? html`<button type="button" class="close" aria-label=${t("close")} @click=${() => this.dispatchEvent(new CustomEvent("intercom-close"))}>${icon("close")}</button>`
          : nothing}
      </div>
      ${body}
    </div>`;
  }
}

customElements.define("intercom-settings-card", IntercomSettingsCard);

/* Popup-Huelle: abgedunkelter Hintergrund, Einstellungskarte in der Mitte. */
export class IntercomPopup extends LitElement {
  static properties = { hass: { attribute: false }, config: { attribute: false } };

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(8, 10, 12, 0.55);
    }
    .box {
      width: min(560px, 100%);
      max-height: calc(100vh - 40px);
      max-height: calc(100dvh - 40px);
      overflow: auto;
      border-radius: var(--intercom-radius, 14px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
    }
  `;

  constructor() {
    super();
    this._onKey = (e) => {
      if (e.key === "Escape") this.close();
    };
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("keydown", this._onKey);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this._onKey);
  }

  close() {
    this.remove();
  }

  firstUpdated() {
    const card = document.createElement("intercom-settings-card");
    card.setConfig(this.config || {});
    card.hass = this.hass;
    card.popup = true;
    card.addEventListener("intercom-close", () => this.close());
    this._card = card;
    this.renderRoot.querySelector(".box").appendChild(card);
  }

  updated(changed) {
    if (changed.has("hass") && this._card) this._card.hass = this.hass;
  }

  render() {
    return html`<div class="box" @click=${(e) => e.stopPropagation()}></div>`;
  }
}

customElements.define("intercom-popup", IntercomPopup);

export function openSettingsPopup(hass, config) {
  const old = document.querySelector("intercom-popup");
  if (old) old.remove();
  const el = document.createElement("intercom-popup");
  el.hass = hass;
  el.config = config;
  el.addEventListener("click", (e) => {
    if (e.target === el) el.close();
  });
  document.body.appendChild(el);
  return el;
}
