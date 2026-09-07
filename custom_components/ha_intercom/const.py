"""Constants for the Intercom integration."""

from __future__ import annotations

DOMAIN = "ha_intercom"

# --- Config entry data (Konfigurationsdialog) ---
CONF_TRIGGER_ENTITY = "trigger_entity"
CONF_TRIGGER_STATE = "trigger_state"
CONF_CAMERA_ENTITY = "camera_entity"
CONF_STREAM_URL = "stream_url"
CONF_EXT_DOOR = "ext_door"
CONF_EXT_TABLET = "ext_tablet"
CONF_DOOR_STATE_ENTITY = "door_state_entity"
CONF_TABLET_STATE_ENTITY = "tablet_state_entity"
CONF_AMI_CONNECTED_ENTITY = "ami_connected_entity"
CONF_ADDON_SLUG = "addon_slug"
CONF_BASE_DIR = "base_dir"
CONF_ALARM_ENTITY = "alarm_entity"
CONF_LOCK_ENTITY = "lock_entity"
# nur im Konfigurationsdialog, wird nicht gespeichert
CONF_IGNORE_STREAM = "ignore_stream"
CONF_MOVE_FILES = "move_files"

# --- Options ---
CONF_MAX_CLIP_SECONDS = "max_clip_seconds"
CONF_SNAPSHOT_DELAY = "snapshot_delay"
CONF_IDLE_STATE = "idle_state"
CONF_IN_USE_STATE = "in_use_state"

DEFAULT_TRIGGER_STATE = "Doorbell Ring"
DEFAULT_STREAM_URL = "rtsp://127.0.0.1:8554/doorbell_hd"
DEFAULT_EXT_DOOR = "103"
DEFAULT_EXT_TABLET = "102"
DEFAULT_AMI_CONNECTED_ENTITY = "binary_sensor.ami_connected"
DEFAULT_BASE_DIR = "/media/ha-intercom"
DEFAULT_MAX_CLIP_SECONDS = 120
DEFAULT_SNAPSHOT_DELAY = 0
DEFAULT_IDLE_STATE = "Not in use"
DEFAULT_IN_USE_STATE = "In use"

# --- Ordner unterhalb des Basisordners ---
DIR_MAILBOX = "mailbox"
DIR_ANSAGE = "announcements"
DIR_FREIZEICHEN = "ringback"
DIR_FREIZEICHEN_AKTIV = "active"
DIR_KONVERTIERT = "converted"
DIR_KLINGELTOENE = "ringtones"

# --- Einstellungen (Entitaeten) ---
SETTING_MAILBOX = "mailbox"
SETTING_SPRACHANSAGE = "voice_announcement"
SETTING_KLINGELDAUER = "ring_duration"
SETTING_SPRECHZEIT = "talk_time"
SETTING_AUFBEWAHRUNG = "retention"
SETTING_FREIZEICHEN = "ringback"
SETTING_ANSAGE = "announcement"
SETTING_KLINGELTON = "ringtone"

DEFAULT_SETTINGS = {
    SETTING_MAILBOX: True,
    SETTING_SPRACHANSAGE: False,
    SETTING_KLINGELDAUER: 20,
    SETTING_SPRECHZEIT: 30,
    SETTING_AUFBEWAHRUNG: 30,
    SETTING_FREIZEICHEN: "default",
    SETTING_ANSAGE: "",
    SETTING_KLINGELTON: "",
}

FREIZEICHEN_STANDARD = "default"
ANSAGE_KEINE = "none"

# --- Asterisk ---
ASTDB_FAMILY = "intercom"
ASTERISK_DOMAIN = "asterisk"
ASTERISK_SERVICE = "send_action"
MOH_CLASS = "intercom"
SIP_CORE_DOMAIN = "sip_core"
CHECK_TIMEOUT = 8

# --- Ereignisse ---
# "ring" ist der von Home Assistant vorgegebene Ereignistyp fuer Tuerklingel-Entitaeten (device_class doorbell);
# damit greifen die eingebauten Tuerklingel-Ausloeser. Die uebrigen Typen sind eigene.
EVENT_KLINGELN = "ring"
EVENT_ANGENOMMEN = "answered"
EVENT_AUFGEZEICHNET = "recorded"
EVENT_NACHRICHT = "message"
EVENT_TYPES = [EVENT_KLINGELN, EVENT_ANGENOMMEN, EVENT_AUFGEZEICHNET, EVENT_NACHRICHT]
HA_EVENT_RING = f"{DOMAIN}_ring"
HA_EVENT_RECORDED = f"{DOMAIN}_recorded"

# --- Dienste ---
SERVICE_NACHRICHT_LOESCHEN = "delete_message"
SERVICE_NACHRICHT_GESEHEN = "mark_message_seen"
SERVICE_ALLE_GESEHEN = "mark_all_seen"
SERVICE_ANSAGE_AKTIVIEREN = "activate_announcement"
SERVICE_ANSAGE_LOESCHEN = "delete_announcement"
SERVICE_ANSAGE_UMBENENNEN = "rename_announcement"
SERVICE_AUFNAHME_STARTEN = "start_recording"
SERVICE_AUFNAHME_STOPPEN = "stop_recording"
SERVICE_INDEX_NEU = "rescan"
SERVICE_ASTERISK_SYNC = "asterisk_sync"

ATTR_KENNUNG = "id"
ATTR_NAME = "name"
ATTR_NEUER_NAME = "new_name"

# --- HTTP ---
URL_MEDIA = "/api/ha_intercom/media/{kind}/{name}"
URL_UPLOAD = "/api/ha_intercom/announcement/upload"
MEDIA_KIND_CLIP = "clip"
MEDIA_KIND_BILD = "image"
MEDIA_KIND_ANSAGE = "announcement"
MEDIA_KIND_FREIZEICHEN = "ringback"
MEDIA_KINDS = (MEDIA_KIND_CLIP, MEDIA_KIND_BILD, MEDIA_KIND_ANSAGE, MEDIA_KIND_FREIZEICHEN)
MAX_UPLOAD_BYTES = 25 * 1024 * 1024

# --- Sonstiges ---
FFMPEG = "ffmpeg"
FFPROBE = "ffprobe"
SCAN_INTERVAL_SECONDS = 60
CLEANUP_HOUR = 3
CLEANUP_MINUTE = 30
ASTDB_STARTUP_DELAY = 20
AUDIO_EXTENSIONS = (".mp3", ".m4a", ".aac", ".webm", ".ogg", ".opus", ".wav", ".flac")
