# Intercom für Home Assistant

Türsprechanlage mit Mailbox, Sprachansagen, Freizeichen und Klingeldauer als eine Integration plus Karte.
Gebaut für eine Dahua-VTO an der Asterisk-App (TECH7Fox) mit sip-core im Browser, über den
Konfigurationsdialog auf andere Türstationen übertragbar.

## Voraussetzungen

| Was | Wozu | Pflicht |
|---|---|---|
| **Asterisk-App** (Add-on von TECH7Fox, Home Assistant OS oder Supervised) | Telefonanlage; Freizeichen-Dateien werden über `moh reload` in der App nachgeladen | ja |
| **Asterisk-Integration** (TECH7Fox, HACS) | AMI-Zugang: Klingeldauer, Sprechzeit, Ansage und Freizeichen landen per `DBPut` in der Asterisk-Datenbank; Zustandssensoren der Nebenstellen (`sensor.<nebenstelle>_state`, `binary_sensor.<nebenstelle>_registered`, `binary_sensor.ami_connected`) | ja |
| **sip-core** (TECH7Fox, HACS) | Telefon im Browser (`window.sipCore`) für Anruf, Annehmen, Auflegen, Wählen in der Karte | für den Anrufteil |
| **go2rtc-Stream** der Türstation (RTSP) | Aufnahme der Clips; bei Dahua-VTO am besten der HD-Stream | ja |
| **ffmpeg** | Aufnahme und Konvertierung; in Home Assistant OS enthalten | ja |
| Kamera-Entität der Türstation | Standbild als Vorschaubild | nein |
| Entität, die das Klingeln meldet | Auslöser (z. B. `sensor.vto_tuerklingel` → `Doorbell Ring`) | ja |
| Alarmzentrale (`alarm_control_panel`), Türschloss (`lock`) | Bedienung in der Karte | nein |

Der Konfigurationsdialog erkennt App, Integration und sip-core selbst, liest die Nebenstellen aus sip-core und der
Asterisk-Integration und prüft am Ende ffmpeg, Stream, Basisordner und AMI-Verbindung. Ohne Supervisor
(Container-Installation) fehlt die App; das Nachladen der Freizeichen ist dann nicht möglich, der Rest läuft.

## Einrichtung

1. Ordner `custom_components/ha_intercom` nach `/config/custom_components/` kopieren oder in HACS
   `https://github.com/Dronedale/ha-intercom` als benutzerdefiniertes Repository vom Typ „Integration“ eintragen und
   installieren, danach Home Assistant neu starten.
2. Einstellungen → Integrationen → „Intercom“ hinzufügen. Der Dialog führt durch:
   - **Voraussetzungen**: zeigt, was gefunden wurde (App, Integration, sip-core mit Nebenstellen). Fehlt App oder
     Integration, bricht der Dialog ab.
   - **Quellen**: Klingel-Auslöser und Zustand, Kamera für das Standbild, RTSP-Stream für die Aufnahme.
   - **Sprechanlage**: Nebenstellen von Türstation und Tablet aus der Liste, Asterisk-App. Die Zustandssensoren
     werden daraus abgeleitet; nur wenn sie fehlen, fragt ein Zwischenschritt danach.
   - **Haus**: Alarmzentrale und Türschloss (optional, die Karte übernimmt beides automatisch), Basisordner
     (Vorgabe `/media/ha-intercom`).
   - **Prüfung**: ffmpeg, Stream (ffprobe mit 8 s Zeitlimit), Basisordner beschreibbar, AMI verbunden. ffmpeg und
     Ordner sind Pflicht, ein Stream-Fehler lässt sich bewusst übergehen.
3. Asterisk nach dem Abschnitt „Asterisk einrichten“ anpassen (Wählplan, MOH-Klasse).
4. Karte auf ein Dashboard setzen, siehe „Karte“.

