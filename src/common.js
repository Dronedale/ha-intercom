/* Gemeinsame Helfer: Texte, Symbole, Formatierung, signierte Medienpfade, Auskunft der Integration. */

export const VERSION = __INTERCOM_VERSION__;

const STRINGS = {
  de: {
    title: "Doorbell",
    intercom: "Sprechanlage",
    tab_call: "Anruf",
    tab_contacts: "Kontakte",
    tab_dial: "Wählen",
    contacts_none: "Keine Nebenstellen gefunden",
    ringing: "Es klingelt",
    in_call: "Im Gespräch",
    calling: "Ruft an",
    connecting: "Verbinde …",
    call_failed: "Anruf fehlgeschlagen: {e}",
    ready: "Bereit",
    sip_missing: "Sprechanlage hier nicht verfügbar",
    sip_hint: "sip-core ist auf diesem Gerät nicht angemeldet",
    visitor: "Besucher an der Haustür",
    call_from: "Anruf von {name}",
    calling_to: "Rufe {name} an …",
    talking_with: "Gespräch mit {name}",
    ringing_since: "Klingelt seit {s} s",
    announcement_in: "Ansage in {s} s",
    busy_in: "Besetztton in {s} s",
    ringing_elsewhere: "Es klingelt, hier nicht annehmbar",
    answer: "Annehmen",
    hangup: "Auflegen",
    reject: "Ablehnen",
    call: "Anrufen",
    call_door: "Türstation anrufen",
    mute: "Mikrofon aus",
    unmute: "Mikrofon an",
    door: "Haustür",
    door_locked: "Verriegelt",
    door_unlocked: "Entriegelt",
    door_open: "Offen",
    door_busy: "Wird geöffnet …",
    door_unavailable: "Nicht erreichbar",
    open: "Öffnen",
    open_door: "Tür öffnen",
    lock: "Abschließen",
    unlock: "Aufschließen",
    really_open: "Wirklich öffnen?",
    yes: "Ja",
    no: "Nein",
    door_station: "Türstation",
    door_ready: "Türstation erreichbar",
    door_not_ready: "Türstation nicht registriert",
    call_from_here: "Von hier aus anrufen",
    volume: "Lautstärke",
    tablet: "Tablet",
    muted: "Stumm",
    reachable: "erreichbar",
    unreachable: "nicht registriert",
    unknown: "unbekannt",
    last_ring: "Letztes Klingeln",
    never: "noch nie",
    settings: "Einstellungen",
    close: "Schließen",
    mailbox: "Mailbox",
    messages: "Nachrichten",
    no_announcements: "Noch keine Ansage aufgenommen",
    new_n: "{n} neu",
    all_seen: "Alle gesehen",
    no_messages: "Noch keine Nachrichten",
    recording_now: "Aufnahme läuft …",
    recording_hint: "Der Clip erscheint nach dem Klingeln in der Liste",
    msg_answered: "Angenommen · Gespräch {s} s",
    msg_note: "Nachricht hinterlassen · {s} s",
    msg_visitor: "Besucher, keine Nachricht · {s} s",
    clip_info: "Clip {d} · Bild und Ton von der Türstation",
    no_clip: "Kein Clip vorhanden",
    delete: "Löschen",
    really_delete: "Wirklich löschen?",
    play: "Abspielen",
    listen: "Anhören",
    stop_listen: "Anhalten",
    announcements: "Ansagen",
    active: "Aktiv",
    none: "Keine",
    n_available: "{n} vorhanden",
    no_announcement: "Keine Ansage",
    no_announcement_hint: "Nach der Klingeldauer nur Besetztton",
    recorded_on: "Aufgenommen {d} · {s} s",
    record_new: "Neue Ansage aufnehmen",
    record_unsupported: "Aufnahme in diesem Browser nicht möglich",
    device_mic: "Mikrofon dieses Geräts",
    recording: "Aufnahme läuft",
    speak_now: "sprich jetzt Richtung Gerät",
    stop: "Stopp",
    name: "Name",
    save: "Speichern",
    discard: "Verwerfen",
    uploading: "Wird gespeichert …",
    upload_failed: "Speichern fehlgeschlagen: {e}",
    mic_failed: "Mikrofon nicht verfügbar: {e}",
    rename: "Umbenennen",
    new_recording: "Neue Aufnahme · {s} s · Name prüfen und speichern",
    enlarge: "Vergrößern",
    shrink: "Verkleinern",
    live: "LIVE",
    today: "Heute",
    yesterday: "Gestern",
    seconds: "s",
    days: "Tage",
    percent: "%",
    alarm: "Alarmanlage",
    on: "an",
    off: "aus",
    info_title: "Details",
    chip_door: "Außenstation",
    chip_tablet: "Innenstation",
    info_new: "Neue Nachrichten",
    info_ringback: "Freizeichen",
    al_disarmed: "Unscharf",
    al_armed_away: "Abwesend",
    al_armed_home: "Zuhause",
    al_armed_night: "Nacht",
    al_armed_vacation: "Urlaub",
    al_armed_custom_bypass: "Benutzerdefiniert",
    al_arming: "Wird scharf …",
    al_pending: "Verzögerung läuft …",
    al_triggered: "Alarm ausgelöst",
    al_unavailable: "Nicht erreichbar",
    al_unknown: "Unbekannt",
    al_since: "seit {t}",
    al_code_for: "Code für {m}",
    al_code_wrong: "Code falsch, bitte erneut eingeben",
    al_open_sensors: "Offene Sensoren: {s}",
    al_not_allowed: "Nicht erlaubt",
    al_failed: "Fehlgeschlagen: {r}",
    al_cancel: "Abbrechen",
    al_sub_armed_away: "alles scharf",
    al_sub_armed_home: "nur Außenhaut",
    al_sub_disarmed: "aus",
    settings_title: "Intercom Einstellungen",
    g_ring: "Klingeln",
    g_answering: "Anrufbeantworter",
    g_status: "Status",
    s_klingeldauer: "Klingeldauer",
    s_klingeldauer_d: "So lange klingelt das Tablet, danach Besetztton oder Ansage",
    s_freizeichen: "Freizeichen an der Tür",
    s_freizeichen_d: "Standard oder eine Datei aus dem Freizeichen-Ordner",
    s_klingelton: "Klingelton Innenstation",
    s_klingelton_d: "Ton am Wandtablet beim Klingeln, Dateien im Ordner klingeltoene",
    s_mailbox: "Mailbox",
    s_mailbox_d: "Jedes Klingeln mit Clip und Vorschaubild speichern",
    s_sprachansage: "Sprachansage",
    s_sprachansage_d: "Nach der Klingeldauer Ansage, Piepton und Sprechzeit statt Besetztton",
    s_ansage: "Aktive Ansage",
    s_ansage_d: "Wird nach der Klingeldauer abgespielt",
    s_sprechzeit: "Sprechzeit nach der Ansage",
    s_sprechzeit_d: "Endet früher, wenn der Besucher schweigt",
    s_aufbewahrung: "Aufbewahrung",
    s_aufbewahrung_d: "Ältere Nachrichten werden nachts gelöscht",
    st_door: "Türstation {ext}",
    st_tablet: "Wandtablet {ext}",
    st_registered: "Registriert",
    st_not_registered: "Nicht registriert",
    st_asterisk: "Asterisk",
    st_connected: "Verbunden",
    st_disconnected: "Getrennt",
    st_recording: "Aufnahme",
    st_running: "Läuft",
    st_idle: "Bereit",
    not_configured: "Intercom-Integration nicht gefunden",
    not_configured_hint: "Bitte zuerst die Integration einrichten oder entry_id prüfen",
    loading: "Lade …",
  },
  en: {
    title: "Doorbell",
    intercom: "Intercom",
    tab_call: "Call",
    tab_contacts: "Contacts",
    tab_dial: "Dial",
    contacts_none: "No extensions found",
    ringing: "Ringing",
    in_call: "In call",
    calling: "Calling",
    connecting: "Connecting …",
    call_failed: "Call failed: {e}",
    ready: "Ready",
    sip_missing: "Intercom not available here",
    sip_hint: "sip-core is not registered on this device",
    visitor: "Visitor at the front door",
    call_from: "Call from {name}",
    calling_to: "Calling {name} …",
    talking_with: "Talking to {name}",
    ringing_since: "Ringing for {s} s",
    announcement_in: "Announcement in {s} s",
    busy_in: "Busy tone in {s} s",
    ringing_elsewhere: "Ringing, cannot answer here",
    answer: "Answer",
    hangup: "Hang up",
    reject: "Reject",
    call: "Call",
    call_door: "Call door station",
    mute: "Mute mic",
    unmute: "Unmute mic",
    door: "Front door",
    door_locked: "Locked",
    door_unlocked: "Unlocked",
    door_open: "Open",
    door_busy: "Opening …",
    door_unavailable: "Unavailable",
    open: "Open",
    open_door: "Open door",
    lock: "Lock",
    unlock: "Unlock",
    really_open: "Really open?",
    yes: "Yes",
    no: "No",
    door_station: "Door station",
    door_ready: "Door station reachable",
    door_not_ready: "Door station not registered",
    call_from_here: "Call from here",
    volume: "Volume",
    tablet: "Tablet",
    muted: "Muted",
    reachable: "reachable",
    unreachable: "not registered",
    unknown: "unknown",
    last_ring: "Last ring",
    never: "never",
    settings: "Settings",
    close: "Close",
    mailbox: "Mailbox",
    messages: "Messages",
    no_announcements: "No announcement recorded yet",
    new_n: "{n} new",
    all_seen: "Mark all seen",
    no_messages: "No messages yet",
    recording_now: "Recording …",
    recording_hint: "The clip shows up in the list after the ring",
    msg_answered: "Answered · call {s} s",
    msg_note: "Message left · {s} s",
    msg_visitor: "Visitor, no message · {s} s",
    clip_info: "Clip {d} · video and audio from the door station",
    no_clip: "No clip available",
    delete: "Delete",
    really_delete: "Really delete?",
    play: "Play",
    listen: "Listen",
    stop_listen: "Stop",
    announcements: "Announcements",
    active: "Active",
    none: "None",
    n_available: "{n} available",
    no_announcement: "No announcement",
    no_announcement_hint: "Busy tone only after the ring time",
    recorded_on: "Recorded {d} · {s} s",
    record_new: "Record new announcement",
    record_unsupported: "Recording not possible in this browser",
    device_mic: "Microphone of this device",
    recording: "Recording",
    speak_now: "speak towards the device now",
    stop: "Stop",
    name: "Name",
    save: "Save",
    discard: "Discard",
    uploading: "Saving …",
    upload_failed: "Saving failed: {e}",
    mic_failed: "Microphone unavailable: {e}",
    rename: "Rename",
    new_recording: "New recording · {s} s · check the name and save",
    enlarge: "Enlarge",
    shrink: "Shrink",
    live: "LIVE",
    today: "Today",
    yesterday: "Yesterday",
    seconds: "s",
    days: "days",
    percent: "%",
    alarm: "Alarm",
    on: "on",
    off: "off",
    info_title: "Details",
    chip_door: "Outdoor station",
    chip_tablet: "Indoor station",
    info_new: "New messages",
    info_ringback: "Ringback tone",
    al_disarmed: "Disarmed",
    al_armed_away: "Away",
    al_armed_home: "Home",
    al_armed_night: "Night",
    al_armed_vacation: "Vacation",
    al_armed_custom_bypass: "Custom",
    al_arming: "Arming …",
    al_pending: "Pending …",
    al_triggered: "Alarm triggered",
    al_unavailable: "Unavailable",
    al_unknown: "Unknown",
    al_since: "since {t}",
    al_code_for: "Code for {m}",
    al_code_wrong: "Wrong code, please try again",
    al_open_sensors: "Open sensors: {s}",
    al_not_allowed: "Not allowed",
    al_failed: "Failed: {r}",
    al_cancel: "Cancel",
    al_sub_armed_away: "everything armed",
    al_sub_armed_home: "perimeter only",
    al_sub_disarmed: "off",
    settings_title: "Intercom settings",
    g_ring: "Ringing",
    g_answering: "Answering machine",
    g_status: "Status",
    s_klingeldauer: "Ring time",
    s_klingeldauer_d: "How long the tablet rings, then busy tone or announcement",
    s_freizeichen: "Ringback tone at the door",
    s_freizeichen_d: "Default or a file from the ringback folder",
    s_klingelton: "Indoor ringtone",
    s_klingelton_d: "Sound on the wall tablet when the bell rings, files in the klingeltoene folder",
    s_mailbox: "Mailbox",
    s_mailbox_d: "Store every ring with clip and thumbnail",
    s_sprachansage: "Voice announcement",
    s_sprachansage_d: "After the ring time play the announcement, beep and speaking time instead of busy tone",
    s_ansage: "Active announcement",
    s_ansage_d: "Played after the ring time",
    s_sprechzeit: "Speaking time after the announcement",
    s_sprechzeit_d: "Ends earlier when the visitor stays silent",
    s_aufbewahrung: "Retention",
    s_aufbewahrung_d: "Older messages are deleted at night",
    st_door: "Door station {ext}",
    st_tablet: "Wall tablet {ext}",
    st_registered: "Registered",
    st_not_registered: "Not registered",
    st_asterisk: "Asterisk",
    st_connected: "Connected",
    st_disconnected: "Disconnected",
    st_recording: "Recording",
    st_running: "Running",
    st_idle: "Idle",
    not_configured: "Intercom integration not found",
    not_configured_hint: "Set up the integration first or check entry_id",
    loading: "Loading …",
  },
};

