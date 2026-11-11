## Ross Video RossTalk

Controls Ross Video Carbonite/Graphite, Acuity/Vision, Ultrix, openGear (MDK-111A-M, MDK-111A-K, MC1-MK) and Ross Video Server (Mira, Tria, Kiva) devices over RossTalk.

In most cases, convenient dropdowns are provided for options. If you'd like to use variables, expressions, or custom values, refer to the [RossTalk Commands reference](<https://documentation.rossvideo.com/files/Manuals/Protocol%20Documents/RossTalk-Commands(4802DR-403).pdf>) for value structures.

This connection does not support Xpression; use the dedicated connection for Xpression instead.

### Configuration

- **Model**: selects which actions and presets are available.
- **Device IP / Hostname** and **Device Port** (default 7788).
- **TCP Keep Alive**: when enabled, a single connection is kept open and the connection status is shown continuously. When disabled, a connection is opened for each button press; commands fired together share that connection, and the status reflects the most recent attempt.

### Actions

**All models**

- Trigger GPI and Trigger GPI by Name (only works on devices that accept named GPIs); not available for video servers. On Graphite, use Trigger GPI by Name with a parameter of `HIGH` or `LOW` to trigger on a signal edge, e.g. name `08` and parameter `HIGH` sends `GPI 08:HIGH`.
- Send a custom command

**Carbonite / Graphite**

MEs are addressed as `ME:1`, `MME:1` (MiniME) or `MSC:1` (MultiScreen). Carbonite Ultra's program ME is `ME:P/P`, and HyperMax split-ME sides can be typed as `ME:1A`, `ME:1B`, `ME:1AB` or `ME:PPB`.

- Fire custom control
- Load Set / Save Set (with an optional drive for Ultra 60)
- Cut / Auto Transition
- Transition rate, Transition type, Next transition elements
- XPT (crosspoint)
- Transition Keyer (toggle, on air or off air; cut or auto)
- Key mode, Initialize chroma key
- Fade to black
- MEM (recall memory), Save memory
- Load / unload sequence (SEQI / SEQO), Sequencer next / up / down, Sequencer select event
- Clip player: load clip, and play / pause / eject / loop on / loop off
- Media-Store: load media
- Set source name (MNEM)
- Change multiviewer box, optionally the shifted box. The MultiViewer type defaults to None, which Carbonite Black 15.x needs (`MVBOX 1:5:IN:6`); choose VP, IO or OP if your switcher's `HELP` shows a type.

With TCP Keep Alive enabled, a NOOP is sent every 30 seconds to hold the connection open.

**Acuity / Vision**

MEs are addressed by number (e.g. `1`) for ME, keyer, transition and memory actions. Crosspoints use the `MLE:` prefix, which Vision requires and Acuity accepts.

- Set GPI output (on / off)
- Fire custom control
- Load Set / Save Set (USB or HD, with an optional setup number)
- Cut / Auto Transition
- Transition rate, Transition type, Next transition elements
- XPT (crosspoint)
- Transition Keyer (toggle, on air or off air; cut or auto), Shaped key
- Fade to black
- MEM (recall memory), Save memory
- Change multiviewer box
- Media-Store: load media and play (Global-Store, Global-Store Audio or ME-Store)
- Capture to Media-Store (Acuity only), Capture ME source (Ultrix Acuity only)
- Video server: play / pause / eject, cue clip
- Set source name (MNEM)
- User variable (set, add, subtract, multiply, divide)
- Set video mode and Reset switcher. Both interrupt the switcher's output, so use them with care.

**Ultrix**

- Fire salvo (sent as `GPI`)
- Ultrix Timer (run, pause, stop, end)
- Router crosspoint: selects a source on a destination for a user or panel ID, optionally on specific levels (e.g. `1,6,10-13`)

**openGear (MDK-111A-M, MDK-111A-K, MC1-MK)**

- Transition Keyer (cut or auto)
- Fade to black (not supported on the MDK-111A-K)
- Load logo: loads a media file from the CompactFlash card into a Logo channel
- Arm effect on preset, Take effect on / off air

**Ross Video Server (Mira, Tria, Kiva)**

Channels are addressed by letter (e.g. `A`). Clip names are relative to `H:\video\`; include the subdirectory for clips outside it (e.g. `\news\crime-report`). Timecodes are written as `hh,mm,ss,ff`, e.g. `00,00,15,00`.

- Cue clip, optionally at a timecode
- Play the loaded clip, or load and play a clip, optionally from a timecode
- Stop, Eject
- Go to timecode, Jog (in frames; negative jogs backwards)
- Loop mode (off, loop, loop to, ping-pong, ping-pong to)
- Camera angle, for ISO clips

### Presets

Ready-made buttons are provided for GPIs, ME 1 transitions and crosspoints, keyers, Ultrix timers and video server channels A to D, depending on the selected model.

### Expressions

Text fields accept variables, including local variables. Number, text and source fields can be switched to an expression, and so can the choices that buttons may want to change at runtime: keyer direction and transition type, transition type, on/off states, the Ultrix timer action and the video server loop mode. If an expression for one of those choices doesn't give one of its values (e.g. `PAUSE` for a timer), the action is skipped. Setup choices, such as load and save locations, capture mode and video mode, can't be expressions.
