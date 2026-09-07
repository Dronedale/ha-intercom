/* Intercom-Karte: Livebild, Sprechanlage (Anruf, Kontakte, Waehlen), Tuer und Lautstaerke, Mailbox, Ansagen, Status. */

import { LitElement, html, css, nothing } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { tokens, controls } from "./styles.js";
import { VERSION, ICONS, makeT, pickLanguage, fmtDuration, fmtWhen, fmtDate, fmtClock, signPath, signedCached, fetchInfo, stateOf, isOn, numState, createCard } from "./common.js";
import { SipLink, SIP } from "./sip.js";
import { AudioRecorder, recordingSupported } from "./recorder.js";
import "./fullscreen.js";
import { openSettingsPopup } from "./settings-card.js";

const icon = (name) => html`<svg viewBox="0 0 24 24"><path d=${ICONS[name]}></path></svg>`;
const RING_STATE = "Ringing";
const KEYS = [
  ["1", ""],
  ["2", "ABC"],
  ["3", "DEF"],
  ["4", "GHI"],
  ["5", "JKL"],
  ["6", "MNO"],
  ["7", "PQRS"],
  ["8", "TUV"],
  ["9", "WXYZ"],
  ["*", ""],
  ["0", "+"],
  ["#", ""],
];

function domainOf(id) {
  return String(id || "").split(".")[0];
}