Alles aus dem Dialog außer den Quellen lässt sich später in den Optionen der Integration ändern (Stream, App,
Alarmzentrale, Türschloss, Basisordner, Höchstdauer, Standbild-Verzögerung, Zustandsnamen). Nach jeder Änderung lädt
sich die Integration neu und liest die Ordner ein. Wechselt der Basisordner, bietet ein zweiter Schritt an, die
vorhandenen Nachrichten, Ansagen und Freizeichen in den neuen Ordner zu verschieben.

## Was die Integration macht

- Erkennt ein Klingeln an einem Entitätszustand (z. B. `sensor.vto_tuerklingel` → `Doorbell Ring`).
- Nimmt bei eingeschalteter Mailbox jedes Klingeln als Clip auf: ffmpeg zieht den RTSP-Stream von go2rtc,
  kopiert das Video und wandelt den Ton nach AAC. Standbild von der Kamera-Entität als Vorschaubild.
- Beendet die Aufnahme, wenn die Türstation wieder im Ruhezustand ist, spätestens nach der Höchstdauer.
- Pflegt die Mailbox (Liste, gesehen-Markierung, Löschen, nächtliches Aufräumen).
- Verwaltet Ansagen (Aufnahme aus der Karte per Upload, MP3-Ablage, Umbenennen, Löschen, aktive Ansage)
  und Freizeichen-Dateien (MP3-Ablage, Konvertierung, Auswahl, MOH-Klasse).
- Schreibt Klingeldauer, Sprechzeit, Sprachansage, Freizeichen und aktive Ansage per AMI `DBPut`
  in die Asterisk-Datenbank (Familie `intercom`), beim Start, bei jeder Änderung und wenn AMI wieder verbunden ist.
- Liefert der Karte die Nebenstellen der Asterisk-Integration als Kontaktliste, samt Zustands- und
  Registrierungssensor und dem in Home Assistant vergebenen Gerätenamen.
- Liefert Clips, Bilder und Ansagen über geschützte Endpunkte aus (`/api/ha_intercom/media/...`).

## Entitäten (Gerät „Intercom Haustür“)

| Entität | Zweck |
|---|---|
| `switch.intercom_haustur_mailbox` | Jedes Klingeln aufzeichnen |
| `switch.intercom_haustur_sprachansage` | Ansage und Sprechzeit nach dem Timeout statt Besetztton |
| `number.intercom_haustur_klingeldauer` | 5 bis 60 s |
| `number.intercom_haustur_sprechzeit_nach_der_ansage` | 10 bis 60 s |
| `number.intercom_haustur_aufbewahrung` | Tage bis zum Aufräumen |
| `select.intercom_haustur_freizeichen` | Standard oder Datei |
| `select.intercom_haustur_ansage` | Keine oder Datei |
| `select.intercom_haustur_klingelton_innenstation` | Klingelton des Wandtablets aus `klingeltoene/`; Attribute `media_content_id` und `media_content_type` für `media_player.play_media` |
| `sensor.intercom_haustur_nachrichten` | Anzahl, Attribut `eintraege` |
| `sensor.intercom_haustur_neue_nachrichten` | Anzahl ungesehen |
| `sensor.intercom_haustur_ansagen` | Anzahl, Attribut `liste` |
| `sensor.intercom_haustur_freizeichen_dateien` | Anzahl, Attribut `liste` |
| `sensor.intercom_haustur_letztes_klingeln` | Zeitstempel |
| `binary_sensor.intercom_haustur_aufnahme` | Aufnahme läuft |
| `binary_sensor.intercom_haustur_turstation_im_anruf` | Türstation nicht im Ruhezustand |
| `event.intercom_haustur_klingel` | Ereignisse `ring`, `angenommen`, `aufgezeichnet`, `nachricht` |

Die genauen Entitäts-IDs vergibt Home Assistant beim Anlegen; die Namen sind deutsch.

## Dienste

`ha_intercom.nachricht_loeschen`, `ha_intercom.nachricht_gesehen`, `ha_intercom.alle_gesehen`,
`ha_intercom.ansage_aktivieren`, `ha_intercom.ansage_loeschen`, `ha_intercom.ansage_umbenennen`,
`ha_intercom.aufnahme_starten`, `ha_intercom.aufnahme_stoppen`, `ha_intercom.index_neu`, `ha_intercom.asterisk_sync`.

