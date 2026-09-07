# Intercom für Home Assistant – Design v0.1 (06.09.2026)

## 1. Ziel

Eine Integration plus eine Karte, die Türsprechanlage, Mailbox, Sprachansagen, Freizeichen und Klingeldauer als ein Produkt abbilden. Konfigurierbar über den HA-Dialog, übertragbar auf andere Systeme, mit möglichst wenigen hausspezifischen Automationen.

## 2. Ausgangslage (gemessen)

- Dahua VTO (Nebenstelle 103) ruft das Wandtablet (102) über die Asterisk-App. Wählplan nimmt sofort an, klingelt das Tablet, Freizeichen läuft im Gespräch. Werte kommen aus astdb.
- sip-core liefert im Browser `window.sipCore` (Annehmen, Anrufen, Zustand).
- go2rtc auf dem Frigate-Rechner liefert `doorbell_hd` als H264 plus PCMU. Das Mikrofon der VTO ist während des Gesprächs im Stream aktiv, mit Stilleunterdrückung in Pausen. Ein Clip mit Bild und Ton reicht als Nachricht.
- HA: dahua_vto-Integration (Klingel-Ereignisse), Asterisk-Integration (Dienst `asterisk.send_action`, Zustandssensoren 102/103), `camera.doorbell`, ffmpeg im HA-Kern.

## 3. Abgrenzung

| Teil | Zuständig für |
|---|---|
| Integration `intercom` | Aufnahme, Standbild, Index, Aufräumen, Ansagen, Freizeichen-Dateien, Einstellungen nach astdb, geschützte Medienauslieferung, Ereignisse, Dienste |
| Karte `intercom-card` | Sprechanlagen-Seite: Livebild, Anruf, Tür, Lautstärke, Mailbox, Ansagen, Status |
| Asterisk | Wählplan für Tablet-Nebenstelle und Ansage-Nebenstelle, aus mitgelieferter Vorlage |
| Automationen | Hausspezifisch: Tablet-Ton, Ansicht wechseln, Push, Fingerabdruck. Sie hören auf das Ereignis der Integration |

## 4. Konfigurationsdialog

**Schritt 1, Quellen**
- Klingel-Auslöser: Entität und Zielzustand (Vorgabe `sensor.vto_tuerklingel` → `Doorbell Ring`)
- Kamera für Standbild: `camera.doorbell`
- Stream für Aufnahme: RTSP-URL (Vorgabe `rtsp://127.0.0.1:8554/doorbell_hd`)

**Schritt 2, SIP**
- Nebenstelle Türstation (103), Nebenstelle Tablet (102), Ansage-Nebenstelle (900)
- Zustandssensor Türstation (`sensor.103_state`), Zustandssensor Tablet (`sensor.102_state`)
- Slug der Asterisk-App für Stdin-Befehle (`3e533915_asterisk`), optional
- AMI: über den vorhandenen Dienst `asterisk.send_action`

**Schritt 3, Speicher**
- Basisordner (Vorgabe `/media/doorbell`), darunter `mailbox`, `ansage`, `freizeichen`

**Optionen**
- Höchstdauer eines Clips als Sicherheitsgrenze (Vorgabe 120 s)
- Zeitpunkt des Standbilds (Vorgabe: sofort beim Klingeln)

## 5. Entitäten, Gerät "Intercom Haustür"

| Entität | Zweck |
|---|---|
| `switch.intercom_mailbox` | Jedes Klingeln aufzeichnen |
| `switch.intercom_sprachansage` | Ansage und Sprechzeit nach dem Timeout, sonst Besetztton |
| `number.intercom_klingeldauer` | 5 bis 60 s |
| `number.intercom_sprechzeit` | 10 bis 60 s, endet früher bei Stille |
| `number.intercom_aufbewahrung` | Tage, danach Aufräumen |
| `select.intercom_freizeichen` | Standard oder Datei aus `freizeichen` |
| `select.intercom_ansage` | Keine oder Datei aus `ansage` |
| `sensor.intercom_nachrichten` | Anzahl, Attribut: Liste mit Kennung, Zeit, Dauer, gesehen |
| `sensor.intercom_neue_nachrichten` | Anzahl ungesehen |
| `binary_sensor.intercom_aufnahme` | Aufnahme läuft |
| `event.intercom_klingel` | Typen: klingeln, angenommen, aufgezeichnet |

