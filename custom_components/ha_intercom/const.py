"""Constants for the Intercom integration."""

from __future__ import annotations

DOMAIN = "ha_intercom"

# --- Config entry data (config flow) ---
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
# only used in the config flow, not stored
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

# --- Folders below the base folder ---
DIR_MAILBOX = "mailbox"
DIR_ANNOUNCEMENTS = "announcements"
DIR_RINGBACK = "ringback"
DIR_RINGBACK_ACTIVE = "active"
DIR_CONVERTED = "converted"
DIR_RINGTONES = "ringtones"

# --- Settings (entities) ---
SETTING_MAILBOX = "mailbox"
SETTING_VOICE_ANNOUNCEMENT = "voice_announcement"
SETTING_RING_DURATION = "ring_duration"
SETTING_TALK_TIME = "talk_time"
SETTING_RETENTION = "retention"
SETTING_RINGBACK = "ringback"
SETTING_ANNOUNCEMENT = "announcement"
SETTING_RINGTONE = "ringtone"

DEFAULT_SETTINGS = {
    SETTING_MAILBOX: True,
    SETTING_VOICE_ANNOUNCEMENT: False,
    SETTING_RING_DURATION: 20,
    SETTING_TALK_TIME: 30,
    SETTING_RETENTION: 30,
    SETTING_RINGBACK: "default",
    SETTING_ANNOUNCEMENT: "",
    SETTING_RINGTONE: "",
}

RINGBACK_DEFAULT = "default"
ANNOUNCEMENT_NONE = "none"

# --- Asterisk ---
ASTDB_FAMILY = "intercom"
ASTERISK_DOMAIN = "asterisk"
ASTERISK_SERVICE = "send_action"
MOH_CLASS = "intercom"
SIP_CORE_DOMAIN = "sip_core"
CHECK_TIMEOUT = 8

# --- Events ---
# "ring" is the event type Home Assistant prescribes for doorbell entities (device_class doorbell);
# this makes the built-in doorbell triggers work. The remaining types are our own.
EVENT_RING = "ring"
EVENT_ANSWERED = "answered"
EVENT_RECORDED = "recorded"
EVENT_MESSAGE = "message"
EVENT_TYPES = [EVENT_RING, EVENT_ANSWERED, EVENT_RECORDED, EVENT_MESSAGE]
HA_EVENT_RING = f"{DOMAIN}_ring"
HA_EVENT_RECORDED = f"{DOMAIN}_recorded"

# --- Services ---
SERVICE_DELETE_MESSAGE = "delete_message"
SERVICE_MARK_MESSAGE_SEEN = "mark_message_seen"
SERVICE_MARK_ALL_SEEN = "mark_all_seen"
SERVICE_ACTIVATE_ANNOUNCEMENT = "activate_announcement"
SERVICE_DELETE_ANNOUNCEMENT = "delete_announcement"
SERVICE_RENAME_ANNOUNCEMENT = "rename_announcement"
SERVICE_START_RECORDING = "start_recording"
SERVICE_STOP_RECORDING = "stop_recording"
SERVICE_RESCAN = "rescan"
SERVICE_ASTERISK_SYNC = "asterisk_sync"

ATTR_ID = "id"
ATTR_NAME = "name"
ATTR_NEW_NAME = "new_name"

# --- HTTP ---
URL_MEDIA = "/api/ha_intercom/media/{kind}/{name}"
URL_UPLOAD = "/api/ha_intercom/announcement/upload"
MEDIA_KIND_CLIP = "clip"
MEDIA_KIND_IMAGE = "image"
MEDIA_KIND_ANNOUNCEMENT = "announcement"
MEDIA_KIND_RINGBACK = "ringback"
MEDIA_KINDS = (MEDIA_KIND_CLIP, MEDIA_KIND_IMAGE, MEDIA_KIND_ANNOUNCEMENT, MEDIA_KIND_RINGBACK)
MAX_UPLOAD_BYTES = 25 * 1024 * 1024

# --- Miscellaneous ---
FFMPEG = "ffmpeg"
FFPROBE = "ffprobe"
SCAN_INTERVAL_SECONDS = 60
CLEANUP_HOUR = 3
CLEANUP_MINUTE = 30
ASTDB_STARTUP_DELAY = 20
AUDIO_EXTENSIONS = (".mp3", ".m4a", ".aac", ".webm", ".ogg", ".opus", ".wav", ".flac")
