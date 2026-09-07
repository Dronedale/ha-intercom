/* Ansage mit dem Mikrofon des Geraets aufnehmen (MediaRecorder), mit Pegelanzeige. */

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus", "audio/ogg"];

export function recordingSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
}

export function extensionFor(mime) {
  const m = String(mime || "").toLowerCase();
  if (m.includes("webm")) return "webm";
  if (m.includes("mp4") || m.includes("m4a") || m.includes("aac")) return "m4a";
  if (m.includes("ogg")) return "ogg";
  if (m.includes("wav")) return "wav";
  return "webm";
}

export class AudioRecorder {
  constructor({ onLevel, onTick, maxSeconds = 120 } = {}) {
    this.onLevel = onLevel;
    this.onTick = onTick;
    this.maxSeconds = maxSeconds;
    this.stream = null;
    this.recorder = null;
    this.chunks = [];
    this.ctx = null;
    this.analyser = null;
    this.buf = null;
    this.timer = null;
    this.started = 0;
    this._stopPromise = null;
  }

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    const mime = MIME_CANDIDATES.find((m) => window.MediaRecorder.isTypeSupported && window.MediaRecorder.isTypeSupported(m)) || "";
    const opts = mime ? { mimeType: mime, audioBitsPerSecond: 64000 } : undefined;
    this.recorder = new MediaRecorder(this.stream, opts);
    this.chunks = [];
    this.recorder.ondataavailable = (e) => {
      if (e.data && e.data.size) this.chunks.push(e.data);
    };
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
      const src = this.ctx.createMediaStreamSource(this.stream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.6;
      src.connect(this.analyser);
      this.buf = new Uint8Array(this.analyser.frequencyBinCount);
    } catch (e) {
      this.analyser = null;
    }
    this.started = Date.now();
    this.timer = window.setInterval(() => this._tick(), 120);
    this.recorder.start(250);
  }

  _tick() {
    const secs = (Date.now() - this.started) / 1000;
    if (this.analyser && this.onLevel) {
      this.analyser.getByteFrequencyData(this.buf);
      const bars = 12;
      const per = Math.max(1, Math.floor((this.buf.length * 0.6) / bars));
      const levels = [];
      for (let i = 0; i < bars; i++) {
        let sum = 0;
        for (let j = 0; j < per; j++) sum += this.buf[i * per + j] || 0;
        levels.push(Math.min(1, sum / per / 160));
      }
      this.onLevel(levels);
    }
    if (this.onTick) this.onTick(secs);
    if (secs >= this.maxSeconds) this.stop();
  }

  stop() {
    if (this._stopPromise) return this._stopPromise;
    this._stopPromise = new Promise((resolve) => {
      const rec = this.recorder;
      const finish = () => {
        const mime = (rec && rec.mimeType) || "audio/webm";
        const blob = new Blob(this.chunks, { type: mime });
        const seconds = (Date.now() - this.started) / 1000;
        this._cleanup();
        resolve({ blob, ext: extensionFor(mime), seconds, mime });
      };
      if (!rec || rec.state === "inactive") {
        finish();
        return;
      }
      rec.onstop = finish;
      try {
        rec.stop();
      } catch (e) {
        finish();
      }
    });
    return this._stopPromise;
  }

  cancel() {
    try {
      if (this.recorder && this.recorder.state !== "inactive") this.recorder.stop();
    } catch (e) {
      /* bereits beendet */
    }
    this._cleanup();
  }

  _cleanup() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
    this.stream = null;
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch (e) {
        /* egal */
      }
    }
    this.ctx = null;
    this.analyser = null;
  }
}