Die vorhandenen Helfer `input_number.turklingel_klingeldauer`, `input_select.turklingel_freizeichen`, `number.vto_lautsprecher` und `number.vto_mikrofon` bleiben zunächst; die ersten beiden werden nach der Migration durch die Integrationsentitäten ersetzt, die VTO-Regler bleiben, weil sie zum Gerät gehören.

## 6. Dienste

- `ha_intercom.nachricht_loeschen` (kennung), `ha_intercom.nachricht_gesehen` (kennung), `ha_intercom.alle_gesehen`
- `ha_intercom.ansage_aktivieren` (name), `ha_intercom.ansage_loeschen` (name)
- Ansage aufnehmen: direkt in der Karte über das Mikrofon des Geräts (MediaRecorder im Browser oder in der App). "Aufnehmen" startet, "Stopp" beendet, die Karte lädt die Aufnahme an den Endpunkt `/api/ha_intercom/ansage/upload` hoch, die Integration wandelt sie mit ffmpeg nach 8 kHz WAV, legt sie mit Zeitstempel in `ansage` ab, und sie erscheint sofort in der Liste mit Namensfeld, Anhören, aktiv setzen und Löschen. Voraussetzungen: HTTPS (vorhanden) und Mikrofonfreigabe je Gerät, im Fully Kiosk Browser die Option Mikrofonzugriff. Die Ansage-Nebenstelle 900 per SIP bleibt eine optionale Ergänzung, nicht Teil von Phase 1.
- `ha_intercom.ansage_umbenennen` (name, neuer_name)
- `ha_intercom.aufnahme_starten` / `ha_intercom.aufnahme_stoppen` für Tests
- `ha_intercom.index_neu`

## 7. Ablauf beim Klingeln

1. Auslöser feuert. Kennung = Zeitstempel `JJJJ-MM-TT_HH-MM-SS`. Ereignis `klingeln`.
2. Mailbox an: Standbild über die Kamera-Entität nach `mailbox/<kennung>.jpg`. ffmpeg als Unterprozess: RTSP von go2rtc, Video kopieren, Ton nach AAC, Ausgabe `mailbox/<kennung>.mp4.part`, Höchstdauer als Grenze.
3. Tablet nimmt an: Ereignis `angenommen`. Der Clip läuft weiter bis zum Ende des Anrufs.
4. Türstation geht auf "Not in use": ffmpeg sauber beenden, Datei umbenennen, Dauer ermitteln, Index aktualisieren, Ereignis `aufgezeichnet` mit Kennung, Dauer und ob die Sprechzeit erreicht wurde.
5. Täglich: Dateien älter als Aufbewahrung löschen, Index aktualisieren.

## 8. Asterisk

**astdb, Familie `intercom`**: `klingeldauer`, `sprechzeit`, `sprachansage` (on/off), `freizeichen` (standard/datei), `ansage` (Pfad ohne Endung oder leer). Die Integration schreibt bei jeder Änderung, beim Start und wenn AMI wieder verbunden ist.

**Freizeichen**: MOH-Klasse `intercom` auf `freizeichen/aktiv`. Die Integration kopiert die gewählte Datei und löst `moh reload` per Stdin aus.

**Wählplan-Vorlage `intercom_dialplan.conf`**, mitgeliefert, drei Zeilen zum Einbinden:

- Tablet-Nebenstelle: Ringing, Answer, Tonzone, Klingeldauer aus astdb, Freizeichen-Zweig. Nach Timeout ohne Annahme: bei Sprachansage an `Playback(ansage)`, `Playback(beep)`, `WaitForNoise`, `WaitForSilence(sprechzeit)`, `Hangup`; sonst Besetztton wie heute.
- Ansage-Nebenstelle 900: `Playback(beep)`, `Record(ansage/ansage-<zeit>.wav)`, Kontrollwiedergabe, `Hangup`.

**Grenze**: Die VTO beendet verbundene Gespräche nach 120 s. Klingeldauer plus Ansage plus Sprechzeit muss darunter bleiben; die Integration prüft das und warnt. Optional hebt sie das VTO-Limit über die dahua_vto-Integration auf 300 s an.

## 9. Medienauslieferung

