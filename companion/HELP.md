## Ross Video RossTalk

Controls Ross Video Carbonite/Graphite, Acuity/Vision, Ultrix and openGear devices over RossTalk.

In most cases, convenient dropdowns are provided for options. If you'd like to use variables, expressions, or custom values, refer to the [RossTalk reference manual](http://help.rossvideo.com/carbonite-device/Topics/Protocol/RossTalk/CNT/RT-CNT-Comm.html) for value structures.

This connection does not support Xpression; use the dedicated connection for Xpression instead.

### Configuration

- **Model**: selects which actions and presets are available.
- **Switcher Frame IP / Hostname** and **Port** (default 7788).
- **TCP Keep Alive**: when enabled, a single connection is kept open and the connection status is shown continuously. When disabled, a connection is opened for each button press; commands fired together share that connection, and the status reflects the most recent attempt.

### Actions

**All models**

- Trigger GPI
- Trigger GPI by Name (Only works on devices that accept named GPIs)
- Send a custom command

**Carbonite / Graphite**

- Fire custom control
- Load Set / Save Set (with an optional drive for Ultra 60), Export working set to USB
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
- Change multiviewer box (Video Processor or I/O MultiViewer, optionally the shifted box)

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

### Presets

Ready-made buttons are provided for GPIs, ME 1 transitions and crosspoints, keyers and Ultrix timers, depending on the selected model.

### Expressions

Any action field can be switched to an expression, and text fields accept variables. Numeric fields such as GPI, keyer and custom control numbers are number fields, so an expression can compute them.