## Ordner

Unter dem Basisordner (Vorgabe `/media/ha-intercom`, in den Optionen änderbar):

- `mailbox/` – `<kennung>.mp4`, `<kennung>.jpg`, `<kennung>.json`
- `ansage/` – `<name>.wav` (8 kHz, mono) plus `<name>.json`; abgelegte MP3s werden konvertiert
- `freizeichen/` – Quelldateien; `freizeichen/konvertiert/` die WAVs; `freizeichen/aktiv/` die gewählte Datei für die MOH-Klasse
- `klingeltoene/` – Klingeltöne der Innenstation (MP3 und andere Audiodateien, werden unverändert abgespielt)

Die Asterisk-App muss denselben Pfad sehen; `/media` ist in Home Assistant OS für Apps mit Medienzugriff
eingebunden.

## Klingelton der Innenstation

Die Integration klingelt das Tablet nicht selbst; das macht eine eigene Automation beim Klingeln. Damit sich der
Ton ohne Änderung der Automation wechseln lässt, gibt es die Auswahl `select.intercom_haustur_klingelton_innenstation`
(auch in der Einstellungskarte unter „Klingeln“). Sie listet die Dateien in `klingeltoene/` und trägt als Attribute die
Medienquelle des gewählten Tons. In der Automation:

```yaml
action: media_player.play_media
target:
  entity_id: media_player.wandtablet
data:
  media_content_id: "{{ state_attr('select.intercom_haustur_klingelton_innenstation', 'media_content_id') }}"
  media_content_type: "{{ state_attr('select.intercom_haustur_klingelton_innenstation', 'media_content_type') }}"
```

Fehlt die gewählte Datei, fällt die Auswahl auf die erste Datei im Ordner zurück.

## Asterisk einrichten (Empfehlung)

Die Integration liefert keinen Wählplan mit. Der folgende Ausschnitt ist die erprobte Vorlage für die
Asterisk-App (Dateien im Custom-Verzeichnis der App); Nebenstellen und Kontext an das eigene System anpassen.

Die Integration schreibt per AMI `DBPut` in die astdb-Familie `intercom`:

| Schlüssel | Inhalt |
|---|---|
| `intercom/klingeldauer` | Sekunden, die das Tablet klingelt |
| `intercom/sprechzeit` | Sekunden Sprechzeit nach Ansage und Piepton |
| `intercom/sprachansage` | `on` oder `off` |
| `intercom/freizeichen` | `standard` oder `datei` (`datei` = MOH-Klasse `intercom`) |
| `intercom/ansage` | Pfad der aktiven Ansage ohne Endung, oder leer |

`extensions.conf` (Nebenstelle 102 ist das Tablet, das die Türstation anruft):

```ini
[globals]
RINGTIME=20                              ; Rückfall, falls astdb leer ist

[default]
exten => 102,1,Ringing()
 same => n,Answer()
 same => n,Set(CHANNEL(tonezone)=de)
 same => n,Set(RT=${DB(intercom/klingeldauer)})
 same => n,ExecIf($["${RT}" = ""]?Set(RT=${RINGTIME}))
 same => n,GotoIf($["${DB(intercom/freizeichen)}" = "datei"]?datei)
 same => n,Dial(${PJSIP_DIAL_CONTACTS(102)},${RT},r)
 same => n,Goto(ende)
 same => n(datei),Dial(${PJSIP_DIAL_CONTACTS(102)},${RT},m(intercom))
 same => n(ende),GotoIf($["${DIALSTATUS}" = "ANSWER"]?done)
 same => n,GotoIf($["${DB(intercom/sprachansage)}" = "on"]?ansage)
 same => n,Playtones(425/480,0/480)
 same => n,Wait(3)
 same => n,Goto(done)
 ; Anrufbeantworter: Ansage (falls gesetzt), Piepton, Sprechzeit mit Stille-Erkennung
 same => n(ansage),Set(ANSAGE=${DB(intercom/ansage)})
 same => n,ExecIf($["${ANSAGE}" != ""]?Playback(${ANSAGE}))
 same => n,Playback(beep)
 same => n,Set(SZ=${DB(intercom/sprechzeit)})
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
directory=/media/ha-intercom/freizeichen/aktiv
```