- Endpunkt `/api/ha_intercom/media/<typ>/<datei>` für clip, bild, ansage, freizeichen. Anmeldung erforderlich, Range-Unterstützung für Spulen im Video.
- Die Karte holt sich über die HA-Websocket-Funktion `auth/sign_path` kurzlebige signierte Links und setzt sie in `<video>` und `<audio>`. Kein `/local`, keine öffentlichen Dateien.

## 10. Karte

Eine Karte mit Bereichen, jeder abschaltbar:

- **Live**: bettet die konfigurierte Kamerakarte ein, etwa die vorhandene Advanced Camera Card, damit deren Funktionen bleiben.
- **Anruf**: Zustand aus `window.sipCore` (frei, klingelt, im Gespräch), Annehmen, Auflegen, Türstation anrufen. Die Sprechanlagen-Karte hat drei Reiter: **Anruf**, **Kontakte** (konfigurierte Nebenstellen mit Erreichbarkeit aus den Registrierungs-Sensoren und Anrufknopf) und **Wählen** (Ziffernblock). Option `fullscreen_on_ring`: Livebild beim Klingeln automatisch als Vollbild mit Anrufknöpfen öffnen.
- **Tür und Lautstärke**: Schloss-Entität, Lautstärke-Entität, Stumm.
- **Mailbox**: Liste mit Vorschaubild, Uhrzeit, Dauer, Punkt für ungesehen, Wiedergabe in der Zeile, Löschen mit Rückfrage, "Alle gesehen".
- **Ansagen**: Liste, Anhören, aktiv setzen, Löschen, "Ansage aufnehmen" mit Auswahl des Geräts.
- **Status**: Türstation und Tablet registriert, letztes Klingeln, Zahnrad zur Einstellungsseite.

Gestaltung über HA-Theme-Variablen, hell und dunkel, Sprache Deutsch und Englisch. Die Ansicht passt ohne Seitenscrollen auf den Bildschirm: Livebild klein mit "Vergrößern" als Vollbild samt Anrufknöpfen, nur die Nachrichtenliste scrollt, Ansagen starten eingeklappt.

**Zweite Karte `intercom-settings-card`**: eine fertige Einstellungskarte mit den Gruppen Klingeln (Klingeldauer, Freizeichen), Anrufbeantworter (Mailbox, Sprachansage, Sprechzeit, Aufbewahrung), Türstation (Lautsprecher, Mikrofon), Benachrichtigungen (konfigurierbare Schalter) und Status. Sie bindet die Entitäten der Integration, optional zusätzliche Entitäten wie die VTO-Regler. In der Hauptkarte ist einstellbar, was das Zahnrad tut: `settings: popup` öffnet diese Karte als Dialog, `settings: navigate` mit `settings_path` führt zu einer Ansicht, etwa `/haus-einstellungen/tuerklingel`.

## 11. Migration

Ersetzt werden: Automationen "Freizeichen-Dateien synchronisieren" und "Einstellungen an Asterisk übergeben", Skript und Shell-Befehle für den Freizeichen-Sync, die MOH-Klasse `tuerklingel` (wird `intercom`), die Voice-Recorder-Karte auf der Doorbell-Ansicht samt Widerruf ihres Tokens. Bleiben: "Türklingel: Klingeln" mit angepasstem Auslöser, "Haustür öffnen über Fingerabdruck", "Anruf am Wandtablet: Bildschirm an", VTO-Regler. Sicherungen vor jedem Schritt wie bisher.

## 12. Phasen

1. Integration: Dialog, Entitäten, astdb-Abgleich, Aufnahme, Index, Endpunkte, Dienste, Aufräumen. Test über Entitäten und Dienste.
2. Karte.
3. Doorbell-Ansicht neu aufbauen, alte Bausteine entfernen.
4. README, HACS-Struktur, Wählplan-Vorlage dokumentieren.

## 13. Offene Punkte zum Abnicken

1. Projektordner auf dem Mac, Vorschlag `~/Claude/ha-intercom`, Domain `intercom`.
2. Entitätsnamen deutsch, Bezeichner im Code englisch, Oberfläche zweisprachig.
3. Ansage aufnehmen per Originate auf ein wählbares Gerät, statt über den Browser.
4. SIP-Kontaktliste: auf die Einstellungsseite oder weg.
