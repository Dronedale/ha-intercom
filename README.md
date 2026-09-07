# Intercom for Home Assistant

[![Validate](https://github.com/Dronedale/ha-intercom/actions/workflows/validate.yml/badge.svg)](https://github.com/Dronedale/ha-intercom/actions/workflows/validate.yml)
[![Open your Home Assistant instance and add this repository to HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Dronedale&repository=ha-intercom&category=integration)

A door intercom with video mailbox, voice announcements, ringback tones and ring duration, delivered as one
integration plus a full-screen card. Built for a Dahua VTO on the Asterisk add-on (TECH7Fox) with sip-core in the
browser; the configuration dialog makes it adaptable to other door stations.

## Requirements

| What | Why | Required |
|---|---|---|
| **[Asterisk add-on](https://github.com/TECH7Fox/asterisk-hass-addons)** (TECH7Fox, Home Assistant OS or Supervised) | The PBX; ringback files are reloaded in the add-on via `moh reload` | yes |
| **[Asterisk integration](https://github.com/TECH7Fox/Asterisk-integration)** (TECH7Fox, HACS) | AMI access: ring duration, talk time, announcement and ringback tone go into the Asterisk database via `DBPut`; state sensors of the extensions (`sensor.<extension>_state`, `binary_sensor.<extension>_registered`, `binary_sensor.ami_connected`) | yes |
| **[sip-core](https://github.com/TECH7Fox/sipcore-hass-integration)** (TECH7Fox, HACS) | The phone in the browser (`window.sipCore`) for calling, answering, hanging up and dialing in the card | for the call section |
| **RTSP stream** of the door station, e.g. from [go2rtc](https://github.com/AlexxIT/go2rtc) | Recording of the clips; with a Dahua VTO preferably the HD stream | yes |
| **ffmpeg** | Recording and conversion; included in Home Assistant OS | yes |
| Camera entity of the door station | Snapshot as thumbnail | no |
| Entity that reports the ring | Trigger (e.g. `sensor.vto_tuerklingel` → `Doorbell Ring`) | yes |
| Alarm panel (`alarm_control_panel`), door lock (`lock`) | Controls in the card | no |

The configuration dialog detects the add-on, the integration and sip-core on its own, reads the extensions from
sip-core and the Asterisk integration, and finally checks ffmpeg, the stream, the base folder and the AMI
connection. Without a Supervisor (container installation) there is no add-on; reloading ringback files is then not
possible, everything else works.

## Setup

1. Install through HACS: click the HACS button above, or add `https://github.com/Dronedale/ha-intercom` in HACS as a
   custom repository of type "Integration". Alternatively copy the folder `custom_components/ha_intercom` to
   `/config/custom_components/`. Restart Home Assistant afterwards.
2. Settings → Integrations → add "Intercom". The dialog walks through:
   - **Prerequisites**: shows what was found (add-on, integration, sip-core with extensions). If the add-on or the
     integration is missing, the dialog aborts.
   - **Sources**: ring trigger and state, camera for the snapshot, RTSP stream for recording.
   - **Intercom**: extensions of the door station and the tablet from the list, Asterisk add-on. The state sensors
     are derived from them; only if they are missing, an extra step asks for them.
   - **House**: alarm panel and door lock (optional, the card picks up both automatically), base folder
     (default `/media/ha-intercom`).
   - **Check**: ffmpeg, stream (ffprobe with an 8 s limit), base folder writable, AMI connected. ffmpeg and the
     folder are mandatory, a stream error can be skipped deliberately.
3. Adjust Asterisk as described in "Setting up Asterisk" (dialplan, MOH class).
4. Put the card on a dashboard, see "Card".

Everything from the dialog except the sources can be changed later in the integration's options (stream, add-on,
alarm panel, door lock, base folder, maximum clip length, snapshot delay, state names). After every change the
integration reloads and reads its folders. If the base folder changes, a second step offers to move the existing
messages, announcements and ringback files to the new folder.

## What the integration does

- Detects a ring from an entity state (e.g. `sensor.vto_tuerklingel` → `Doorbell Ring`).
- With the mailbox switched on, records every ring as a clip: ffmpeg pulls the RTSP stream from go2rtc, copies the
  video and converts the audio to AAC. Snapshot from the camera entity as thumbnail.
- Stops recording when the door station is idle again, at the latest after the maximum clip length.
- Maintains the mailbox (list, seen flag, delete, nightly cleanup).
- Manages announcements (recording from the card via upload, MP3 drop folder, rename, delete, active announcement)
  and ringback files (MP3 drop folder, conversion, selection, MOH class).
- Writes ring duration, talk time, voice announcement, ringback tone and active announcement into the Asterisk
  database via AMI `DBPut` (family `intercom`) on start, on every change and whenever AMI reconnects.
- Provides the card with the extensions of the Asterisk integration as a contact list, including state and
  registration sensor and the device name given in Home Assistant.
- Serves clips, images and announcements through protected endpoints (`/api/ha_intercom/media/...`).

## Entities (device "Intercom")

Entity names are translated (English and German, following the user's language); the entity IDs below are derived
from the English names when the entities are created.

| Entity | Purpose |
|---|---|
| `switch.intercom_mailbox` | Record every ring |
| `switch.intercom_voice_announcement` | Announcement and talk time after the timeout instead of the busy tone |
| `number.intercom_ring_duration` | Ring duration, 5 to 60 s |
| `number.intercom_talk_time_after_announcement` | Talk time after the announcement, 10 to 60 s |
| `number.intercom_retention` | Days until cleanup |
| `select.intercom_ringback_tone` | Ringback tone: default or file |
| `select.intercom_active_announcement` | Announcement: none or file |
| `select.intercom_indoor_ringtone` | Indoor ringtone from `ringtones/`; attributes `media_content_id` and `media_content_type` for `media_player.play_media` |
| `sensor.intercom_messages` | Number of messages, attributes `entries`, `new`, `recording` |
| `sensor.intercom_new_messages` | Number of unseen messages |
| `sensor.intercom_announcements` | Number of announcements, attributes `list`, `active` |
| `sensor.intercom_ringback_files` | Number of ringback files, attributes `list`, `active` |
| `sensor.intercom_last_ring` | Timestamp of the last ring |
| `binary_sensor.intercom_recording` | Recording running |
| `binary_sensor.intercom_door_station_in_call` | Door station not idle |
| `event.intercom_doorbell` | Events `ring`, `answered`, `recorded`, `message` |

## Services

`ha_intercom.delete_message` (`id`), `ha_intercom.mark_message_seen` (`id`), `ha_intercom.mark_all_seen`,
`ha_intercom.activate_announcement` (`name`), `ha_intercom.delete_announcement` (`name`),
`ha_intercom.rename_announcement` (`name`, `new_name`), `ha_intercom.start_recording`, `ha_intercom.stop_recording`,
`ha_intercom.rescan` (read the folders again), `ha_intercom.asterisk_sync` (rewrite all astdb values).

## Folders

Below the base folder (default `/media/ha-intercom`, changeable in the options):

- `mailbox/` – `<id>.mp4`, `<id>.jpg`, `<id>.json`
- `announcements/` – `<name>.wav` (8 kHz, mono) plus `<name>.json`; dropped MP3s are converted
- `ringback/` – ringback source files; `ringback/converted/` the WAVs; `ringback/active/` the selected file for the MOH class
- `ringtones/` – indoor ringtones (MP3 and other audio files, played unchanged)

The Asterisk add-on must see the same path; `/media` is mounted for add-ons with media access in Home Assistant OS.

## Indoor ringtone

The integration does not ring the tablet itself; a separate automation does that on a ring. To change the tone
without touching the automation, there is the select `select.intercom_indoor_ringtone` (also in the
settings card under "Ringing"). It lists the files in `ringtones/` and carries the media source of the selected
tone as attributes. In the automation:

```yaml
action: media_player.play_media
target:
  entity_id: media_player.wall_tablet
data:
  media_content_id: "{{ state_attr('select.intercom_indoor_ringtone', 'media_content_id') }}"
  media_content_type: "{{ state_attr('select.intercom_indoor_ringtone', 'media_content_type') }}"
```

If the selected file disappears, the select falls back to the first file in the folder.

## Setting up Asterisk (recommendation)

The integration does not ship a dialplan. The following snippet is the proven template for the Asterisk add-on
(files in the add-on's custom directory); adapt extensions and context to your system.

The integration writes into the astdb family `intercom` via AMI `DBPut`:

| Key | Content |
|---|---|
| `intercom/ring_duration` | Seconds the tablet rings |
| `intercom/talk_time` | Seconds of talk time after announcement and beep |
| `intercom/voice_announcement` | `on` or `off` |
| `intercom/ringback` | `default` or `file` (`file` = MOH class `intercom`) |
| `intercom/announcement` | Path of the active announcement without extension, or empty |

`extensions.conf` (extension 102 is the tablet the door station calls):

```ini
[globals]
RINGTIME=20                              ; fallback if the astdb is empty

[default]
exten => 102,1,Ringing()
 same => n,Answer()
 same => n,Set(CHANNEL(tonezone)=de)
 same => n,Set(RT=${DB(intercom/ring_duration)})
 same => n,ExecIf($["${RT}" = ""]?Set(RT=${RINGTIME}))
 same => n,GotoIf($["${DB(intercom/ringback)}" = "file"]?file)
 same => n,Dial(${PJSIP_DIAL_CONTACTS(102)},${RT},r)
 same => n,Goto(end)
 same => n(file),Dial(${PJSIP_DIAL_CONTACTS(102)},${RT},m(intercom))
 same => n(end),GotoIf($["${DIALSTATUS}" = "ANSWER"]?done)
 same => n,GotoIf($["${DB(intercom/voice_announcement)}" = "on"]?announcement)
 same => n,Playtones(425/480,0/480)
 same => n,Wait(3)
 same => n,Goto(done)
 ; answering machine: announcement (if set), beep, talk time with silence detection
 same => n(announcement),Set(ANNOUNCEMENT=${DB(intercom/announcement)})
 same => n,ExecIf($["${ANNOUNCEMENT}" != ""]?Playback(${ANNOUNCEMENT}))
 same => n,Playback(beep)
 same => n,Set(SZ=${DB(intercom/talk_time)})
 same => n,ExecIf($["${SZ}" = ""]?Set(SZ=30))
 same => n,WaitForNoise(1000,1,8)
 same => n,WaitForSilence(4000,1,${SZ})
 same => n,Playback(beep)
 same => n(done),Hangup()
```

`musiconhold.conf`:

```ini
[intercom]
mode=files
directory=/media/ha-intercom/ringback/active
```

Notes:

- **Answer first**: a Dahua VTO does not play early media (183). Therefore `Answer()` before `Dial`, so that the
  ringback tone (`r` or MOH class) and the announcement are audible at the door. Door stations that support early
  media can drop `Answer()` and set `inband_progress=yes` on the endpoint.
- **Door station endpoint**: plain RTP (no WebRTC, `media_encryption=no`), `ulaw` only. Comments after `allow=` in
  the add-on's template truncate the codec list.
- **State names**: recording stops when `sensor.<door station>_state` reports the idle state again (default
  `Not in use`) or the tablet answers (`In use`). Other names can be set in the options.
- The service `ha_intercom.asterisk_sync` rewrites all astdb values, e.g. after a restart of the add-on.

## Card

The integration ships the cards `intercom-card` and `intercom-settings-card` and registers them as a dashboard
resource on start (`/intercom_files/intercom-card.js`). If resources are managed in YAML, the URL is written to the
log and has to be added manually.

### `custom:intercom-card`

One view for the whole intercom: live image (small, with full screen including call buttons), the intercom with the
tabs Call, Contacts and Dial (through sip-core), front door, mailbox with playback inside the card, announcements
recorded with the device microphone, status chips and a gear to the settings. Best placed on a view of type "Panel";
the card then fills the screen without page scrolling, only the lists scroll. From 900 px width: live image at half
height on the left with the alarm panel next to it, below it the intercom with call area and separated controls,
the mailbox on the right; below that a single column.

Alarm panel and door lock come from the integration (step "House" or options); the keys `alarm` and `door` in the
card are only needed to deviate from that. The "Contacts" tab fills itself: every extension for which the Asterisk
integration keeps a state sensor appears with its reachability, except the device's own extension. A new endpoint
in Asterisk shows up after the add-on restart, once the Asterisk integration has created its sensors. Names are
given in Home Assistant on the device of the extension (Settings → Devices, e.g. rename "PJSIP/100" to "Daniel") or
through `contacts` in the card; without a name the door station and the tablet are called "Door station" and
"Tablet".

Minimal configuration:

```yaml
type: custom:intercom-card
camera:
  type: picture-entity
  entity: camera.doorbell
```

All keys:

```yaml
type: custom:intercom-card
name: Doorbell                 # title, default "Doorbell"
entry_id: ...                  # only needed with several Intercom entries
camera:                        # embedded camera card, any card configuration
  type: custom:advanced-camera-card
  cameras:
    - camera_entity: camera.doorbell
fullscreen_camera:             # optional separate card for full screen (e.g. HD stream), otherwise like camera
  type: custom:advanced-camera-card
  cameras:
    - camera_entity: camera.doorbell
      go2rtc:
        stream: doorbell_hd
fullscreen_on_ring: true       # open the live image in full screen automatically on a ring
fullscreen_auto_close: true    # close full screen after the ring/call (only when opened automatically)
door:                          # optional, default: door lock from the integration with confirmation
  entity: lock.front_door      # lock, cover, button, switch or script
  action: open                 # optional: service of the domain, default open (if supported) or unlock
  confirm: true                # ask before opening
  name: Front door
alarm:                         # optional, default: alarm panel from the integration
  entity: alarm_control_panel.alarmo
  name: Alarm
  modes: [armed_away, armed_home, disarmed]   # order of the buttons
  code: null                   # optional fixed code; without a code the card asks with a keypad
volume:                        # only needed when "volume" is listed under actions
  entity: input_number.tablet_volume
  mute_entity: input_boolean.tablet_mute
  name: Tablet
actions:                       # below the call area; default: door, mailbox, announcement
  - door                       # left: front door with open and lock/unlock (for lock entities)
  - mailbox                    # mailbox switch
  - announcement               # voice announcement switch, shows the active announcement
  - entity: light.outdoor      # any switch-like entity
    name: Outdoor light
    icon: bell
info:                          # extra rows in "Details" (default: new messages, last ring, announcement, ringback tone, ring duration)
  - entity: sensor.outdoor_temperature
    name: Outside
contacts:                      # optional: names, icons or hiding per extension; the list itself comes from Asterisk
  - name: Wall tablet
    extension: "102"
    icon: tablet               # tablet, doorbell, account, home or initial letter
    registered_entity: binary_sensor.102_registered   # optional, otherwise automatic
  - extension: "104"
    hide: true                 # do not show this extension
  - name: Office               # extension without a sensor of the Asterisk integration, listed anyway
    extension: "200"
status:                        # chips in the intercom header; default: door station and indoor station registered
  - entity: binary_sensor.103_registered
    name: Door station 103
settings:
  mode: popup                  # popup (settings card as dialog), navigate or none
  path: /house-settings/doorbell   # with navigate
  card: {}                     # extra configuration of the settings card in the popup
show:                          # switch off sections
  live: true
  call: true
  mailbox: true
  announcements: true
  status: true                 # chips door station/indoor station registered
  info: true                   # info column right of the call area
  header: false                # own header with title, chips and gear (default off, the gear sits in the intercom)
layout: fill                   # fill = screen height without page scrolling, auto = height by content
height_offset: 0               # extra bottom offset in px (with fill); the height is measured from the card position
padding: 12px 16px             # inner padding; panel views have no margin of their own
live_height: 48                # height of the live image in percent of the card height (with fill)
side_width: 220                # width of the card next to the live image in px
live_aspect: "16 / 9"          # aspect ratio of the small live image, also used in full screen (a Dahua doorbell stream of 800x480 is "5 / 3")
default_tab: call              # call, contacts or dial
language: en                   # de or en, default from the profile
```

The intercom uses `window.sipCore` of the sip-core integration. Without sip-core on the device the card shows
"Intercom not available here"; door, alarm, mailbox and announcements still work. Microphone and calls need a secure
context in the browser (https or localhost).

### `custom:intercom-settings-card`

A ready-made settings card with the groups Ringing (ring duration, ringback tone, indoor ringtone), Answering
machine (mailbox, voice announcement, active announcement, talk time, retention) and Status. More groups, e.g. the
sliders of the door station, can be appended. Sliders apply their value on release.

```yaml
type: custom:intercom-settings-card
title: Intercom settings
entry_id: ...                  # only with several entries
show_defaults: true            # groups of the integration
show_status: true
groups:
  - name: Door station
    rows:
      - entity: number.vto_speaker
        name: Speaker
        description: Volume at the door
      - entity: number.vto_microphone
        name: Microphone
  - name: Notifications
    rows:
      - entity: input_boolean.push_residents
        name: Push to residents
footer: Optional note
```

Rows are rendered by domain: `switch`/`input_boolean` as toggle, `number`/`input_number` as slider,
`select`/`input_select` as dropdown, everything else as a value.

### WebSocket commands

- `ha_intercom/info` – configuration of the entry, mapping of the entities, alarm panel and door lock, extensions
  of the Asterisk integration (`extensions: [{extension, name, state_entity, registered_entity}]`).

### Developing the card

Sources in `src/`, bundled with esbuild and Lit:

```bash
npm install
npm run build      # writes custom_components/ha_intercom/frontend/intercom-card.js
```

Local test instance: `.venv/bin/hass -c .test/config` (port 8124); `tests/seed.py` prints the login URL and seeds
the Asterisk states; `tests/smoke.py` runs onboarding, configuration dialog and a recording; `tests/flow.py` runs
the configuration dialog and the options dialog with the folder move. `tests/fake_asterisk` provides the service
`asterisk.send_action` there so the dialog passes without a real Asterisk integration.

## Third-party notices

The card bundle ships two libraries: [Lit](https://lit.dev) (BSD 3-Clause License, Google LLC) and icon paths from
[Material Design Icons](https://github.com/Templarian/MaterialDesign-SVG) (Apache License 2.0, Pictogrammers). The
license texts are in [`custom_components/ha_intercom/frontend/LICENSES.md`](custom_components/ha_intercom/frontend/LICENSES.md).
Everything else this integration talks to (Asterisk, the TECH7Fox add-on and integrations, sip-core, go2rtc, camera
cards) is installed separately, is only used through its public interfaces and stays under its own license.

## Disclaimer

This is a private project, provided as is and without any warranty, as stated in the MIT License. It writes to the
Asterisk database, moves files in the media folder you configure and requires changes to your Asterisk dialplan.
Test it on a non-critical setup first, keep backups of your Home Assistant and Asterisk configuration, and use it at
your own risk. The author is not liable for any damage to your installation.

## License

[MIT](LICENSE)