export function pickLanguage(hass, config) {
  const wanted = (config && config.language) || (hass && hass.locale && hass.locale.language) || (hass && hass.language) || "en";
  return String(wanted).toLowerCase().startsWith("de") ? "de" : "en";
}

export function makeT(lang) {
  const table = STRINGS[lang] || STRINGS.en;
  return (key, vars) => {
    let s = table[key] ?? STRINGS.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
    }
    return s;
  };
}

/* Material-Design-Symbole (mdi), als Pfade */
export const ICONS = {
  phone: "M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z",
  hangup: "M12,9C10.4,9 8.85,9.25 7.4,9.72V12.82C7.4,13.22 7.17,13.56 6.84,13.72C5.86,14.21 4.97,14.84 4.17,15.57C4,15.75 3.75,15.86 3.5,15.86C3.2,15.86 2.95,15.74 2.77,15.56L0.29,13.08C0.11,12.9 0,12.65 0,12.38C0,12.1 0.11,11.85 0.29,11.67C3.34,8.77 7.46,7 12,7C16.54,7 20.66,8.77 23.71,11.67C23.89,11.85 24,12.1 24,12.38C24,12.65 23.89,12.9 23.71,13.08L21.23,15.56C21.05,15.74 20.8,15.86 20.5,15.86C20.25,15.86 20,15.75 19.82,15.57C19.03,14.84 18.14,14.21 17.16,13.72C16.83,13.56 16.6,13.22 16.6,12.82V9.72C15.15,9.25 13.6,9 12,9Z",
  mic: "M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z",
  micOff: "M19,11C19,12.19 18.66,13.3 18.1,14.28L16.87,13.05C17.14,12.43 17.3,11.74 17.3,11H19M15,11.16L9,5.18V5A3,3 0 0,1 12,2A3,3 0 0,1 15,5V11L15,11.16M4.27,3L21,19.73L19.73,21L15.54,16.81C14.77,17.27 13.91,17.58 13,17.72V21H11V17.72C7.72,17.23 5,14.41 5,11H6.7C6.7,14 9.24,16.1 12,16.1C12.81,16.1 13.6,15.91 14.31,15.58L12.65,13.92L12,14A3,3 0 0,1 9,11V10.28L3,4.27L4.27,3Z",
  volume: "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z",
  volumeOff: "M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z",
  lock: "M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z",
  lockOpen: "M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,0 14,15A2,2 0 0,0 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17Z",
  doorbell: "M12,2A7,7 0 0,0 5,9V15A2,2 0 0,0 7,17H9V19A3,3 0 0,0 12,22A3,3 0 0,0 15,19V17H17A2,2 0 0,0 19,15V9A7,7 0 0,0 12,2M12,4A5,5 0 0,1 17,9V15H7V9A5,5 0 0,1 12,4M11,17H13V19A1,1 0 0,1 12,20A1,1 0 0,1 11,19V17M12,6A3,3 0 0,0 9,9V13H15V9A3,3 0 0,0 12,6Z",
  play: "M8,5.14V19.14L19,12.14L8,5.14Z",
  pause: "M14,19H18V5H14M6,19H10V5H6V19Z",
  stop: "M18,18H6V6H18V18Z",
  trash: "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",
  cog: "M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z",
  expand: "M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z",
  close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
  chevron: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
  tablet: "M19,18H5V6H19M21,4H3C1.89,4 1,4.89 1,6V18A2,2 0 0,0 3,20H21A2,2 0 0,0 23,18V6C23,4.89 22.1,4 21,4Z",
  backspace: "M22,3H7C6.31,3 5.77,3.35 5.41,3.88L0,12L5.41,20.11C5.77,20.64 6.31,21 7,21H22A2,2 0 0,0 24,19V5A2,2 0 0,0 22,3M19,15.59L17.59,17L14,13.41L10.41,17L9,15.59L12.59,12L9,8.41L10.41,7L14,10.59L17.59,7L19,8.41L15.41,12L19,15.59Z",
  check: "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",
  account: "M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z",
  image: "M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z",
  pencil: "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z",
  eye: "M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z",
  doorOpen: "M12,3C13.1,3 14,3.9 14,5V19C14,20.1 13.1,21 12,21H4V3H12M12,5H6V19H12V5M8,11H10V13H8V11M20,3H16V5H18V19H16V21H20V3Z",
  shieldLock: "M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.1 14.8,9.5V11C15.4,11 16,11.6 16,12.3V15.8C16,16.4 15.4,17 14.7,17H9.2C8.6,17 8,16.4 8,15.7V12.2C8,11.6 8.6,11 9.2,11V9.5C9.2,8.1 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V11H13.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z",
  shieldHome: "M11,13H13V16H16V11H18L12,6L6,11H8V16H11V13M12,1L21,5V11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1Z",
  shieldOff: "M1,4.27L2.28,3L20.5,21.22L19.23,22.5L17,20.25C15.57,21.57 13.87,22.54 12,23C6.84,21.74 3,16.55 3,11V6.27L1,4.27M12,1L21,5V11C21,13.28 20.35,15.5 19.23,17.41L5.65,3.82L12,1Z",
  shieldAlert: "M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5M11,7H13V13H11M11,15H13V17H11",
  shieldSync: "M18 12A6.41 6.41 0 0 1 20.87 12.67A11.63 11.63 0 0 0 21 11V5L12 1L3 5V11C3 16.55 6.84 21.74 12 23C12.35 22.91 12.7 22.8 13 22.68A6.42 6.42 0 0 1 11.5 18.5A6.5 6.5 0 0 1 18 12M18 14.5V13L15.75 15.25L18 17.5V16A2.5 2.5 0 0 1 20.24 19.62L21.33 20.71A4 4 0 0 0 18 14.5M18 21A2.5 2.5 0 0 1 15.76 17.38L14.67 16.29A4 4 0 0 0 18 22.5V24L20.25 21.75L18 19.5Z",
  shieldMoon: "M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M15.97 14.41C14.13 16.58 10.76 16.5 9 14.34C6.82 11.62 8.36 7.62 11.7 7C12.04 6.95 12.33 7.28 12.21 7.61C11.75 8.84 11.82 10.25 12.53 11.47C13.24 12.69 14.42 13.46 15.71 13.67C16.05 13.72 16.2 14.14 15.97 14.41Z",
  shieldAirplane: "M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,5.68C12.5,5.68 12.95,6.11 12.95,6.63V10.11L18,13.26V14.53L12.95,12.95V16.42L14.21,17.37V18.32L12,17.68L9.79,18.32V17.37L11.05,16.42V12.95L6,14.53V13.26L11.05,10.11V6.63C11.05,6.11 11.5,5.68 12,5.68Z",
  shieldAccount: "M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M17.13,17C15.92,18.85 14.11,20.24 12,20.92C9.89,20.24 8.08,18.85 6.87,17C6.53,16.5 6.24,16 6,15.47C6,13.82 8.71,12.47 12,12.47C15.29,12.47 18,13.79 18,15.47C17.76,16 17.47,16.5 17.13,17Z",
  shieldCheck: "M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z",
  shieldStar: "M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M15.08 16L12 14.15L8.93 16L9.74 12.5L7.03 10.16L10.61 9.85L12 6.55L13.39 9.84L16.97 10.15L14.26 12.5L15.08 16Z",
  home: "M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z",
  bell: "M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21",
  record: "M19,12C19,15.86 15.86,19 12,19C8.14,19 5,15.86 5,12C5,8.14 8.14,5 12,5C15.86,5 19,8.14 19,12Z",
};