export class IntercomCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _info: { state: true },
    _infoError: { state: true },
    _tab: { state: true },
    _dial: { state: true },
    _open: { state: true },
    _clipUrl: { state: true },
    _mtab: { state: true },
    _confirm: { state: true },
    _rec: { state: true },
    _playing: { state: true },
    _renaming: { state: true },
    _volDrag: { state: true },
    _doorBusy: { state: true },
    _now: { state: true },
    _sipTick: { state: true },
    _sipError: { state: true },
    _pad: { state: true },
    _alarmError: { state: true },
  };

  static getStubConfig() {
    return { name: "Doorbell", fullscreen_on_ring: true, contacts: [] };
  }

  static styles = [
    tokens,
    controls,
    css`
      :host {
        display: block;
      }
      .app {
        --gap: 14px;
        --ratio: var(--intercom-live-ratio, 1.7778);
        --side-w: var(--intercom-side-width, 220px);
        --live-h: var(--intercom-live-height, 300px);
        --live-w: min(calc(var(--live-h) * var(--ratio)), 52cqw);
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        gap: 10px;
        min-height: 0;
        padding: var(--intercom-padding, 0);
        container-type: inline-size;
      }
      .app.nohead {
        grid-template-rows: minmax(0, 1fr);
        gap: 0;
      }
      .app.fill {
        height: calc(100vh - var(--intercom-top, var(--header-height, 56px)) - var(--intercom-offset, 0px));
        height: calc(100dvh - var(--intercom-top, var(--header-height, 56px)) - var(--intercom-offset, 0px));
        container-type: size;
        --live-h: calc((100cqh - var(--head-h, 46px)) * var(--intercom-live-pct, 0.5));
      }
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 36px;
      }
      .head h1 {
        font-size: 22px;
        font-weight: 400;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .chips {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
      }
      .chip.mini {
        padding: 3px 9px;
        font-size: 11.5px;
        box-shadow: none;
        background: var(--ic-card-2);
        border: 0;
      }
      .gear.wide {
        width: auto;
        height: 32px;
        padding: 0 12px 0 10px;
        gap: 7px;
        border: 0;
        border-radius: 999px;
        background: var(--ic-card-2);
        color: var(--ic-text);
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
      }
      .gear.wide svg {
        width: 19px;
        height: 19px;
        color: var(--ic-text-2);
      }
      .card-head .hl {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        flex-wrap: wrap;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 5px 11px;
        border-radius: 999px;
        background: var(--ic-card);
        box-shadow: var(--ic-shadow);
        border: var(--ic-border);
        font-size: 12px;
        white-space: nowrap;
      }
      .gear {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 999px;
        border: 1px solid var(--ic-line);
        background: var(--ic-card);
        color: var(--ic-text-2);
      }
      .main {
        min-height: 0;
        display: grid;
        grid-template-columns: calc(var(--live-w) + var(--gap) + var(--side-w)) minmax(0, 1fr);
        grid-template-rows: minmax(0, 1fr);
        gap: var(--gap);
      }
      .main.nomail {
        grid-template-columns: calc(var(--live-w) + var(--gap) + var(--side-w));
      }
      .left {
        min-height: 0;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        gap: var(--gap);
      }
      .left.nocall {
        grid-template-rows: auto;
      }
      .top {
        min-height: 0;
        display: grid;
        grid-template-columns: var(--live-w) minmax(0, 1fr);
        gap: var(--gap);
      }

      /* Livebild */
      .live {
        position: relative;
        width: var(--live-w);
        aspect-ratio: var(--ratio);
        border-radius: var(--ic-radius);
        overflow: hidden;
        background: var(--ic-live-ground);
        box-shadow: var(--ic-shadow);
        border: var(--ic-border);
      }
      .live .cam {
        position: absolute;
        inset: 0;
        --ha-card-border-radius: 0;
        --ha-card-box-shadow: none;
        --ha-card-border-width: 0;
      }
      .live .cam > * {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
      .live .ph {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: #6b7480;
      }
      .live.ringing::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: var(--ic-radius);
        box-shadow: inset 0 0 0 3px var(--ic-accent);
        animation: frame-pulse 1.4s ease-in-out infinite;
        pointer-events: none;
      }
      @keyframes frame-pulse {
        0%,
        100% {
          opacity: 0.35;
        }
        50% {
          opacity: 1;
        }
      }
      .ov {
        position: absolute;
        top: 10px;
        left: 10px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 5px 10px;
        border-radius: 999px;
        background: rgba(10, 12, 14, 0.55);
        color: #f3f5f7;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.06em;
        backdrop-filter: blur(6px);
        pointer-events: none;
      }
      .ov .dot {
        background: #ff5a4f;
        box-shadow: 0 0 0 3px rgba(255, 90, 79, 0.25);
      }
      .ov.rec {
        top: auto;
        bottom: 10px;
        left: 10px;
      }
      .zoombtn {
        position: absolute;
        right: 10px;
        bottom: 10px;
        height: 34px;
        padding: 0 12px 0 10px;
        border: 0;
        border-radius: 9px;
        background: rgba(10, 12, 14, 0.55);
        color: #f3f5f7;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
        font-size: 13px;
        backdrop-filter: blur(6px);
      }
      .zoombtn svg {
        width: 18px;
        height: 18px;
      }

      /* Karte neben dem Bild: Alarmanlage oder Status */
      .side {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        gap: 10px;
        padding: 12px 14px 14px;
        min-height: 0;
        overflow: hidden;
      }
      .side .h {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        line-height: 1.2;
      }
      .side .h .ic {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: grid;
        place-items: center;
        background: var(--ic-card-2);
        color: var(--ic-text-2);
        flex: none;
      }
      .side .h .s {
        display: block;
        font-weight: 400;
        font-size: 12px;
        color: var(--ic-text-2);
      }
      .alarm.ok .h .ic {
        background: var(--ic-ok-soft);
        color: var(--ic-ok);
      }
      .alarm.armed .h .ic,
      .alarm.trig .h .ic {
        background: var(--ic-danger-soft);
        color: var(--ic-danger);
      }
      .alarm.busy .h .ic {
        background: var(--ic-accent-soft);
        color: var(--ic-accent);
      }
      .modes {
        display: grid;
        grid-auto-rows: minmax(0, 1fr);
        gap: 10px;
        min-height: 0;
      }
      .mode {
        border: 0;
        border-radius: 12px;
        background: var(--ic-card-2);
        display: grid;
        grid-template-columns: 38px minmax(0, 1fr);
        gap: 10px;
        align-items: center;
        padding: 0 10px;
        text-align: left;
        font-weight: 500;
        color: var(--ic-text);
        min-height: 44px;
        min-width: 0;
      }
      .mode .mi {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: grid;
        place-items: center;
        background: var(--ic-card);
        color: var(--ic-text-2);
      }
      .mode .mi svg {
        width: 22px;
        height: 22px;
      }
      .mode small {
        display: block;
        font-weight: 400;
        font-size: 11px;
        color: var(--ic-text-2);
      }
      .mode.on {
        background: var(--ic-ok-soft);
        color: var(--ic-ok);
      }
      .mode.on .mi {
        background: var(--ic-ok);
        color: #fff;
      }
      .mode.armed.on {
        background: var(--ic-danger-soft);
        color: var(--ic-danger);
      }
      .mode.armed.on .mi {
        background: var(--ic-danger);
        color: #fff;
      }
      .pad .err {
        color: var(--ic-danger);
        font-size: 12px;
        text-align: center;
        font-weight: 500;
      }
      .pad {
        display: grid;
        grid-template-rows: auto auto minmax(0, 1fr) auto;
        gap: 6px;
        min-height: 0;
      }
      .pad .ptitle {
        font-size: 12px;
        color: var(--ic-text-2);
        text-align: center;
      }
      .pad .code {
        text-align: center;
        font-size: 22px;
        letter-spacing: 0.3em;
        height: 30px;
        line-height: 30px;
        font-variant-numeric: tabular-nums;
      }
      .pad .code .ph {
        color: var(--ic-line);
      }
      .keys2 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-auto-rows: minmax(0, 1fr);
        gap: 6px;
        min-height: 0;
      }
      .keys2 button {
        border: 0;
        border-radius: 10px;
        background: var(--ic-card-2);
        color: var(--ic-text);
        font-size: 17px;
        font-weight: 500;
        min-height: 34px;
        display: grid;
        place-items: center;
      }
      .keys2 button.ok {
        background: var(--ic-ok);
        color: #fff;
      }
      .pad .cancel {
        border: 0;
        background: transparent;
        color: var(--ic-text-2);
        padding: 4px;
        font-size: 13px;
      }
      .status .sh {
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--ic-text-2);
        font-weight: 500;
      }
      .srows {
        display: grid;
        align-content: start;
        gap: 10px;
        overflow: auto;
      }
      .srow {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 10px;
        align-items: center;
      }
      .srow .t {
        font-weight: 500;
        font-size: 13px;
      }
      .srow .s {
        color: var(--ic-text-2);
        font-size: 12px;
      }

      /* Sprechanlage */
      .call {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        overflow: hidden;
      }
      .split {
        display: grid;
        grid-template-columns: var(--live-w) var(--gap) minmax(0, 1fr);
        min-height: 0;
      }
      .split.nosplit {
        grid-template-columns: minmax(0, 1fr);
      }
      .cpane {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        min-height: 0;
      }
      .vsep {
        position: relative;
      }
      .vsep::before {
        content: "";
        position: absolute;
        top: 8px;
        bottom: 12px;
        left: 50%;
        width: 1px;
        background: var(--ic-line);
      }
      .tabs {
        display: flex;
        gap: 4px;
        padding: 0 12px;
        border-bottom: 1px solid var(--ic-line);
      }
      .tabs button {
        border: 0;
        background: transparent;
        padding: 10px 12px;
        color: var(--ic-text-2);
        font-weight: 500;
        position: relative;
      }
      .tabs button[aria-selected="true"] {
        color: var(--ic-accent);
      }
      .tabs button[aria-selected="true"]::after {
        content: "";
        position: absolute;
        left: 8px;
        right: 8px;
        bottom: -1px;
        height: 2px;
        border-radius: 2px;
        background: var(--ic-accent);
      }
      .tabs .cnt {
        margin-left: 6px;
        font-size: 11px;
        padding: 1px 6px;
        border-radius: 999px;
        background: var(--ic-accent-soft);
        color: var(--ic-accent);
      }
      .pane {
        min-height: 0;
        display: grid;
        grid-template-rows: minmax(0, 1fr);
        overflow: hidden;
      }
      .call {
        align-self: start;
        display: grid;
        grid-template-rows: auto auto;
      }
      .callzone {
        height: var(--intercom-callzone, 124px);
        display: grid;
        align-content: center;
      }
      .acts {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 12px;
        padding: 10px 16px 12px;
        border-top: 1px solid var(--ic-line);
      }
      .acts.nodoor,
      .acts.notoggles {
        grid-template-columns: minmax(0, 1fr);
      }
      .door {
        display: grid;
        grid-template-rows: auto auto;
        gap: 6px;
        padding: 8px 10px;
        border-radius: 12px;
        background: var(--ic-card-2);
        min-width: 0;
      }
      .door .dh {
        display: grid;
        grid-template-columns: 30px minmax(0, 1fr);
        gap: 8px;
        align-items: center;
      }
      .door .dh .ic {
        width: 30px;
        height: 30px;
        border-radius: 9px;
        display: grid;
        place-items: center;
        background: var(--ic-card);
        color: var(--ic-text-2);
      }
      .door .dh .ic.ok {
        background: var(--ic-ok-soft);
        color: var(--ic-ok);
      }
      .door .dh .ic svg {
        width: 18px;
        height: 18px;
      }
      .door .t {
        font-weight: 500;
        font-size: 13px;
        line-height: 1.15;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .door .s {
        color: var(--ic-text-2);
        font-size: 11.5px;
      }
      .door .btns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
      }
      .door .btns.one {
        grid-template-columns: 1fr;
      }
      .door .btns button {
        border: 0;
        border-radius: 10px;
        height: 38px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-weight: 500;
        font-size: 12.5px;
        background: var(--ic-card);
        color: var(--ic-text);
        white-space: nowrap;
        overflow: hidden;
        min-width: 0;
        padding: 0 8px;
      }
      .door .btns button svg {
        width: 18px;
        height: 18px;
      }
      .door .btns button.open {
        background: var(--ic-accent-soft);
        color: var(--ic-accent);
      }
      .door .btns button.open.danger {
        background: var(--ic-danger);
        color: #fff;
      }
      .stack {
        display: grid;
        grid-template-rows: 1fr 1fr;
        gap: 8px;
        min-width: 0;
      }
      .stack .act {
        min-height: 44px;
        padding: 4px 12px;
      }
      .act {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 10px;
        align-items: center;
        padding: 8px 10px;
        border-radius: 12px;
        background: var(--ic-card-2);
        min-height: 56px;
        border: 0;
        text-align: left;
        color: var(--ic-text);
        min-width: 0;
      }
      .act.toggle.on {
        background: var(--ic-accent-soft);
      }
      .act .t {
        font-weight: 500;
        font-size: 13px;
        line-height: 1.15;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .act .s {
        color: var(--ic-text-2);
        font-size: 11.5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .act .two {
        display: inline-flex;
        gap: 4px;
      }
      .act .slider {
        height: 32px;
      }
      .act .sw {
        width: 40px;
        height: 22px;
      }
      .act .sw::after {
        width: 16px;
        height: 16px;
      }
      .act .sw[aria-checked="true"]::after {
        left: 21px;
      }
      .infos {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        min-height: 0;
        padding: 0 14px 12px 4px;
      }
      .infos .lbl {
        font-size: 14px;
        color: var(--ic-text-2);
        font-weight: 500;
        padding: 10px 12px;
        border-bottom: 1px solid var(--ic-line);
        margin-bottom: 4px;
      }
      .infos .kvs {
        display: grid;
        align-content: start;
        gap: 2px;
        min-height: 0;
        overflow: auto;
      }
      .kv {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 8px;
        align-items: center;
        padding: 7px 0;
        border-top: 1px solid var(--ic-line);
      }
      .kv:first-of-type {
        border-top: 0;
      }
      .kv.clickable {
        cursor: pointer;
      }
      .kv .k {
        color: var(--ic-text-2);
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .kv .v {
        font-weight: 500;
        font-size: 13px;
        text-align: right;
        white-space: nowrap;
      }
      .kv .v.new {
        color: var(--ic-accent);
      }
      .kv .v.on {
        color: var(--ic-ok);
      }
      .statusline {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px 2px;
        color: var(--ic-text-2);
        font-size: 12.5px;
      }
      .statusline .dot {
        width: 7px;
        height: 7px;
      }
      .callstate {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 12px;
        align-items: center;
        padding: 12px 16px 2px;
      }
      .ring {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: var(--ic-card-2);
        color: var(--ic-text-2);
        position: relative;
        flex: none;
      }
      .ring.live {
        background: var(--ic-accent-soft);
        color: var(--ic-accent);
      }
      .ring.ok {
        background: var(--ic-ok-soft);
        color: var(--ic-ok);
      }
      .ring.live::after,
      .ring.live::before {
        content: "";
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        border: 2px solid var(--ic-accent);
        opacity: 0.5;
        animation: pulse 1.6s ease-out infinite;
        pointer-events: none;
      }
      .ring.live::before {
        animation-delay: 0.8s;
      }
      .ring.live svg {
        animation: ring-shake 1.6s ease-in-out infinite;
      }
      @keyframes ring-shake {
        0%,
        40%,
        100% {
          transform: rotate(0deg);
        }
        10% {
          transform: rotate(-14deg);
        }
        20% {
          transform: rotate(14deg);
        }
        30% {
          transform: rotate(-8deg);
        }
      }
      @keyframes pulse {
        0% {
          transform: scale(0.85);
          opacity: 0.6;
        }
        100% {
          transform: scale(1.25);
          opacity: 0;
        }
      }
      .callstate .big {
        font-size: 18px;
        font-weight: 500;
        line-height: 1.2;
      }
      .callstate .meta {
        color: var(--ic-text-2);
        font-variant-numeric: tabular-nums;
        font-size: 13px;
      }
      .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 10px 16px 6px;
      }
      .actions.one {
        grid-template-columns: 1fr;
      }
      .actions .btn {
        padding: 14px 16px;
        font-size: 15px;
      }
      .actions .btn svg {
        width: 20px;
        height: 20px;
      }
      .rows {
        display: grid;
        align-content: start;
        overflow: auto;
        min-height: 0;
      }
      .contact {
        display: grid;
        grid-template-columns: 40px 1fr auto;
        gap: 12px;
        align-items: center;
        padding: 9px 16px;
        border-top: 1px solid var(--ic-line);
      }
      .contact:first-child {
        border-top: 0;
      }
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: var(--ic-card-2);
        color: var(--ic-text-2);
        font-weight: 500;
      }
      .contact .t {
        font-weight: 500;
      }
      .contact .s {
        color: var(--ic-text-2);
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .contact .s .dot {
        width: 7px;
        height: 7px;
      }
      .callbtn {
        width: 40px;
        height: 40px;
        border: 0;
        border-radius: 12px;
        background: var(--ic-ok-soft);
        color: var(--ic-ok);
        display: grid;
        place-items: center;
      }
      .callbtn svg {
        width: 20px;
        height: 20px;
      }
      .callbtn:disabled {
        opacity: 0.45;
      }

      /* Waehlfeld: passt sich der verfuegbaren Hoehe an, Breite folgt proportional */
      .dial {
        container-type: size;
        height: 100%;
        min-height: 0;
        overflow: hidden;
      }
      .dialin {
        --kh: clamp(34px, calc((100cqh - 84px) / 4), 66px);
        --kw: clamp(60px, calc(var(--kh) * 1.85), calc((100cqw - 44px) / 3));
        height: 100%;
        display: grid;
        grid-template-rows: auto auto;
        gap: 8px;
        padding: 8px 16px 10px;
        justify-content: center;
        align-content: center;
      }
      .dial .num {
        min-width: 0;
        height: clamp(36px, calc(var(--kh) * 0.9), 48px);
        border-radius: 12px;
        background: var(--ic-card-2);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 14px;
        font-size: clamp(18px, calc(var(--kh) * 0.45), 24px);
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.06em;
        overflow: hidden;
      }
      .dial .num small {
        font-size: 12px;
        letter-spacing: 0;
        color: var(--ic-text-2);
        white-space: nowrap;
      }
      .keys {
        display: grid;
        grid-template-columns: repeat(3, var(--kw));
        grid-auto-rows: var(--kh);
        gap: 6px;
      }
      .keys button {
        border: 0;
        border-radius: 12px;
        background: var(--ic-card-2);
        font-size: clamp(15px, calc(var(--kh) * 0.42), 22px);
        font-weight: 500;
        line-height: 1.1;
        color: var(--ic-text);
      }
      .keys button small {
        display: block;
        font-size: clamp(8px, calc(var(--kh) * 0.2), 10px);
        letter-spacing: 0.12em;
        color: var(--ic-text-2);
        font-weight: 400;
        line-height: 1;
      }
      .dial .go {
        width: calc(3 * var(--kw) + 12px);
        display: grid;
        grid-template-columns: minmax(0, 1fr) clamp(36px, calc(var(--kh) * 0.9), 48px) clamp(42px, var(--kh), 54px);
        gap: 6px;
      }
      .dial .go .back {
        border: 0;
        border-radius: 12px;
        background: var(--ic-card-2);
        color: var(--ic-text-2);
        display: grid;
        place-items: center;
      }
      .dial .callgo {
        border: 0;
        border-radius: 12px;
        display: grid;
        place-items: center;
        color: #fff;
      }
      .dial .callgo.ok {
        background: var(--ic-ok);
      }
      .dial .callgo.danger {
        background: var(--ic-danger);
      }

      /* Mailbox */
      .mailbox {
        display: grid;
        grid-template-rows: auto auto minmax(0, 1fr);
        overflow: hidden;
      }
      .mpane {
        display: grid;
        grid-template-rows: minmax(0, 1fr) auto;
        min-height: 0;
        overflow: hidden;
      }
      .mpane .rows {
        border-top: 1px solid var(--ic-line);
      }
      .auto .mpane .rows {
        max-height: 320px;
      }
      .recfoot {
        border-top: 1px solid var(--ic-line);
        padding: 8px 16px 12px;
      }
      .recfoot .rec,
      .recfoot .recording,
      .recfoot .preview {
        margin-top: 0;
      }
      .list {
        overflow: auto;
        border-top: 1px solid var(--ic-line);
        min-height: 0;
      }
      .auto .list {
        max-height: 380px;
      }
      .auto .dial .keys button {
        height: 46px;
      }
      .msg {
        display: grid;
        grid-template-columns: 80px 1fr auto;
        gap: 12px;
        align-items: center;
        padding: 8px 16px;
        border-bottom: 1px solid var(--ic-line);
        cursor: pointer;
      }
      .msg.open {
        background: var(--ic-card-2);
        border-bottom: 0;
      }
      .thumb {
        position: relative;
        width: 80px;
        height: 45px;
        border-radius: 7px;
        overflow: hidden;
        background: var(--ic-card-2);
        display: grid;
        place-items: center;
        color: var(--ic-text-2);
      }
      .thumb img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .thumb .len {
        position: absolute;
        right: 4px;
        bottom: 3px;
        font-size: 10px;
        padding: 1px 4px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        font-variant-numeric: tabular-nums;
      }
      .msg .when {
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .msg .when .new {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--ic-accent);
        flex: none;
      }
      .msg .kind {
        color: var(--ic-text-2);
        font-size: 12px;
      }
      .msg .kind.note {
        color: var(--ic-text);
      }
      .player {
        display: grid;
        gap: 8px;
        padding: 2px 16px 12px;
        background: var(--ic-card-2);
        border-bottom: 1px solid var(--ic-line);
      }
      .video {
        position: relative;
        border-radius: 10px;
        overflow: hidden;
        background: #000;
        aspect-ratio: 16 / 9;
        max-height: 300px;
        display: grid;
        place-items: center;
        color: #9aa3ae;
      }
      .video video {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }
      .player .foot {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        color: var(--ic-text-2);
        font-size: 12px;
        flex-wrap: wrap;
      }
      .player .foot .del {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 0;
        background: transparent;
        color: var(--ic-danger);
        font-weight: 500;
        padding: 5px 8px;
        border-radius: 8px;
      }
      .recbanner {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 12px;
        align-items: center;
        padding: 10px 16px;
        border-bottom: 1px solid var(--ic-line);
        background: var(--ic-danger-soft);
      }
      .recbanner .t {
        font-weight: 500;
      }
      .recbanner .s {
        color: var(--ic-text-2);
        font-size: 12px;
      }

      /* Ansagen */
      .ann {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 12px;
        align-items: center;
        padding: 8px 16px;
        border-bottom: 1px solid var(--ic-line);
      }
      .radio {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid var(--ic-line);
        display: grid;
        place-items: center;
        background: transparent;
        padding: 0;
        flex: none;
      }
      .radio.on {
        border-color: var(--ic-accent);
      }
      .radio.on::after {
        content: "";
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--ic-accent);
      }
      .ann .t {
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
      }
      .ann .t span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ann .t .edit {
        border: 0;
        background: transparent;
        color: var(--ic-text-2);
        padding: 2px;
        display: grid;
        place-items: center;
      }
      .ann .t .edit svg {
        width: 15px;
        height: 15px;
      }
      .ann .s {
        color: var(--ic-text-2);
        font-size: 12px;
      }
      .rec {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        align-items: center;
        margin-top: 6px;
      }
      .rec .btn {
        padding: 10px 12px;
        font-size: 14px;
      }
      .rec .hint {
        color: var(--ic-text-2);
        font-size: 12px;
      }
      .recording {
        display: grid;
        grid-template-columns: auto 1fr auto auto;
        gap: 12px;
        align-items: center;
        margin-top: 6px;
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--ic-danger-soft);
      }
      .recdot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--ic-danger);
        animation: blink 1s steps(2, start) infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        .recdot {
          animation: none;
        }
      }
      @keyframes blink {
        to {
          visibility: hidden;
        }
      }
      .recmeta .t {
        font-weight: 500;
      }
      .recmeta .s {
        color: var(--ic-text-2);
        font-size: 12px;
        font-variant-numeric: tabular-nums;
      }
      .bars {
        display: flex;
        align-items: flex-end;
        gap: 3px;
        height: 26px;
      }
      .bars i {
        width: 4px;
        height: 20%;
        border-radius: 2px;
        background: var(--ic-danger);
        display: block;
        transition: height 0.12s;
      }
      .recording .btn {
        padding: 9px 14px;
        font-size: 14px;
      }
      .preview {
        display: grid;
        gap: 8px;
        margin-top: 6px;
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--ic-accent-soft);
      }
      .preview audio {
        width: 100%;
        height: 36px;
      }
      .preview .go {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 8px;
        align-items: center;
      }
      .preview .btn {
        padding: 9px 14px;
        font-size: 14px;
      }

      /* Eine Spalte: Handy und schmale Fenster */
      @media (max-width: 899px) {
        .app.fill {
          height: auto;
          container-type: inline-size;
          --live-h: auto;
        }
        .main,
        .main.nomail {
          grid-template-columns: minmax(0, 1fr);
          grid-template-rows: auto minmax(0, 1fr);
        }
        .left,
        .left.nocall {
          grid-template-rows: auto auto;
        }
        .top {
          grid-template-columns: minmax(0, 1fr);
        }
        .live {
          width: auto;
          aspect-ratio: var(--ratio);
        }
        .side {
          min-height: 0;
        }
        .modes {
          grid-auto-rows: 44px;
        }
        .split {
          grid-template-columns: minmax(0, 1fr);
        }
        .vsep {
          display: none;
        }
        .infos {
          padding: 6px 16px 12px;
          border-top: 1px solid var(--ic-line);
        }
        .head .chip {
          display: none;
        }
        .rows,
        .list,
        .mpane .rows {
          max-height: 380px;
        }
        .dial {
          height: 320px;
        }
      }
    `,
  ];

  constructor() {
    super();
    this._config = null;
    this._info = undefined;
    this._infoError = null;
    this._infoLoading = false;
    this._infoAt = 0;
    this._tab = "call";
    this._dial = "";
    this._open = null;
    this._clipUrl = null;
    this._mtab = "messages";
    this._confirm = null;
    this._rec = { phase: "idle" };
    this._playing = null;
    this._renaming = null;
    this._volDrag = null;
    this._doorBusy = false;
    this._now = Date.now();
    this._sipTick = 0;
    this._sipError = null;
    this._pad = null;
    this._pendingMode = null;
    this._alarmError = null;
    this._alarmFailReason = null;
    this._alarmSub = null;
    this._sip = new SipLink(
      () => this._onSip(),
      (err) => {
        const raw = (err && err.message) || String(err);
        const hints = {
          "User Denied Media Access": "Mikrofon verweigert oder Seite nicht über https geöffnet",
          "WebRTC Error": "WebRTC-Fehler, Mikrofon oder unsichere Verbindung (http)",
          "Not Found": "Nebenstelle unbekannt",
          "Connection Error": "keine Verbindung zu Asterisk",
          "Request Timeout": "keine Antwort von Asterisk",
          Unavailable: "Gegenstelle nicht erreichbar",
          Busy: "besetzt",
          Rejected: "abgewiesen",
        };
        const key = Object.keys(hints).find((k) => raw.startsWith(k));
        this._sipError = key ? `${hints[key]} · ${raw}` : raw;
        window.clearTimeout(this._sipErrorTimer);
        this._sipErrorTimer = window.setTimeout(() => {
          this._sipError = null;
        }, 8000);
      }
    );
    this._cameraEl = null;
    this._cameraKey = null;
    this._fs = null;
    this._fsAuto = false;
    this._popup = null;
    this._recorder = null;
    this._audio = null;
    this._pendingSign = new Set();
    this._wasRinging = false;
    this._ringSeen = 0;
    this._lastSipState = SIP.IDLE;
    this._needTick = false;
    this._timer = null;
  }

  setConfig(config) {
    const c = config || {};
    const show = { live: true, call: true, mailbox: true, announcements: true, status: true, info: true, header: false, ...(c.show || {}) };
    const settings = typeof c.settings === "string" ? { mode: c.settings } : { ...(c.settings || {}) };
    if (!settings.mode) settings.mode = settings.path ? "navigate" : "popup";
    const door = c.door ? (typeof c.door === "string" ? { entity: c.door } : { ...c.door }) : null;
    const volume = c.volume ? (typeof c.volume === "string" ? { entity: c.volume } : { ...c.volume }) : null;
    this._config = {
      name: c.name,
      entry_id: c.entry_id,
      camera: c.camera || null,
      fullscreen_camera: c.fullscreen_camera || null,
      fullscreen_on_ring: !!c.fullscreen_on_ring,
      fullscreen_auto_close: c.fullscreen_auto_close !== false,
      door,
      volume,
      contacts: Array.isArray(c.contacts) ? c.contacts : [],
      status: Array.isArray(c.status) ? c.status : null,
      settings,
      show,
      layout: c.layout === "auto" ? "auto" : "fill",
      height_offset: c.height_offset,
      language: c.language,
      live_aspect: c.live_aspect || null,
      default_tab: c.default_tab || "call",
      padding: c.padding !== undefined && c.padding !== null ? String(c.padding) : null,
      alarm: c.alarm ? (typeof c.alarm === "string" ? { entity: c.alarm } : { ...c.alarm }) : null,
      actions: Array.isArray(c.actions) ? c.actions : null,
      info: Array.isArray(c.info) ? c.info : null,
      side_width: Number(c.side_width) > 0 ? Number(c.side_width) : 220,
      live_height: Number(c.live_height) > 0 ? Math.min(80, Math.max(20, Number(c.live_height))) : 48,
    };
    this._tab = this._config.default_tab;
    this._cameraKey = null;
    this._cameraEl = null;
    if (this.hass) this._ensureCamera();
  }

  getCardSize() {
    return 12;
  }

  getGridOptions() {
    return { columns: "full", rows: "auto" };
  }

  get t() {
    return makeT(pickLanguage(this.hass, this._config || {}));
  }

  connectedCallback() {
    super.connectedCallback();
    this._sip.connect();
    this._timer = window.setInterval(() => this._tick(), 1000);
    this._onResize = () => this._measureTop();
    window.addEventListener("resize", this._onResize);
    window.setTimeout(() => this._measureTop(), 300);
    window.setTimeout(() => this._measureTop(), 2000);
  }

  /* Abstand der Karte zum oberen Fensterrand messen; daraus ergibt sich die Hoehe ohne Seitenscrollen */
  _measureTop() {
    if (!this.isConnected) return;
    const top = Math.max(0, Math.round(this.getBoundingClientRect().top + (window.scrollY || 0)));
    if (top !== this._top) {
      this._top = top;
      this.style.setProperty("--intercom-top", `${top}px`);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._sip.disconnect();
    if (this._timer) window.clearInterval(this._timer);
    this._timer = null;
    if (this._onResize) window.removeEventListener("resize", this._onResize);
    if (this._alarmSub) {
      this._alarmSub.then((subs) => (subs || []).forEach((u) => typeof u === "function" && u())).catch(() => null);
      this._alarmSub = null;
    }
    this._closeFullscreen();
    if (this._popup) this._popup.remove();
    this._popup = null;
    this._stopAudio();
    if (this._recorder) this._recorder.cancel();
    this._recorder = null;
  }

  _tick() {
    if (this._needTick) this._now = Date.now();
    if (this._info === null && this.hass && !this._infoLoading && Date.now() - this._infoAt > 60000) this._loadInfo(true);
  }

  async _loadInfo(force = false) {
    if (!this.hass || this._infoLoading) return;
    this._infoLoading = true;
    this._infoAt = Date.now();
    try {
      this._info = await fetchInfo(this.hass, this._config && this._config.entry_id, force);
      this._infoError = this._info ? null : null;
    } catch (e) {
      this._info = null;
      this._infoError = e && e.message ? e.message : String(e);
    } finally {
      this._infoLoading = false;
    }
    if (this._info) {
      this._ensureCamera();
      this._syncRing();
      this._ensureThumbs();
      this._syncFullscreen();
      this._ensureAlarmEvents();
    }
  }

  firstUpdated() {
    this._measureTop();
  }

  updated(changed) {
    if ((changed.has("_renaming") && this._renaming) || (changed.has("_rec") && this._rec.phase === "preview" && changed.get("_rec") && changed.get("_rec").phase !== "preview")) {
      const input = this.renderRoot.querySelector("input.txt");
      if (input) {
        input.focus();
        input.select();
      }
    }
    if (!changed.has("hass") || !this.hass) return;
    this._ensureAlarmEvents();
    if (this._info === undefined && !this._infoLoading) this._loadInfo();
    if (this._cameraEl) this._cameraEl.hass = this.hass;
    if (this._popup) {
      if (this._popup.isConnected) this._popup.hass = this.hass;
      else this._popup = null;
    }
    if (this._info) {
      this._ensureCamera();
      this._syncRing();
      this._ensureThumbs();
    }
    this._syncFullscreen();
  }

  /* ---------- Entitaeten der Integration ---------- */

  _ent(key) {
    return this._info && this._info.entities ? this._info.entities[key] : undefined;
  }

  _st(key) {
    return stateOf(this.hass, this._ent(key));
  }

  _fmtState(st, value) {
    if (!st) return "";
    const v = value === undefined ? st.state : value;
    try {
      if (this.hass && typeof this.hass.formatEntityState === "function") return this.hass.formatEntityState(st, v);
    } catch (e) {
      /* Rueckfall auf den Rohwert */
    }
    return v;
  }

  _svc(service, data) {
    const entry = this._info && this._info.entry_id ? { entry_id: this._info.entry_id } : {};
    return this.hass.callService("ha_intercom", service, { ...entry, ...(data || {}) });
  }

  _title(t) {
    const c = this._config || {};
    if (c.name) return c.name;
    return (t || this.t)("title");
  }

  /* ---------- Klingeln, SIP, Vollbild ---------- */

  _isDoor(ext) {
    return !!ext && !!this._info && String(ext) === String(this._info.ext_door);
  }

  _doorState() {
    if (!this._info) return null;
    const st = stateOf(this.hass, this._info.door_state_entity);
    return st ? st.state : null;
  }

  _ringing() {
    if (this._doorState() === RING_STATE) return true;
    return this._sip.state === SIP.INCOMING && this._isDoor(this._sip.remoteExtension);
  }

  _ringStart() {
    const st = this._st("doorbell");
    if (st && st.attributes && st.attributes.event_type === "ring") {
      const ts = Date.parse(st.state);
      if (Number.isFinite(ts) && Date.now() - ts < 10 * 60 * 1000) return ts;
    }
    return this._ringSeen || Date.now();
  }

  _syncRing() {
    const ringing = this._ringing();
    if (ringing && !this._wasRinging) {
      this._ringSeen = Date.now();
      if (this._config && this._config.fullscreen_on_ring && !this._fs) this._openFullscreen(true);
    }
    if (!ringing && this._wasRinging) this._scheduleAutoClose();
    this._wasRinging = ringing;
    this._needTick = ringing || this._sip.state !== SIP.IDLE || this._rec.phase === "recording";
  }

  _onSip() {
    const prev = this._lastSipState;
    this._lastSipState = this._sip.state;
    this._sipTick = Date.now();
    if (this._sip.state === SIP.INCOMING && prev !== SIP.INCOMING) {
      this._tab = "call";
      if (this._isDoor(this._sip.remoteExtension) && this._config && this._config.fullscreen_on_ring && !this._fs) this._openFullscreen(true);
    }
    if (this._sip.state === SIP.IDLE && prev !== SIP.IDLE) this._scheduleAutoClose();
    this._syncRing();
    this._syncFullscreen();
  }

  _scheduleAutoClose() {
    if (!this._fs || !this._fsAuto || !this._config.fullscreen_auto_close) return;
    window.clearTimeout(this._closeTimer);
    this._closeTimer = window.setTimeout(() => {
      if (this._fs && this._fsAuto && !this._ringing() && this._sip.state === SIP.IDLE) this._closeFullscreen();
    }, 1500);
  }

  _liveRatio() {
    const a = this._config && this._config.live_aspect;
    if (!a) return 16 / 9;
    const m = String(a).match(/([\d.]+)\s*[/:]\s*([\d.]+)/);
    if (!m) return 16 / 9;
    const w = Number(m[1]);
    const h = Number(m[2]);
    return w > 0 && h > 0 ? w / h : 16 / 9;
  }

  _cameraConfig() {
    if (this._config && this._config.camera) return this._config.camera;
    const cam = this._info && this._info.camera_entity;
    return cam ? { type: "picture-entity", entity: cam, camera_view: "live", show_name: false, show_state: false, fit_mode: "cover" } : null;
  }

  async _ensureCamera() {
    if (!this._config || !this._config.show.live) return;
    const cfg = this._cameraConfig();
    const key = cfg ? JSON.stringify(cfg) : null;
    if (!cfg || key === this._cameraKey) return;
    this._cameraKey = key;
    try {
      const el = await createCard(cfg);
      el.hass = this.hass;
      this._cameraEl = el;
    } catch (e) {
      this._cameraEl = null;
    }
    this.requestUpdate();
  }

  _openFullscreen(auto = false) {
    if (this._fs) return;
    const el = document.createElement("intercom-fullscreen");
    el.hass = this.hass;
    el.t = this.t;
    el.label = this._title();
    el.cameraConfig = this._config.fullscreen_camera || this._cameraConfig();
    el.ratio = this._liveRatio();
    el.addEventListener("intercom-close", () => this._closeFullscreen());
    el.addEventListener("intercom-answer", () => this._sip.answer());
    el.addEventListener("intercom-hangup", () => this._sip.hangup());
    el.addEventListener("intercom-call", () => this._callDoor());
    el.addEventListener("intercom-door", () => this._doorAction());
    el.addEventListener("intercom-mute", () => this._sip.toggleMute());
    this._fs = el;
    this._fsAuto = auto;
    document.body.appendChild(el);
    this._syncFullscreen();
  }

  _closeFullscreen() {
    if (this._fs) this._fs.remove();
    this._fs = null;
    this._fsAuto = false;
  }

  _syncFullscreen() {
    if (!this._fs) return;
    const t = this.t;
    const ci = this._callInfo(t);
    const door = this._doorInfo(t);
    this._fs.hass = this.hass;
    this._fs.t = t;
    this._fs.view = {
      sip: this._sip.state,
      sipAvailable: this._sip.available,
      title: ci.title,
      meta: ci.meta,
      muted: this._sip.muted,
      doorAvailable: !!door,
      doorConfirm: !!(this._doorCfg() || {}).confirm,
      doorBusy: !!(door && door.busy),
    };
  }

  _startCall(ext) {
    if (!ext) return;
    this._sip.call(ext);
    this._tab = "call";
  }

  _callDoor() {
    if (this._info && this._info.ext_door) this._startCall(this._info.ext_door);
  }

  _contactName(ext, t) {
    const c = this._allContacts(t).find((x) => String(x.extension) === String(ext));
    if (c && c.name) return c.name;
    if (this._isDoor(ext)) return t("door_station");
    return ext ? String(ext) : "?";
  }

  _callInfo(t) {
    const s = this._sip;
    const ringing = this._ringing();
    let badge = { text: t("ready"), cls: "muted" };
    let title = "";
    let meta = "";
    if (s.state === SIP.INCOMING) {
      badge = { text: t("ringing"), cls: "" };
      title = this._isDoor(s.remoteExtension) ? t("visitor") : t("call_from", { name: this._contactName(s.remoteExtension, t) });
      meta = this._isDoor(s.remoteExtension) ? this._ringMeta(t) : "";
    } else if (s.state === SIP.OUTGOING || s.state === SIP.CONNECTING) {
      badge = { text: s.state === SIP.CONNECTING ? t("connecting") : t("calling"), cls: "" };
      title = t("calling_to", { name: this._contactName(s.remoteExtension, t) });
      meta = s.state === SIP.CONNECTING ? t("connecting") : "";
    } else if (s.state === SIP.CONNECTED) {
      badge = { text: t("in_call"), cls: "ok" };
      title = t("talking_with", { name: this._contactName(s.remoteExtension, t) });
      meta = fmtDuration((Date.now() - (s.since || Date.now())) / 1000);
    } else if (ringing) {
      badge = { text: t("ringing"), cls: "" };
      title = t("visitor");
      meta = [this._ringMeta(t), s.available ? "" : t("ringing_elsewhere")].filter(Boolean).join(" · ");
    } else if (!s.available) {
      badge = { text: t("sip_missing"), cls: "muted" };
    }
    if (this._sipError) {
      title = title || t("ready");
      meta = t("call_failed", { e: this._sipError });
    }
    return { badge, title, meta, ringing: ringing || s.state === SIP.INCOMING };
  }

  _ringMeta(t) {
    const since = Math.max(0, Math.round((Date.now() - this._ringStart()) / 1000));
    const dur = numState(this.hass, this._ent("ring_duration"), 0);
    const parts = [t("ringing_since", { s: since })];
    if (dur > 0) {
      const left = Math.max(0, Math.round(dur - since));
      parts.push(isOn(this.hass, this._ent("voice_announcement")) ? t("announcement_in", { s: left }) : t("busy_in", { s: left }));
    }
    return parts.join(" · ");
  }

  /* ---------- Tuer und Lautstaerke ---------- */

  _doorInfo(t) {
    const d = this._doorCfg();
    if (!d || !d.entity) return null;
    const st = stateOf(this.hass, d.entity);
    if (!st) return null;
    const map = {
      locked: t("door_locked"),
      unlocked: t("door_unlocked"),
      open: t("door_open"),
      opening: t("door_busy"),
      unlocking: t("door_busy"),
      locking: t("door_busy"),
      jammed: t("door_unavailable"),
      unavailable: t("door_unavailable"),
      unknown: t("unknown"),
      on: t("door_open"),
      off: t("door_locked"),
    };
    const busy = this._doorBusy || ["opening", "unlocking", "locking"].includes(st.state);
    return { id: d.entity, st, text: map[st.state] || st.state, locked: st.state === "locked", busy, name: d.name || t("door") };
  }

  async _doorAction() {
    const d = this._doorCfg();
    if (!d || !d.entity) return;
    const st = stateOf(this.hass, d.entity);
    const domain = domainOf(d.entity);
    let action = d.action;
    if (!action) {
      if (domain === "lock") {
        const feat = Number((st && st.attributes && st.attributes.supported_features) || 0);
        action = feat & 1 ? "open" : "unlock";
      } else if (domain === "cover") action = "open_cover";
      else if (domain === "button" || domain === "input_button") action = "press";
      else action = "turn_on";
    }
    this._doorBusy = true;
    window.clearTimeout(this._doorTimer);
    this._doorTimer = window.setTimeout(() => {
      this._doorBusy = false;
      this._syncFullscreen();
    }, 4000);
    this._syncFullscreen();
    try {
      await this.hass.callService(domain, action, { entity_id: d.entity });
    } catch (e) {
      this._doorBusy = false;
    }
  }

  _doorClick() {
    if ((this._doorCfg() || {}).confirm && this._confirm !== "door") {
      this._setConfirm("door");
      return;
    }
    this._confirm = null;
    this._doorAction();
  }

  _setConfirm(key) {
    this._confirm = key;
    window.clearTimeout(this._confirmTimer);
    this._confirmTimer = window.setTimeout(() => {
      if (this._confirm === key) this._confirm = null;
    }, 6000);
  }

  _setNumber(entityId, value) {
    const d = domainOf(entityId);
    return this.hass.callService(d === "input_number" ? "input_number" : "number", "set_value", { entity_id: entityId, value });
  }

  /* ---------- Mailbox ---------- */

  _entries() {
    const st = this._st("messages");
    return (st && st.attributes && st.attributes.entries) || [];
  }

  _ensureThumbs() {
    if (!this._config.show.mailbox) return;
    for (const e of this._entries().slice(0, 80)) {
      const p = e.image_url;
      if (!p || signedCached(p) || this._pendingSign.has(p)) continue;
      this._pendingSign.add(p);
      signPath(this.hass, p, 6 * 3600)
        .then(() => {
          this._pendingSign.delete(p);
          this.requestUpdate();
        })
        .catch(() => this._pendingSign.delete(p));
    }
  }

  async _openMessage(e) {
    if (this._open === e.id) {
      this._open = null;
      this._clipUrl = null;
      return;
    }
    this._open = e.id;
    this._clipUrl = null;
    if (!e.seen) this._svc("mark_message_seen", { id: e.id });
    if (e.clip && e.clip_url) {
      try {
        const url = await signPath(this.hass, e.clip_url, 3600);
        if (this._open === e.id) this._clipUrl = url;
      } catch (err) {
        this._clipUrl = null;
      }
    }
  }

  _deleteMessage(e) {
    const key = `msg:${e.id}`;
    if (this._confirm !== key) {
      this._setConfirm(key);
      return;
    }
    this._confirm = null;
    if (this._open === e.id) {
      this._open = null;
      this._clipUrl = null;
    }
    this._svc("delete_message", { id: e.id });
  }

  _kind(e, t) {
    const s = Math.round(Number(e.duration) || 0);
    if (e.answered) return { text: t("msg_answered", { s }), note: false };
    if (e.message) return { text: t("msg_note", { s }), note: true };
    return { text: t("msg_visitor", { s }), note: false };
  }

  /* ---------- Ansagen ---------- */

  _ansagen() {
    const st = this._st("announcements");
    return (st && st.attributes && st.attributes.list) || [];
  }

  _ansageAktiv() {
    const st = this._st("announcements");
    return st && st.attributes ? st.attributes.active : null;
  }

  _activate(name) {
    this._svc("activate_announcement", { name });
  }

  async _playAnsage(a) {
    if (this._playing === a.file) {
      this._stopAudio();
      return;
    }
    this._stopAudio();
    try {
      const url = await signPath(this.hass, a.url, 600);
      const audio = new Audio(url);
      this._audio = audio;
      this._playing = a.file;
      audio.onended = () => {
        if (this._audio === audio) {
          this._audio = null;
          this._playing = null;
        }
      };
      audio.onerror = audio.onended;
      await audio.play();
    } catch (e) {
      this._audio = null;
      this._playing = null;
    }
  }

  _stopAudio() {
    if (this._audio) {
      try {
        this._audio.pause();
      } catch (e) {
        /* egal */
      }
    }
    this._audio = null;
    this._playing = null;
  }

  _deleteAnsage(a) {
    const key = `ann:${a.file}`;
    if (this._confirm !== key) {
      this._setConfirm(key);
      return;
    }
    this._confirm = null;
    if (this._playing === a.file) this._stopAudio();
    this._svc("delete_announcement", { name: a.name });
  }

  _renameSave() {
    const r = this._renaming;
    if (!r) return;
    const neu = (r.value || "").trim();
    this._renaming = null;
    if (neu && neu !== r.name) this._svc("rename_announcement", { name: r.name, new_name: neu });
  }

  async _recStart(t) {
    this._stopAudio();
    if (!recordingSupported()) {
      this._rec = { phase: "idle", error: t("record_unsupported") };
      return;
    }
    const rec = new AudioRecorder({
      onLevel: (levels) => {
        if (this._rec.phase === "recording") this._rec = { ...this._rec, levels };
      },
      onTick: (seconds) => {
        if (this._rec.phase === "recording") this._rec = { ...this._rec, seconds };
      },
      maxSeconds: 120,
    });
    this._recorder = rec;
    this._rec = { phase: "recording", seconds: 0, levels: [], error: null };
    this._needTick = true;
    try {
      await rec.start();
    } catch (e) {
      this._recorder = null;
      this._rec = { phase: "idle", error: t("mic_failed", { e: (e && e.message) || String(e) }) };
    }
  }

  async _recStop(t) {
    const rec = this._recorder;
    if (!rec) return;
    const res = await rec.stop();
    this._recorder = null;
    if (!res.blob || res.blob.size < 500 || res.seconds < 0.5) {
      this._rec = { phase: "idle", error: null };
      return;
    }
    const lang = pickLanguage(this.hass, this._config);
    const nowIso = new Date().toISOString();
    const base = lang === "de" ? "Ansage" : "Announcement";
    const name = `${base} ${fmtDate(nowIso, lang)} ${fmtClock(nowIso, lang)}`;
    this._rec = { phase: "preview", blob: res.blob, ext: res.ext, seconds: res.seconds, url: URL.createObjectURL(res.blob), name, error: null };
  }

  _recDiscard() {
    if (this._recorder) {
      this._recorder.cancel();
      this._recorder = null;
    }
    if (this._rec.url) URL.revokeObjectURL(this._rec.url);
    this._rec = { phase: "idle" };
  }

  async _recSave(t) {
    const r = this._rec;
    if (r.phase !== "preview") return;
    const name = (r.name || "").trim() || `${t("announcements")} ${fmtClock(new Date().toISOString(), pickLanguage(this.hass, this._config))}`;
    this._rec = { ...r, phase: "uploading", error: null };
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("file", r.blob, `ansage.${r.ext}`);
      const url = (this._info && this._info.upload_url) || "/api/ha_intercom/announcement/upload";
      const resp = await this.hass.fetchWithAuth(url, { method: "POST", body: fd });
      if (!resp.ok) {
        let msg = `HTTP ${resp.status}`;
        try {
          const j = await resp.json();
          if (j && j.message) msg = j.message;
        } catch (e) {
          /* keine JSON-Antwort */
        }
        throw new Error(msg);
      }
      if (r.url) URL.revokeObjectURL(r.url);
      this._rec = { phase: "idle" };
      this._mtab = "announcements";
    } catch (e) {
      this._rec = { ...r, phase: "preview", error: t("upload_failed", { e: (e && e.message) || String(e) }) };
    }
  }

  /* ---------- Einstellungen ---------- */

  _openSettings() {
    const s = this._config.settings;
    if (s.mode === "none") return;
    if (s.mode === "navigate" && s.path) {
      window.history.pushState(null, "", s.path);
      window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
      return;
    }
    const cfg = { type: "custom:intercom-settings-card", entry_id: this._config.entry_id, language: this._config.language, ...(s.card || {}) };
    this._popup = openSettingsPopup(this.hass, cfg);
  }

  /* ---------- Darstellung ---------- */

  render() {
    if (!this._config) return nothing;
    const t = this.t;
    const c = this._config;
    if (this._info === null) {
      return html`<div class="card"><div class="empty">${t("not_configured")}<br /><small>${this._infoError || t("not_configured_hint")}</small></div></div>`;
    }
    if (this._info === undefined) {
      return html`<div class="card"><div class="empty">${t("loading")}</div></div>`;
    }
    const show = c.show;
    const styleVars = [`--intercom-live-ratio:${this._liveRatio()}`, `--intercom-side-width:${c.side_width}px`, `--intercom-live-pct:${c.live_height / 100}`];
    if (c.height_offset !== undefined) styleVars.push(`--intercom-offset:${Number(c.height_offset)}px`);
    if (c.padding) styleVars.push(`--intercom-padding:${c.padding}`);
    const mainCls = ["main", show.mailbox ? "" : "nomail"].filter(Boolean).join(" ");
    const withHead = !!show.header;
    styleVars.push(`--head-h:${withHead ? 46 : 0}px`);
    return html`<div class="app ${c.layout} ${withHead ? "" : "nohead"}" style=${styleVars.join(";")}>
      ${withHead ? this._renderHead(t) : nothing}
      <div class=${mainCls}>
        <div class="left ${show.call ? "" : "nocall"}">
          <div class="top">${show.live ? this._renderLive(t) : html`<div></div>`}${this._renderSide(t)}</div>
          ${show.call ? this._renderCall(t) : nothing}
        </div>
        ${show.mailbox ? this._renderMailbox(t) : nothing}
      </div>
    </div>`;
  }

  _statusChips(t) {
    const info = this._info;
    let list = this._config.status;
    if (!list) {
      list = [];
      const reg = (ext, key) => {
        const id = `binary_sensor.${ext}_registered`;
        if (ext && stateOf(this.hass, id)) list.push({ entity: id, name: t(key, { ext }) });
      };
      reg(info.ext_door, "chip_door");
      reg(info.ext_tablet, "chip_tablet");
    }
    return list
      .map((s) => (typeof s === "string" ? { entity: s } : s))
      .map((s) => {
        const st = stateOf(this.hass, s.entity);
        if (!st) return null;
        const onState = s.on_state || "on";
        const on = st.state === onState;
        const bad = st.state === "unavailable" || st.state === "unknown";
        return { name: s.name || (st.attributes && st.attributes.friendly_name) || s.entity, cls: bad ? "bad" : on ? "" : "off" };
      })
      .filter(Boolean);
  }

  _lastRingText(t) {
    const last = this._st("last_ring");
    if (!last) return "";
    const ok = last.state && last.state !== "unknown" && last.state !== "unavailable";
    return `${t("last_ring")} ${ok ? fmtWhen(last.state, pickLanguage(this.hass, this._config), t) : t("never")}`;
  }

  _renderHead(t) {
    const s = this._config.settings;
    const last = this._lastRingText(t);
    return html`<div class="head">
      <h1>${this._title(t)}</h1>
      <div class="chips">
        ${this._statusChips(t).map((ch) => html`<span class="chip"><span class="dot ${ch.cls}"></span>${ch.name}</span>`)}
        ${last ? html`<span class="chip"><span class="dot off"></span>${last}</span>` : nothing}
        ${s.mode !== "none" ? html`<button type="button" class="gear" aria-label=${t("settings")} @click=${this._openSettings}>${icon("cog")}</button>` : nothing}
      </div>
    </div>`;
  }

  _renderLive(t) {
    const recording = isOn(this.hass, this._ent("recording"));
    const ringing = this._callInfo(t).ringing;
    return html`<section class="live ${ringing ? "ringing" : ""}" aria-label=${t("live")}>
      <div class="cam">${this._cameraEl || html`<div class="ph">${icon("image")}</div>`}</div>
      <div class="ov"><span class="dot"></span>${t("live")}</div>
      ${recording ? html`<div class="ov rec"><span class="dot"></span>${t("recording_now")}</div>` : nothing}
      <button type="button" class="zoombtn" @click=${() => this._openFullscreen(false)}>${icon("expand")}${t("enlarge")}</button>
    </section>`;
  }

  /* Karte neben dem Livebild: Alarmanlage, sonst Status */
  _renderSide(t) {
    if (this._alarmCfg()) return this._renderAlarm(t);
    const info = this._info || {};
    const rows = [];
    const reg = (ext, key) => {
      const st = stateOf(this.hass, `binary_sensor.${ext}_registered`);
      if (ext && st) rows.push({ name: t(key, { ext }), value: st.state === "on" ? t("st_registered") : t("st_not_registered"), cls: st.state === "on" ? "ok" : "danger" });
    };
    reg(info.ext_door, "st_door");
    reg(info.ext_tablet, "st_tablet");
    const ami = stateOf(this.hass, info.ami_connected_entity);
    if (ami) rows.push({ name: t("st_asterisk"), value: ami.state === "on" ? t("st_connected") : t("st_disconnected"), cls: ami.state === "on" ? "ok" : "danger" });
    const last = this._lastRingText(t);
    return html`<section class="card side status" aria-label=${t("g_status")}>
      <div class="sh">${t("g_status")}</div>
      <div class="srows">
        ${rows.map((r) => html`<div class="srow"><span class="dot ${r.cls === "ok" ? "" : "bad"}"></span><div><div class="t">${r.name}</div><div class="s">${r.value}</div></div></div>`)}
        ${last ? html`<div class="srow"><span class="dot off"></span><div><div class="t">${last}</div></div></div>` : nothing}
      </div>
    </section>`;
  }

  _alarmModes() {
    const a = this._alarmCfg() || {};
    return Array.isArray(a.modes) && a.modes.length ? a.modes : ["armed_away", "armed_home", "disarmed"];
  }

  _renderAlarm(t) {
    const a = this._alarmCfg();
    const st = stateOf(this.hass, a.entity);
    const state = st ? st.state : "unavailable";
    const lang = pickLanguage(this.hass, this._config);
    const label = (m) => t(`al_${m}`) !== `al_${m}` ? t(`al_${m}`) : m;
    let text = label(state);
    let cls = "";
    if (state === "disarmed") cls = "ok";
    else if (state.startsWith("armed")) cls = "armed";
    else if (state === "arming" || state === "pending") cls = "busy";
    else if (state === "triggered") cls = "trig";
    const since = st && st.last_changed ? t("al_since", { t: fmtClock(st.last_changed, lang) }) : "";
    const pad = this._pad;
    const modes = this._alarmModes();
    const iconFor = (m) =>
      m === "disarmed" ? "shieldOff" : m === "armed_home" ? "shieldHome" : m === "armed_night" ? "shieldMoon" : m === "armed_vacation" ? "shieldAirplane" : m === "armed_custom_bypass" ? "shieldStar" : "shieldLock";
    const headIcon = state === "triggered" ? "shieldAlert" : state === "arming" || state === "pending" ? "shieldSync" : state.startsWith("armed") ? iconFor(state) : "shieldOff";
    const subFor = (m) => (t(`al_sub_${m}`) !== `al_sub_${m}` ? t(`al_sub_${m}`) : "");
    let body;
    if (pad) {
      const dots = "•".repeat(pad.code.length);
      body = html`<div class="pad">
        <div class="ptitle">${t("al_code_for", { m: label(pad.mode) })}</div>
        <div class="code">${dots || html`<span class="ph">····</span>`}</div>
        ${pad.error ? html`<div class="err">${pad.error}</div>` : nothing}
        <div class="keys2">
          ${["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => html`<button type="button" ?disabled=${pad.busy} @click=${() => this._padKey(k)}>${k}</button>`)}
          <button type="button" ?disabled=${pad.busy} @click=${() => this._padKey("back")}>${icon("backspace")}</button>
          <button type="button" ?disabled=${pad.busy} @click=${() => this._padKey("0")}>0</button>
          <button type="button" class="ok" ?disabled=${pad.busy || !pad.code} @click=${() => this._padSubmit()}>${icon("check")}</button>
        </div>
        <button type="button" class="cancel" @click=${() => (this._pad = null)}>${t("al_cancel")}</button>
      </div>`;
    } else {
      body = html`<div class="modes">
        ${modes.map((m) => {
          const on = state === m || (state === "arming" && this._pendingMode === m);
          return html`<button type="button" class="mode ${on ? "on" : ""} ${m === "disarmed" ? "" : "armed"}" ?disabled=${!st || state === "unavailable"} @click=${() => this._alarmMode(m)}>
            <span class="mi">${icon(iconFor(m))}</span><span>${label(m)}${subFor(m) ? html`<small>${subFor(m)}</small>` : nothing}</span>
          </button>`;
        })}
      </div>`;
    }
    return html`<section class="card side alarm ${cls}" aria-label=${a.name || t("alarm")}>
      <div class="h"><span class="ic">${icon(headIcon)}</span><span>${a.name || t("alarm")}<span class="s">${this._alarmError || `${text}${since ? ` · ${since}` : ""}`}</span></span></div>
      ${body}
    </section>`;
  }

  _alarmMode(mode) {
    const a = this._alarmCfg();
    if (a.code) {
      this._alarmCall(mode, String(a.code));
      return;
    }
    this._pad = { mode, code: "", error: null, busy: false };
  }

  _padKey(k) {
    if (!this._pad) return;
    const code = k === "back" ? this._pad.code.slice(0, -1) : (this._pad.code + k).slice(0, 12);
    this._pad = { ...this._pad, code, error: null };
  }

  async _padSubmit() {
    if (!this._pad || !this._pad.code) return;
    const { mode, code } = this._pad;
    this._pad = { ...this._pad, busy: true, error: null };
    this._alarmFailReason = null;
    const ok = await this._alarmCall(mode, code);
    if (ok) {
      this._pad = null;
      return;
    }
    if (this._pad) this._pad = { ...this._pad, busy: false, code: "", error: this._alarmFailReason || this.t("al_code_wrong") };
  }

  /* Dienst aufrufen und pruefen, ob die Anlage wirklich in den Zielzustand geht; Alarmo lehnt falsche Codes ohne Fehler ab */
  async _alarmCall(mode, code) {
    const a = this._alarmCfg();
    const services = {
      disarmed: "alarm_disarm",
      armed_away: "alarm_arm_away",
      armed_home: "alarm_arm_home",
      armed_night: "alarm_arm_night",
      armed_vacation: "alarm_arm_vacation",
      armed_custom_bypass: "alarm_arm_custom_bypass",
    };
    const service = services[mode];
    if (!service) return false;
    this._pendingMode = mode;
    this._alarmError = null;
    try {
      await this.hass.callService("alarm_control_panel", service, { entity_id: a.entity, ...(code ? { code } : {}) });
    } catch (e) {
      const msg = (e && e.message) || "";
      this._alarmFailReason = /code/i.test(msg) ? this.t("al_code_wrong") : msg || null;
      return false;
    }
    const okStates = mode === "disarmed" ? ["disarmed"] : [mode, "arming", "pending"];
    const started = Date.now();
    while (Date.now() - started < 3000) {
      await new Promise((r) => window.setTimeout(r, 200));
      if (this._alarmFailReason) return false;
      const st = stateOf(this.hass, a.entity);
      if (st && okStates.includes(st.state)) return true;
    }
    return false;
  }

  _onAlarmEvent(ev) {
    const d = (ev && ev.data) || {};
    const a = this._alarmCfg();
    if (!a || (d.entity_id && d.entity_id !== a.entity)) return;
    const t = this.t;
    const reason = d.reason || "";
    let msg;
    if (reason === "invalid_code") msg = t("al_code_wrong");
    else if (reason === "open_sensors") msg = t("al_open_sensors", { s: (d.sensors || []).map((x) => (x && x.name) || x).join(", ") });
    else if (reason === "not_allowed") msg = t("al_not_allowed");
    else msg = t("al_failed", { r: reason || ev.event_type });
    this._alarmFailReason = msg;
    if (this._pad) this._pad = { ...this._pad, busy: false, code: "", error: msg };
    else {
      this._alarmError = msg;
      window.clearTimeout(this._alarmErrorTimer);
      this._alarmErrorTimer = window.setTimeout(() => {
        this._alarmError = null;
      }, 8000);
    }
  }

  _ensureAlarmEvents() {
    if (this._alarmSub || !this.hass || !this.hass.connection || !this._alarmCfg()) return;
    const conn = this.hass.connection;
    this._alarmSub = Promise.all(
      ["alarmo_failed_to_arm", "alarmo_failed_to_disarm"].map((type) => conn.subscribeEvents((ev) => this._onAlarmEvent(ev), type).catch(() => null))
    );
  }

  _renderCall(t) {
    const ci = this._callInfo(t);
    const contacts = this._allContacts(t);
    const showContacts = contacts.length > 0;
    const ctrl = this._config.show.info === false ? nothing : this._renderInfos(t);
    const tab = this._tab === "contacts" && showContacts ? "contacts" : this._tab === "dial" && this._sip.available ? "dial" : "call";
    const pane = tab === "contacts" ? this._renderContacts(t) : tab === "dial" ? this._renderDial(t) : this._renderCallPane(t, ci);
    const busy = ci.ringing || (this._sip.state !== SIP.IDLE && this._sip.available);
    const s = this._config.settings;
    const showHeadChips = !this._config.show.header && this._config.show.status;
    return html`<section class="card call" aria-label=${t("intercom")}>
      <div class="card-head">
        <div class="hl">
          <h2>${t("intercom")}</h2>
          ${showHeadChips ? this._statusChips(t).map((ch) => html`<span class="chip mini"><span class="dot ${ch.cls}"></span>${ch.name}</span>`) : nothing}
        </div>
        <div class="r">
          ${busy ? html`<span class="badge ${ci.badge.cls}">${ci.ringing ? html`<span class="dot"></span>` : nothing}${ci.badge.text}</span>` : nothing}
          ${!this._config.show.header && s.mode !== "none"
            ? html`<button type="button" class="gear wide" @click=${this._openSettings}>${icon("cog")}<span>${t("settings")}</span></button>`
            : nothing}
        </div>
      </div>
      <div class="split ${ctrl === nothing ? "nosplit" : ""}">
        <div class="cpane">
          <div class="tabs" role="tablist">
            <button type="button" role="tab" aria-selected=${tab === "call" ? "true" : "false"} @click=${() => (this._tab = "call")}>${t("tab_call")}</button>
            ${showContacts
              ? html`<button type="button" role="tab" aria-selected=${tab === "contacts" ? "true" : "false"} @click=${() => (this._tab = "contacts")}>
                  ${t("tab_contacts")}${contacts.length ? html`<span class="cnt">${contacts.length}</span>` : nothing}
                </button>`
              : nothing}
            ${this._sip.available
              ? html`<button type="button" role="tab" aria-selected=${tab === "dial" ? "true" : "false"} @click=${() => (this._tab = "dial")}>${t("tab_dial")}</button>`
              : nothing}
          </div>
          ${pane}
        </div>
        ${ctrl === nothing ? nothing : html`<div class="vsep"></div>${ctrl}`}
      </div>
    </section>`;
  }

  _renderCallPane(t, ci) {
    const s = this._sip;
    const state = s.state;
    const info = this._info || {};
    let actions = nothing;
    if (state === SIP.INCOMING) {
      actions = html`<div class="actions">
        <button type="button" class="btn ok" @click=${() => s.answer()}>${icon("phone")}${t("answer")}</button>
        <button type="button" class="btn danger" @click=${() => s.hangup()}>${icon("hangup")}${t("reject")}</button>
      </div>`;
    } else if (state === SIP.OUTGOING || state === SIP.CONNECTING) {
      actions = html`<div class="actions one"><button type="button" class="btn danger" @click=${() => s.hangup()}>${icon("hangup")}${t("hangup")}</button></div>`;
    } else if (state === SIP.CONNECTED) {
      actions = html`<div class="actions">
        <button type="button" class="btn danger" @click=${() => s.hangup()}>${icon("hangup")}${t("hangup")}</button>
        <button type="button" class="btn ${s.muted ? "accent" : ""}" @click=${() => s.toggleMute()}>${icon(s.muted ? "micOff" : "mic")}${s.muted ? t("unmute") : t("mute")}</button>
      </div>`;
    } else if (s.available && info.ext_door && !ci.ringing) {
      actions = html`<div class="actions one"><button type="button" class="btn ok" @click=${this._callDoor}>${icon("phone")}${t("call_door")}</button></div>`;
    }
    let top = nothing;
    if (ci.title) {
      const ringCls = ci.ringing ? "ring live" : state === SIP.CONNECTED ? "ring ok" : "ring";
      top = html`<div class="callstate">
        <div class=${ringCls}>${icon("phone")}</div>
        <div><div class="big">${ci.title}</div><div class="meta">${ci.meta || ""}</div></div>
      </div>`;
    } else if (!s.available) {
      top = html`<div class="statusline"><span class="dot off"></span>${t("sip_missing")} · ${t("sip_hint")}</div>`;
    }
    return html`<div class="pane single">
      <div class="call">
        <div class="callzone">${top}${actions}</div>
        ${this._renderActs(t)}
      </div>
    </div>`;
  }

  /* Aktionen unter dem Anrufbereich: Haustuer, Mailbox, Sprachansage, weitere Entitaeten */
  _actionList() {
    const c = this._config;
    if (Array.isArray(c.actions)) return c.actions.map((x) => (typeof x === "string" ? { type: x } : x));
    const list = [];
    if (this._doorCfg()) list.push({ type: "door" });
    list.push({ type: "mailbox" }, { type: "announcement" });
    return list;
  }

  _renderActs(t) {
    const list = this._actionList();
    const door = list.some((x) => x.type === "door") ? this._renderDoorTile(t) : nothing;
    const toggles = list
      .filter((x) => x.type !== "door")
      .map((x) => this._renderAct(x, t))
      .filter((x) => x !== nothing);
    if (door === nothing && !toggles.length) return nothing;
    return html`<div class="acts ${door === nothing ? "nodoor" : ""} ${toggles.length ? "" : "notoggles"}">
      ${door}
      ${toggles.length ? html`<div class="stack">${toggles}</div>` : nothing}
    </div>`;
  }

  _renderDoorTile(t) {
    const d = this._doorInfo(t);
    if (!d) return nothing;
    const confirm = this._confirm === "door";
    const isLock = domainOf(d.id) === "lock";
    const lockBtn = isLock
      ? html`<button type="button" class="lk" ?disabled=${d.busy} @click=${this._doorLockToggle}>${icon(d.locked ? "lockOpen" : "lock")}${d.locked ? t("unlock") : t("lock")}</button>`
      : nothing;
    return html`<div class="door">
      <div class="dh"><span class="ic ${d.locked ? "" : "ok"}">${icon(d.locked ? "lock" : "lockOpen")}</span><div><div class="t">${d.name}</div><div class="s">${d.text}</div></div></div>
      <div class="btns ${isLock ? "" : "one"}">
        ${confirm
          ? html`<button type="button" class="open danger" @click=${this._doorClick}>${icon("check")}${t("yes")}</button><button type="button" class="lk" @click=${() => (this._confirm = null)}>${icon("close")}${t("no")}</button>`
          : html`<button type="button" class="open" ?disabled=${d.busy} @click=${this._doorClick}>${icon("doorOpen")}${d.busy ? t("door_busy") : t("open")}</button>${lockBtn}`}
      </div>
    </div>`;
  }

  async _doorLockToggle() {
    const d = this._doorCfg();
    if (!d || !d.entity || domainOf(d.entity) !== "lock") return;
    const st = stateOf(this.hass, d.entity);
    const locked = st && st.state === "locked";
    this._doorBusy = true;
    window.clearTimeout(this._doorTimer);
    this._doorTimer = window.setTimeout(() => {
      this._doorBusy = false;
    }, 4000);
    try {
      await this.hass.callService("lock", locked ? "unlock" : "lock", { entity_id: d.entity });
    } catch (e) {
      this._doorBusy = false;
    }
  }

  _renderAct(a, t) {
    const type = a.type || (a.entity ? "entity" : "");
    if (type === "volume") {
      const v = this._config.volume;
      const vst = v && v.entity ? stateOf(this.hass, v.entity) : null;
      if (!vst) return nothing;
      const at = vst.attributes || {};
      const min = Number(at.min ?? 0);
      const max = Number(at.max ?? 100);
      const step = Number(at.step ?? 1);
      const cur = this._volDrag !== null ? this._volDrag : Number(vst.state);
      const val = Number.isFinite(cur) ? cur : min;
      const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
      const muteSt = v.mute_entity ? stateOf(this.hass, v.mute_entity) : null;
      const muted = muteSt ? muteSt.state === "on" : false;
      return html`<div class="act">
        <div class="slider" style="--pct:${pct}%">
          <div class="fill"></div>
          <div class="val">${Math.round(val)}<small>${v.unit || at.unit_of_measurement || "%"}</small></div>
          <input type="range" aria-label=${t("volume")} min=${min} max=${max} step=${step} .value=${String(val)}
            @input=${(e) => (this._volDrag = Number(e.target.value))}
            @change=${(e) => {
              this._volDrag = null;
              this._setNumber(v.entity, Number(e.target.value));
            }} />
        </div>
        ${muteSt
          ? html`<button type="button" class="icb ${muted ? "on" : ""}" aria-label=${t("muted")} @click=${() => this.hass.callService("homeassistant", "toggle", { entity_id: v.mute_entity })}>${icon(muted ? "volumeOff" : "volume")}</button>`
          : nothing}
      </div>`;
    }
    let entity = a.entity;
    let name = a.name;
    let sub = null;
    if (type === "mailbox") {
      entity = this._ent("mailbox");
      name = name || t("mailbox");
    } else if (type === "announcement") {
      entity = this._ent("voice_announcement");
      name = name || t("s_sprachansage");
      const aktiv = this._ansageAktiv();
      if (aktiv && aktiv !== "none") sub = aktiv;
    }
    const st = stateOf(this.hass, entity);
    if (!st) return nothing;
    const on = st.state === "on";
    const label = name || (st.attributes && st.attributes.friendly_name) || entity;
    const stateText = on ? t("on") : t("off");
    return html`<button type="button" class="act toggle ${on ? "on" : ""}" @click=${() => this.hass.callService("homeassistant", "toggle", { entity_id: entity })}>
      <div><div class="t">${label}</div><div class="s">${stateText}${sub ? ` · ${sub}` : ""}</div></div>
      <span class="sw" role="switch" aria-checked=${on ? "true" : "false"}></span>
    </button>`;
  }

  /* Infospalte rechts vom Anrufbereich */
  _renderInfos(t) {
    const st = this._st("messages");
    const neue = Number((st && st.attributes && st.attributes.new) || 0);
    const lang = pickLanguage(this.hass, this._config);
    const last = this._st("last_ring");
    const lastOk = last && last.state && last.state !== "unknown" && last.state !== "unavailable";
    const aktiv = this._ansageAktiv();
    const ansageOn = isOn(this.hass, this._ent("voice_announcement"));
    const frz = this._st("ringback");
    const dauer = this._st("ring_duration");
    const rows = [];
    if (st) rows.push({ k: t("info_new"), v: String(neue), cls: neue > 0 ? "new" : "", click: () => (this._mtab = "messages") });
    if (last) rows.push({ k: t("last_ring"), v: lastOk ? fmtWhen(last.state, lang, t) : t("never") });
    if (this._ent("voice_announcement")) rows.push({ k: t("s_sprachansage"), v: ansageOn ? (aktiv && aktiv !== "none" ? aktiv : t("on")) : t("off"), cls: ansageOn ? "on" : "" });
    if (frz) rows.push({ k: t("info_ringback"), v: this._fmtState(frz) });
    if (dauer && Number.isFinite(Number(dauer.state))) rows.push({ k: t("s_klingeldauer"), v: `${Math.round(Number(dauer.state))} s` });
    for (const extra of this._config.info || []) {
      const e = typeof extra === "string" ? { entity: extra } : extra;
      const es = stateOf(this.hass, e.entity);
      if (!es) continue;
      const unit = (es.attributes && es.attributes.unit_of_measurement) || "";
      rows.push({ k: e.name || (es.attributes && es.attributes.friendly_name) || e.entity, v: `${es.state}${unit ? ` ${unit}` : ""}` });
    }
    if (!rows.length) return nothing;
    return html`<div class="infos">
      <div class="lbl">${t("info_title")}</div>
      <div class="kvs">
        ${rows.map((r) => html`<div class="kv ${r.click ? "clickable" : ""}" @click=${r.click || null}><span class="k">${r.k}</span><span class="v ${r.cls || ""}">${r.v}</span></div>`)}
      </div>
    </div>`;
  }

  _doorCfg() {
    const c = this._config || {};
    if (c.door && c.door.entity) return c.door;
    const lock = this._info && this._info.lock_entity;
    return lock ? { entity: lock, confirm: true } : null;
  }

  _alarmCfg() {
    const c = this._config || {};
    if (c.alarm && c.alarm.entity) return c.alarm;
    const ent = this._info && this._info.alarm_entity;
    return ent ? { entity: ent } : null;
  }

  /* Nebenstellen der Asterisk-Integration ohne die eigene; Name aus dem Geraeteregister oder aus contacts: */
  _allContacts(t) {
    const info = this._info || {};
    const overrides = new Map(((this._config && this._config.contacts) || []).map((x) => [String(x.extension || ""), x]));
    const seen = new Set();
    const list = [];
    const add = (ext, base) => {
      if (!ext || seen.has(ext)) return;
      seen.add(ext);
      const o = overrides.get(ext) || {};
      if (o.hide) return;
      const isDoor = this._isDoor(ext);
      const isTablet = !!info.ext_tablet && String(info.ext_tablet) === ext;
      list.push({
        extension: ext,
        name: o.name || base.name || (isDoor ? t("door_station") : isTablet ? t("tablet") : ext),
        icon: o.icon || (isDoor ? "doorbell" : isTablet ? "tablet" : null),
        state_entity: o.state_entity || base.state_entity || `sensor.${ext}_state`,
        registered_entity: o.registered_entity || base.registered_entity || `binary_sensor.${ext}_registered`,
      });
    };
    for (const e of Array.isArray(info.extensions) ? info.extensions : []) add(String((e && e.extension) || ""), e || {});
    if (this.hass && this.hass.states) {
      if (this._extScanFor !== this.hass.states) {
        this._extScanFor = this.hass.states;
        this._extScan = Object.keys(this.hass.states)
          .filter((id) => /^sensor\.\d+_state$/.test(id))
          .map((id) => id.slice(7, -6));
      }
      for (const ext of this._extScan) add(ext, {});
    }
    for (const [ext, o] of overrides) add(ext, o);
    const own = this._sip.ownExtension ? String(this._sip.ownExtension) : null;
    return list.filter((x) => x.extension !== own);
  }

  _renderContacts(t) {
    const contacts = this._allContacts(t);
    const info = this._info || {};
    if (!contacts.length) return html`<div class="pane single"><div class="empty">${t("contacts_none")}</div></div>`;
    return html`<div class="pane single">
      <div class="rows">
        ${contacts.map((ct) => {
          const ext = ct.extension;
          const reg = stateOf(this.hass, ct.registered_entity);
          const sst = stateOf(this.hass, ct.state_entity);
          let status = t("unknown");
          let dot = "off";
          if (reg) {
            status = reg.state === "on" ? t("reachable") : t("unreachable");
            dot = reg.state === "on" ? "" : "off";
          }
          if (sst && sst.state === (info.in_use_state || "In use")) status = t("in_call");
          const initial = String(ct.name || ext).trim().charAt(0).toUpperCase();
          const av = ct.icon && ICONS[ct.icon] ? icon(ct.icon) : initial;
          const disabled = !this._sip.available || this._sip.state !== SIP.IDLE;
          return html`<div class="contact">
            <div class="avatar">${av}</div>
            <div><div class="t">${ct.name}</div><div class="s"><span class="dot ${dot}"></span>${ext} · ${status}</div></div>
            <button type="button" class="callbtn" aria-label=${ct.name} ?disabled=${disabled} @click=${() => this._startCall(ext)}>${icon("phone")}</button>
          </div>`;
        })}
      </div>
    </div>`;
  }

  _renderDial(t) {
    const s = this._sip;
    const inCall = s.state === SIP.CONNECTED;
    const name = this._dial ? (this._allContacts(t).find((x) => String(x.extension) === this._dial) || {}).name || (this._isDoor(this._dial) ? t("door_station") : "") : "";
    const press = (k) => {
      if (inCall) s.sendDtmf(k);
      this._dial = (this._dial + k).slice(0, 24);
    };
    return html`<div class="pane single">
      <div class="dial"><div class="dialin">
        <div class="go">
          <div class="num"><span>${this._dial.split("").join(" ") || " "}</span><small>${name}</small></div>
          <button type="button" class="back" aria-label=${t("delete")} @click=${() => (this._dial = this._dial.slice(0, -1))} @dblclick=${() => (this._dial = "")}>${icon("backspace")}</button>
          ${s.state === SIP.IDLE
            ? html`<button type="button" class="callgo ok" aria-label=${t("call")} ?disabled=${!this._dial} @click=${() => this._startCall(this._dial)}>${icon("phone")}</button>`
            : html`<button type="button" class="callgo danger" aria-label=${t("hangup")} @click=${() => s.hangup()}>${icon("hangup")}</button>`}
        </div>
        <div class="keys">${KEYS.map(([k, l]) => html`<button type="button" @click=${() => press(k)}>${k}${l ? html`<small>${l}</small>` : nothing}</button>`)}</div>
      </div></div>
    </div>`;
  }

  _renderMailbox(t) {
    const st = this._st("messages");
    const entries = this._entries();
    const neue = Number((st && st.attributes && st.attributes.new) || 0);
    const recording = !!(st && st.attributes && st.attributes.recording);
    const lang = pickLanguage(this.hass, this._config);
    const showAnn = this._config.show.announcements;
    const tab = showAnn && this._mtab === "announcements" ? "announcements" : "messages";
    const list = this._ansagen();
    const aktiv = this._ansageAktiv();
    const none = !aktiv || aktiv === "none";
    return html`<section class="card mailbox" aria-label=${t("mailbox")}>
      <div class="card-head">
        <h2>${t("mailbox")}</h2>
        <div class="r">
          ${tab === "messages" && neue > 0 ? html`<span class="badge">${t("new_n", { n: neue })}</span>` : nothing}
          ${tab === "messages" && neue > 0 ? html`<button type="button" class="pill small" @click=${() => this._svc("alle_gesehen")}>${t("all_seen")}</button>` : nothing}
          ${tab === "announcements" ? html`<span class="badge ${none ? "muted" : "ok"}">${t("active")}: ${none ? t("none") : aktiv}</span>` : nothing}
        </div>
      </div>
      ${showAnn
        ? html`<div class="tabs" role="tablist">
            <button type="button" role="tab" aria-selected=${tab === "messages" ? "true" : "false"} @click=${() => (this._mtab = "messages")}>
              ${t("messages")}${neue > 0 ? html`<span class="cnt">${neue}</span>` : nothing}
            </button>
            <button type="button" role="tab" aria-selected=${tab === "announcements" ? "true" : "false"} @click=${() => (this._mtab = "announcements")}>
              ${t("announcements")}${list.length ? html`<span class="cnt">${list.length}</span>` : nothing}
            </button>
          </div>`
        : nothing}
      ${tab === "announcements"
        ? this._renderAnsagenPane(t, lang, list, none)
        : html`<div class="list">
            ${recording
              ? html`<div class="recbanner"><span class="recdot"></span><div><div class="t">${t("recording_now")}</div><div class="s">${t("recording_hint")}</div></div></div>`
              : nothing}
            ${entries.length
              ? repeat(
                  entries,
                  (e) => e.id,
                  (e) => this._renderEntry(e, t, lang)
                )
              : html`<div class="empty">${t("no_messages")}</div>`}
          </div>`}
    </section>`;
  }

  _renderAnsagenPane(t, lang, list, none) {
    const r = this._rec;
    let foot;
    if (r.phase === "recording") {
      foot = html`<div class="recording">
        <div class="recdot"></div>
        <div class="recmeta"><div class="t">${t("recording")}</div><div class="s">${fmtDuration(r.seconds || 0)} · ${t("speak_now")}</div></div>
        <div class="bars" aria-hidden="true">${(r.levels && r.levels.length ? r.levels : new Array(12).fill(0.1)).map((l) => html`<i style="height:${Math.max(10, Math.round(l * 100))}%"></i>`)}</div>
        <button type="button" class="btn danger" @click=${() => this._recStop(t)}>${icon("stop")}${t("stop")}</button>
      </div>`;
    } else if (r.phase === "preview" || r.phase === "uploading") {
      foot = html`<div class="preview">
        <div class="hint">${t("new_recording", { s: Math.round(r.seconds || 0) })}</div>
        <audio controls preload="metadata" .src=${r.url}></audio>
        <div class="go">
          <input class="txt" type="text" aria-label=${t("name")} .value=${r.name || ""} ?disabled=${r.phase === "uploading"} @input=${(e) => (this._rec = { ...this._rec, name: e.target.value })} />
          <button type="button" class="btn accent" ?disabled=${r.phase === "uploading"} @click=${() => this._recSave(t)}>${icon("check")}${r.phase === "uploading" ? t("uploading") : t("save")}</button>
          <button type="button" class="btn" ?disabled=${r.phase === "uploading"} @click=${this._recDiscard}>${t("discard")}</button>
        </div>
        ${r.error ? html`<div class="note" style="padding:0">${r.error}</div>` : nothing}
      </div>`;
    } else {
      foot = html`<div class="rec">
        <button type="button" class="btn" @click=${() => this._recStart(t)}>${icon("mic")}${t("record_new")}</button>
        <span class="hint">${t("device_mic")}</span>
        ${r.error ? html`<div class="note" style="padding:0;grid-column:1/-1">${r.error}</div>` : nothing}
      </div>`;
    }
    return html`<div class="mpane">
      <div class="rows">
        ${repeat(
          list,
          (a) => a.file,
          (a) => this._renderAnsage(a, t, lang)
        )}
        <div class="ann">
          <button type="button" class="radio ${none ? "on" : ""}" role="radio" aria-checked=${none ? "true" : "false"} aria-label=${t("no_announcement")} @click=${() => this._activate("none")}></button>
          <div><div class="t"><span>${t("no_announcement")}</span></div><div class="s">${t("no_announcement_hint")}</div></div>
          <div></div>
        </div>
        ${list.length ? nothing : html`<div class="empty">${t("no_announcements")}</div>`}
      </div>
      <div class="recfoot">${foot}</div>
    </div>`;
  }

  _renderEntry(e, t, lang) {
    const open = this._open === e.id;
    const kind = this._kind(e, t);
    const thumb = e.image_url ? signedCached(e.image_url) : null;
    const confirm = this._confirm === `msg:${e.id}`;
    return html`<div class="msg ${open ? "open" : ""}" tabindex="0" @click=${() => this._openMessage(e)} @keydown=${(ev) => ev.key === "Enter" && this._openMessage(e)}>
        <div class="thumb">${thumb ? html`<img src=${thumb} alt="" loading="lazy" />` : icon("image")}<span class="len">${fmtDuration(e.duration)}</span></div>
        <div>
          <div class="when">${e.seen ? nothing : html`<span class="new"></span>`}${fmtWhen(e.time, lang, t)}</div>
          <div class="kind ${kind.note ? "note" : ""}">${kind.text}</div>
        </div>
        <div class="ctl" @click=${(ev) => ev.stopPropagation()}>
          ${confirm
            ? html`<span class="confirm">${t("really_delete")}
                <button type="button" class="pill small danger" @click=${() => this._deleteMessage(e)}>${t("yes")}</button>
                <button type="button" class="pill small" @click=${() => (this._confirm = null)}>${t("no")}</button></span>`
            : html`<button type="button" class="icb ${open ? "on" : ""}" aria-label=${t("play")} @click=${() => this._openMessage(e)}>${icon("play")}</button>
                <button type="button" class="icb" aria-label=${t("delete")} @click=${() => this._deleteMessage(e)}>${icon("trash")}</button>`}
        </div>
      </div>
      ${open
        ? html`<div class="player">
            <div class="video">
              ${e.clip
                ? this._clipUrl
                  ? html`<video controls playsinline preload="metadata" autoplay .src=${this._clipUrl} poster=${thumb || ""}></video>`
                  : html`<span>${t("loading")}</span>`
                : html`<span>${t("no_clip")}</span>`}
            </div>
            <div class="foot">
              <span>${t("clip_info", { d: fmtDuration(e.duration) })}</span>
              <button type="button" class="del" @click=${() => this._deleteMessage(e)}>${icon("trash")}${confirm ? t("really_delete") : t("delete")}</button>
            </div>
          </div>`
        : nothing}`;
  }

  _renderAnsage(a, t, lang) {
    const renaming = this._renaming && this._renaming.file === a.file;
    const confirm = this._confirm === `ann:${a.file}`;
    const playing = this._playing === a.file;
    return html`<div class="ann">
      <button type="button" class="radio ${a.active ? "on" : ""}" role="radio" aria-checked=${a.active ? "true" : "false"} aria-label=${a.name} @click=${() => this._activate(a.name)}></button>
      <div>
        ${renaming
          ? html`<input
              class="txt"
              type="text"
              aria-label=${t("name")}
              .value=${this._renaming.value}
              @input=${(e) => (this._renaming = { ...this._renaming, value: e.target.value })}
              @keydown=${(e) => {
                if (e.key === "Enter") this._renameSave();
                if (e.key === "Escape") this._renaming = null;
              }}
              @blur=${() => this._renameSave()}
            />`
          : html`<div class="t"><span>${a.name}</span>
              <button type="button" class="edit" aria-label=${t("rename")} @click=${() => (this._renaming = { datei: a.file, name: a.name, value: a.name })}>${icon("pencil")}</button></div>`}
        <div class="s">${t("recorded_on", { d: fmtDate(a.created, lang), s: Math.round(a.duration || 0) })}</div>
      </div>
      <div class="ctl">
        ${confirm
          ? html`<span class="confirm">${t("really_delete")}
              <button type="button" class="pill small danger" @click=${() => this._deleteAnsage(a)}>${t("yes")}</button>
              <button type="button" class="pill small" @click=${() => (this._confirm = null)}>${t("no")}</button></span>`
          : html`<button type="button" class="icb ${playing ? "on" : ""}" aria-label=${playing ? t("stop_listen") : t("listen")} @click=${() => this._playAnsage(a)}>${icon(playing ? "stop" : "play")}</button>
              <button type="button" class="icb" aria-label=${t("delete")} @click=${() => this._deleteAnsage(a)}>${icon("trash")}</button>`}
      </div>
    </div>`;
  }
}

customElements.define("intercom-card", IntercomCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "intercom-card",
  name: "Intercom",
  description: "Türsprechanlage: Livebild, Anruf, Tür, Mailbox, Ansagen",
  preview: false,
});
window.customCards.push({
  type: "intercom-settings-card",
  name: "Intercom Einstellungen",
  description: "Einstellungen der Intercom-Integration",
  preview: false,
});

console.info(`%c INTERCOM-CARD %c ${VERSION} `, "color: #fff; background: #0b8bd6; font-weight: 700;", "color: #0b8bd6; background: #e3f3fc;");