Hinweise:

- **Answer zuerst**: Eine Dahua-VTO spielt kein Early Media (183). Deshalb `Answer()` vor dem `Dial`, damit
  Freizeichen (`r` oder MOH-Klasse) und Ansage an der Tür hörbar sind. Türstationen, die Early Media beherrschen,
  können das `Answer()` weglassen und `inband_progress=yes` am Endpoint setzen.
- **Endpoint der Türstation**: Klartext-RTP (kein WebRTC, `media_encryption=no`), nur `ulaw`. Kommentare hinter
  `allow=` in der Vorlage der App schneiden die Codec-Liste ab.
- **Zustandsnamen**: Die Aufnahme endet, wenn `sensor.<türstation>_state` wieder den Ruhezustand meldet (Vorgabe
  `Not in use`) oder das Tablet abnimmt (`In use`). Andere Namen lassen sich in den Optionen setzen.
- Der Dienst `ha_intercom.asterisk_sync` schreibt alle astdb-Werte erneut, etwa nach einem Neustart der App.

## Karte

Die Integration liefert die Karten `intercom-card` und `intercom-settings-card` gleich mit und trägt sie beim Start
selbst als Dashboard-Ressource ein (`/intercom_files/intercom-card.js`). Werden die Ressourcen per YAML verwaltet,
steht die URL im Protokoll und muss von Hand eingetragen werden.

### `custom:intercom-card`

Eine Ansicht für die Sprechanlage: Livebild (klein, mit Vollbild samt Anrufknöpfen), Sprechanlage mit den Reitern
Anruf, Kontakte und Wählen (über sip-core), Haustür, Mailbox mit Wiedergabe in der Karte, Ansagen mit
Aufnahme über das Mikrofon des Geräts, Statuschips und Zahnrad zu den Einstellungen. Am besten auf einer Ansicht vom
Typ „Panel“, dann füllt die Karte den Bildschirm ohne Seitenscrollen; nur die Listen scrollen. Ab 900 px Breite: links
Livebild auf halber Höhe mit der Alarmanlage daneben, darunter die Sprechanlage mit Anrufbereich und abgetrennter
Steuerung, rechts die Mailbox; darunter eine Spalte.

Alarmzentrale und Türschloss kommen aus der Integration (Schritt „Haus“ bzw. Optionen); die Schlüssel `alarm` und
`door` in der Karte sind nur nötig, um davon abzuweichen. Der Reiter „Kontakte“ füllt sich von selbst: Jede
Nebenstelle, für die die Asterisk-Integration einen Zustandssensor führt, erscheint mit Erreichbarkeit, die eigene
Nebenstelle des Geräts ausgenommen. Ein neuer Endpoint in Asterisk taucht nach dem Neustart der App auf, sobald die
Asterisk-Integration seine Sensoren angelegt hat. Namen vergibt man in Home Assistant am Gerät der Nebenstelle
(Einstellungen → Geräte, z. B. „PJSIP/100“ in „Daniel“ umbenennen) oder über `contacts` in der Karte; Türstation und
Tablet heißen ohne Angabe „Türstation“ und „Tablet“.

Minimal reicht:

```yaml
type: custom:intercom-card
camera:
  type: picture-entity
  entity: camera.doorbell
```

Alle Schlüssel:

```yaml
type: custom:intercom-card
name: Doorbell                 # Überschrift, Standard „Doorbell“
entry_id: ...                  # nur bei mehreren Intercom-Einträgen nötig
camera:                        # eingebettete Kamerakarte, beliebige Kartenkonfiguration
  type: custom:advanced-camera-card
  cameras:
    - camera_entity: camera.doorbell
fullscreen_camera:             # optional eigene Karte für das Vollbild (z. B. HD-Stream), sonst wie camera
  type: custom:advanced-camera-card
  cameras:
    - camera_entity: camera.doorbell
      go2rtc:
        stream: doorbell_hd
fullscreen_on_ring: true       # Livebild beim Klingeln automatisch als Vollbild öffnen
fullscreen_auto_close: true    # Vollbild nach dem Klingeln/Gespräch wieder schließen (nur wenn automatisch geöffnet)
door:                          # optional, Standard: Türschloss aus der Integration mit Rückfrage
  entity: lock.haustuer       # Schloss, Cover, Button, Schalter oder Skript
  action: open                 # optional: Dienst der Domäne, Standard open (falls unterstützt) bzw. unlock
  confirm: true                # Rückfrage vor dem Öffnen
  name: Haustür
alarm:                         # optional, Standard: Alarmzentrale aus der Integration
  entity: alarm_control_panel.alarmo
  name: Alarmanlage
  modes: [armed_away, armed_home, disarmed]   # Reihenfolge der Knöpfe
  code: null                   # optional fester Code; ohne Code fragt die Karte per Tastenfeld
volume:                        # nur nötig, wenn „volume“ unter actions steht
  entity: input_number.tablet_lautstarke
  mute_entity: input_boolean.tablet_stumm
  name: Tablet
actions:                       # unter dem Anrufbereich; Standard: door, mailbox, announcement
  - door                       # links: Haustür mit Öffnen und Abschließen/Aufschließen (bei lock-Entitäten)
  - mailbox                    # Schalter Mailbox
  - announcement               # Schalter Sprachansage, zeigt die aktive Ansage
  - entity: light.aussenlicht  # beliebige Schalter-Entität
    name: Außenlicht
    icon: bell
info:                          # zusätzliche Zeilen in „Details“ (Standard: neue Nachrichten, letztes Klingeln, Sprachansage, Freizeichen, Klingeldauer)
  - entity: sensor.aussentemperatur
    name: Außen
contacts:                      # optional: Namen, Symbole oder Ausblenden je Nebenstelle; die Liste selbst kommt aus Asterisk
  - name: Wandtablet
    extension: "102"
    icon: tablet               # tablet, doorbell, account, home oder Initiale
    registered_entity: binary_sensor.102_registered   # optional, sonst automatisch
  - extension: "104"
    hide: true                 # Nebenstelle nicht anzeigen
  - name: Büro                 # Nebenstelle ohne Sensor der Asterisk-Integration, wird trotzdem gelistet
    extension: "200"
status:                        # Chips im Kopf der Sprechanlage; Standard: Außenstation und Innenstation registriert
  - entity: binary_sensor.103_registered
    name: Türstation 103
settings:
  mode: popup                  # popup (Einstellungskarte als Dialog), navigate oder none
  path: /haus-einstellungen/tuerklingel   # bei navigate
  card: {}                     # zusätzliche Konfiguration der Einstellungskarte im Popup
show:                          # Bereiche abschalten
  live: true
  call: true
  mailbox: true
  announcements: true
  status: true                 # Chips Außen-/Innenstation registriert
  info: true                   # Infospalte rechts vom Anrufbereich
  header: false                # eigene Kopfzeile mit Titel, Chips und Zahnrad (Standard aus, Zahnrad sitzt in der Sprechanlage)
layout: fill                   # fill = Bildschirmhöhe ohne Seitenscrollen, auto = Höhe nach Inhalt
height_offset: 0               # zusätzlicher Abzug in px unten (bei fill); die Höhe wird aus der Kartenposition gemessen
padding: 12px 16px             # Innenabstand; in Panel-Ansichten hat HA selbst keinen Rand
live_height: 48                # Höhe des Livebilds in Prozent der Kartenhöhe (bei fill)
side_width: 220                # Breite der Karte neben dem Livebild in px
live_aspect: "16 / 9"          # Seitenverhältnis des kleinen Livebilds, gilt auch im Vollbild (Stream doorbell ist 800x480, also "5 / 3")
default_tab: anruf             # anruf, kontakte oder waehlen
language: de                   # de oder en, Standard aus dem Profil
```