export function fmtDuration(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/* "Heute 14:32", "Gestern 18:05", sonst "Do., 04.09. 09:41" */
export function fmtWhen(iso, lang, t) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const locale = lang === "de" ? "de-DE" : "en-GB";
  const time = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const now = new Date();
  if (sameDay(d, now)) return `${t("today")} ${time}`;
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (sameDay(d, y)) return `${t("yesterday")} ${time}`;
  const day = d.toLocaleDateString(locale, { weekday: "short", day: "2-digit", month: "2-digit" });
  return `${day} ${time}`;
}

export function fmtDate(iso, lang) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString(lang === "de" ? "de-DE" : "en-GB", { day: "2-digit", month: "2-digit" });
}

export function fmtClock(iso, lang) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleTimeString(lang === "de" ? "de-DE" : "en-GB", { hour: "2-digit", minute: "2-digit" });
}

/* Signierte Pfade fuer Bilder, Clips und Ansagen; Browser-Elemente koennen keinen Bearer-Token senden. */
const signed = new Map();

export async function signPath(hass, path, expires = 3600) {
  const hit = signed.get(path);
  const now = Date.now();
  if (hit && hit.exp > now + 30000) return hit.url;
  const res = await hass.callWS({ type: "auth/sign_path", path, expires });
  const url = hass.hassUrl(res.path);
  signed.set(path, { url, exp: now + expires * 1000 });
  return url;
}

