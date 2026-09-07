/* Link to sip-core (window.sipCore): observe its state, control calls. */

export const SIP = { IDLE: "idle", INCOMING: "incoming", OUTGOING: "outgoing", CONNECTING: "connecting", CONNECTED: "connected" };

const EVENTS = ["sipcore-update", "sipcore-call-started", "sipcore-call-ended"];

export class SipLink {
  constructor(onChange, onError) {
    this._onChange = onChange;
    this._onError = onError || (() => {});
    this._handler = () => this.refresh();
    this._timer = null;
    this._last = "";
    this.available = false;
    this.registered = false;
    this.state = SIP.IDLE;
    this.remoteExtension = null;
    this.remoteName = null;
    this.ownExtension = null;
    this.muted = false;
    this.since = null;
    this._prevState = SIP.IDLE;
    this._callStarted = 0;
    this._hooked = null;
    this._failCause = null;
  }

  get core() {
    return window.sipCore || window.sipcore || null;
  }

  connect() {
    for (const ev of EVENTS) window.addEventListener(ev, this._handler);
    this._timer = window.setInterval(this._handler, 2000);
    this.refresh();
  }

  disconnect() {
    for (const ev of EVENTS) window.removeEventListener(ev, this._handler);
    if (this._timer) window.clearInterval(this._timer);
    this._timer = null;
  }

  refresh() {
    const c = this.core;
    if (!c) {
      this.available = false;
      this.registered = false;
      this.state = SIP.IDLE;
      this.remoteExtension = null;
      this.remoteName = null;
      this.muted = false;
      this.since = null;
    } else {
      this.available = true;
      this.state = c.callState || SIP.IDLE;
      let reg = false;
      try {
        reg = !!(c.ua && typeof c.ua.isRegistered === "function" && c.ua.isRegistered());
      } catch (e) {
        reg = false;
      }
      this.registered = reg;
      let rext = null;
      let rname = null;
      try {
        rext = c.remoteExtension || null;
        rname = c.remoteName || null;
      } catch (e) {
        /* getter touches a session that is being torn down */
      }
      this.remoteExtension = rext ? String(rext) : null;
      this.remoteName = rname ? String(rname) : null;
      this.ownExtension = c.user && c.user.extension ? String(c.user.extension) : null;
      let muted = false;
      try {
        muted = !!(c.RTCSession && c.RTCSession.isMuted && c.RTCSession.isMuted().audio);
      } catch (e) {
        muted = false;
      }
      this.muted = muted;
      if (this.state === SIP.CONNECTED) {
        if (!this.since) this.since = Date.now();
      } else {
        this.since = null;
      }
    }
    if (this.state !== SIP.IDLE) this._hookSession();
    // Report a call that drops back to idle within 3 s as an error (e.g. rejected immediately)
    if (this.state !== SIP.IDLE && this._prevState === SIP.IDLE) {
      this._callStarted = Date.now();
      this._failCause = null;
    }
    if (this.state === SIP.IDLE && this._prevState && this._prevState !== SIP.IDLE) {
      if (!this._failCause && this._prevState !== SIP.CONNECTED && this._callStarted && Date.now() - this._callStarted < 3000) {
        this._onError(new Error(this._prevState === SIP.INCOMING ? "incoming call ended immediately" : "call ended immediately"));
      }
      this._callStarted = 0;
    }
    this._prevState = this.state;
    const sig = [this.available, this.registered, this.state, this.remoteExtension, this.remoteName, this.muted, this.ownExtension].join("|");
    if (sig !== this._last) {
      this._last = sig;
      this._onChange();
    }
  }

  answer() {
    const c = this.core;
    if (c && typeof c.answerCall === "function") c.answerCall();
  }

  hangup() {
    const c = this.core;
    if (c && typeof c.endCall === "function") c.endCall();
  }

  call(extension) {
    const c = this.core;
    if (!c || typeof c.startCall !== "function" || !extension) {
      this._onError(new Error(c ? "startCall missing" : "sipCore missing"));
      return;
    }
    try {
      Promise.resolve(c.startCall(String(extension)))
        .then(() => this._hookSession())
        .catch((err) => this._onError(err));
    } catch (err) {
      this._onError(err);
    }
    window.setTimeout(() => this.refresh(), 300);
  }

  /* Watch the running JsSIP session so the cause of a failure shows up in the card. */
  _hookSession() {
    const c = this.core;
    const session = c && c.RTCSession;
    if (!session || session === this._hooked || typeof session.on !== "function") return;
    this._hooked = session;
    try {
      session.on("failed", (e) => {
        const cause = (e && e.cause) || "failed";
        const code = e && e.message && e.message.status_code ? ` (${e.message.status_code})` : "";
        this._failCause = `${cause}${code}`;
        this._onError(new Error(this._failCause));
        this.refresh();
      });
    } catch (err) {
      /* not an EventEmitter session */
    }
  }

  toggleMute() {
    const s = this.core && this.core.RTCSession;
    if (!s) return;
    try {
      if (s.isMuted().audio) s.unmute({ audio: true });
      else s.mute({ audio: true });
    } catch (e) {
      /* no session */
    }
    this.refresh();
  }

  sendDtmf(digit) {
    const s = this.core && this.core.RTCSession;
    if (s && typeof s.sendDTMF === "function") {
      try {
        s.sendDTMF(String(digit));
      } catch (e) {
        /* not in a call */
      }
    }
  }
}
