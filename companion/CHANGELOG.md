# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0]

### Added

- Presets for GPIs (salvos on Ultrix), ME 1 transitions and crosspoints, keyers, and Ultrix timers, depending on the selected model.
- Carbonite / Graphite: save set and export the working set to USB, with an optional Ultra 60 drive on load and save set.
- Carbonite / Graphite: transition rate, transition type, and next transition elements.
- Carbonite / Graphite: key mode and initialize chroma key.
- Carbonite / Graphite: save memory, sequencer next / up / down, and sequencer select event.
- Carbonite / Graphite: clip player load, play, pause, eject, loop on, and loop off.
- Carbonite / Graphite: Media-Store load media, and set source name (MNEM).
- Carbonite / Graphite: a NOOP every 30 seconds while TCP Keep Alive is enabled, to hold an idle connection open.
- Acuity / Vision: set GPI output on or off.
- Acuity / Vision: save set to USB or HD, with an optional setup number.
- Acuity / Vision: transition rate, transition type, next transition elements, and shaped key.
- Acuity / Vision: save memory, and change multiviewer box.
- Acuity / Vision: Media-Store load and play (Global-Store, Global-Store Audio, or ME-Store).
- Acuity / Vision: capture to Media-Store, and capture an ME source on Ultrix Acuity.
- Acuity / Vision: video server play, pause, eject, and cue clip.
- Acuity / Vision: set source name (MNEM), and user variables (set, add, subtract, multiply, divide).
- Acuity / Vision: set video mode and reset the switcher. Both interrupt the switcher's output.
- Ultrix: router crosspoint, selecting a source on a destination for a user or panel ID, optionally on specific levels.
- openGear: load a logo from the CompactFlash card, arm an effect on preset, and take an effect on or off air.
- Any action field can be an expression, and text fields accept variables.

### Changed

- The host field accepts a hostname as well as an IP address, and the port is a number field. An existing text port is converted on upgrade.
- GPI, custom control, keyer, sequence, multiviewer, and timer fields are number fields. Values that used variables are converted to expressions.
- ME, destination, and source fields are dropdowns. Values that contained variables are converted to expressions.
- On Ultrix, the GPI action is labeled Fire salvo.
- Acuity / Vision crosspoints use the `MLE:` prefix, which Vision requires and Acuity accepts. Keyers are addressed by a bare ME number (for example `KEYAUTO 1:4`).
- Acuity / Vision keyer transitions can be sent on air, off air, or toggled.
- Carbonite multiviewer actions include a MultiViewer type (Video Processor or I/O) and an optional shifted box. Existing actions default to Video Processor.
- openGear key transitions address the card's single ME as `1`.
- With TCP Keep Alive disabled, commands fired together share one connection, and the status reads "Connects per command" until a command is sent. A missing host is reported as a bad configuration.

### Fixed

- Carbonite multiviewer commands include the MultiViewer type the switcher requires (`MVBOX VP:1:1:IN:5`).
- Existing Acuity keyer actions that were stored with an `ME:` or `MLE:` prefix are converted back to a bare ME number.
- GPI by name includes the parameter only when one is set.
- A one-shot connection stays open until its commands have been sent. Commands issued while it is still opening share that connection, and a command that fails to send is dropped so it cannot fire on a later reconnect.

[3.0.0]: https://github.com/bitfocus/companion-module-rossvideo-rosstalk/compare/v2.1.0...v3.0.0