export function signedCached(path) {
  const hit = signed.get(path);
  return hit && hit.exp > Date.now() + 30000 ? hit.url : null;
}

/* Auskunft der Integration: Nebenstellen, Kamera, Entitaeten je Schluessel. */
const infoCache = new Map();

export async function fetchInfo(hass, entryId, force = false) {
  const key = entryId || "";
  const hit = infoCache.get(key);
  if (!force && hit && hit.exp > Date.now()) return hit.value;
  const res = await hass.callWS({ type: "ha_intercom/info", ...(entryId ? { entry_id: entryId } : {}) });
  const value = (res && res.entries && res.entries[0]) || null;
  infoCache.set(key, { value, exp: Date.now() + 5 * 60 * 1000 });
  return value;
}

export function stateOf(hass, entityId) {
  return entityId && hass && hass.states ? hass.states[entityId] : undefined;
}

export function attr(hass, entityId, name, fallback) {
  const st = stateOf(hass, entityId);
  return st && st.attributes && st.attributes[name] !== undefined ? st.attributes[name] : fallback;
}

export function isOn(hass, entityId) {
  const st = stateOf(hass, entityId);
  return !!st && st.state === "on";
}

export function numState(hass, entityId, fallback = 0) {
  const st = stateOf(hass, entityId);
  const n = st ? Number(st.state) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export function friendlyName(hass, entityId) {
  const st = stateOf(hass, entityId);
  return (st && st.attributes && st.attributes.friendly_name) || entityId || "";
}

export function callService(hass, domain, service, data) {
  return hass.callService(domain, service, data);
}

export function fireEvent(node, type, detail) {
  node.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
}

export async function loadHelpers() {
  if (window.loadCardHelpers) return window.loadCardHelpers();
  return null;
}

/* Eine Dashboard-Karte aus einer Konfiguration erzeugen (z. B. die Kamerakarte). */
export async function createCard(config) {
  const helpers = await loadHelpers();
  if (helpers && helpers.createCardElement) return helpers.createCardElement(config);
  const type = String(config.type || "");
  const tag = type.startsWith("custom:") ? type.slice(7) : `hui-${type}-card`;
  const el = document.createElement(tag);
  if (el.setConfig) el.setConfig(config);
  return el;
}