Die Sprechanlage nutzt `window.sipCore` der sip-core-Integration. Ohne sip-core auf dem Gerät zeigt die Karte
„Sprechanlage hier nicht verfügbar“, Tür, Alarm, Mailbox und Ansagen funktionieren trotzdem. Für Mikrofon und
Anrufe braucht der Browser eine sichere Verbindung (https oder localhost).

### `custom:intercom-settings-card`

Fertige Einstellungskarte mit den Gruppen Klingeln (Klingeldauer, Freizeichen), Anrufbeantworter (Mailbox,
Sprachansage, aktive Ansage, Sprechzeit, Aufbewahrung) und Status. Weitere Gruppen, etwa die Regler der Türstation,
lassen sich anhängen. Regler übernehmen den Wert erst beim Loslassen.

```yaml
type: custom:intercom-settings-card
title: Intercom Einstellungen
entry_id: ...                  # nur bei mehreren Einträgen
show_defaults: true            # Gruppen der Integration
show_status: true
groups:
  - name: Türstation
    rows:
      - entity: number.vto_lautsprecher
        name: Lautsprecher
        description: Lautstärke an der Tür
      - entity: number.vto_mikrofon
        name: Mikrofon
  - name: Benachrichtigungen
    rows:
      - entity: input_boolean.push_bewohner
        name: Push an Bewohner
footer: Optionaler Hinweistext
```

Zeilen werden nach Domäne dargestellt: `switch`/`input_boolean` als Schalter, `number`/`input_number` als Regler,
`select`/`input_select` als Auswahl, alles andere als Wert.

### WebSocket-Befehle

- `ha_intercom/info` – Konfiguration des Eintrags, Zuordnung der Entitäten, Alarmzentrale und Türschloss, Nebenstellen
  der Asterisk-Integration (`extensions: [{extension, name, state_entity, registered_entity}]`).

### Entwicklung der Karte

Quelltext in `src/`, Bündelung mit esbuild und Lit:

```bash
npm install
npm run build      # schreibt custom_components/ha_intercom/frontend/intercom-card.js
```

Lokale Testinstanz: `.venv/bin/hass -c .test/config` (Port 8124), `tests/seed.py` liefert die Anmelde-URL und
setzt die Asterisk-Zustände nach; `tests/smoke.py` fährt Onboarding, Konfigurationsdialog und Aufnahme durch.
`tests/fake_asterisk` stellt dort den Dienst `asterisk.send_action` bereit, damit der Dialog ohne echte
Asterisk-Integration durchläuft.

## Verwendete Projekte

Die Integration baut auf diesen Projekten auf und wäre ohne sie nicht möglich:

- [Asterisk-App für Home Assistant](https://github.com/TECH7Fox/asterisk-hass-addons) von TECH7Fox – die Telefonanlage
- [Asterisk-Integration](https://github.com/TECH7Fox/Asterisk-integration) von TECH7Fox – AMI-Zugang und Zustandssensoren der Nebenstellen
- [sip-core](https://github.com/TECH7Fox/sipcore-hass-integration) von TECH7Fox – das Telefon im Browser (`window.sipCore`)
- [go2rtc](https://github.com/AlexxIT/go2rtc) von AlexxIT – RTSP-Stream der Türstation für die Aufnahme
- [Advanced Camera Card](https://github.com/dermotduffy/advanced-camera-card) von Dermot Duffy – Livebild in den Beispielen
- [Dahua VTO](https://github.com/myhomeiot/DahuaVTO) von myhomeiot – Klingel-Ereignisse und Regler der Dahua-Türstation
- [Dahua VTO Custom Ringbacks Tutorial](https://github.com/thewolfman56/Dahua-VTO-Custom-Ringbacks-Tutorial) – Vorbild für den Wählplan mit Answer vor dem Klingeln
- [Lit](https://lit.dev), [esbuild](https://esbuild.github.io) und [Material Design Icons](https://github.com/Templarian/MaterialDesign-SVG) für die Karte

Asterisk selbst ist ein Projekt von [Sangoma](https://www.asterisk.org).

## Lizenz

[MIT](LICENSE)
