# Turbo Type Racer

A desktop typing racer built with Electron. Its visual direction takes cues from printed rally route books and racing programs: warm paper, deep green, oxide red, clear hierarchy, and practical type. All typefaces use installed system fonts so the game works offline.

**Creator:** Dipayan Bhanja

## Features

- Start in fullscreen, with F11 to switch between fullscreen and a window.
- Race two AI drivers at Beginner, Normal, or Expert difficulty.
- Choose among 36 original passages across roads, nature, science, travel, everyday life, craft, and history.
- Hear an original, quiet ambient tone generated locally with Web Audio. Sound begins after your first click (to respect desktop audio activation rules), can be turned off from the top bar, and remembers your choice on this device.
- Play a friend directly over WebRTC using manual offer and answer exchange; no game server or account is required.
- Finish results wait for both human racers. The host also simulates and synchronizes the podium's ghost bot.
- Track personal race count, wins, best WPM, best accuracy, and selected difficulty on this device using browser local storage.

## Project structure

```text
turbo-type-racer/
├── .github/workflows/ci.yml  # Unit checks and Windows packaging artifact
├── .github/workflows/release.yml # Windows ZIP and GitHub Release publishing
├── app.js                    # UI, typing, AI, race and WebRTC coordination
├── audio-engine.js           # Locally generated ambient sound
├── game-core.js              # Pure gameplay calculations shared with tests
├── index.html                # Semantic interface and content security policy
├── main.js                   # Electron lifecycle and window controls
├── passages.js               # Original themed typing library
├── preload.js                # Narrow, context-isolated desktop API
├── styles.css                # Rally-program visual system and responsive layout
├── test/game-core.test.js    # Node built-in unit tests
├── package.json
└── package-lock.json
```

## Requirements and setup

- Node.js 22.12 or newer
- npm

Install dependencies and start the app:

```bash
npm ci
npm start
```

Run the gameplay unit tests:

```bash
npm test
```

Build the standalone 64-bit Windows app:

```bash
npm run package-win
```

The executable is `dist/TurboTypeRacer-win32-x64/TurboTypeRacer.exe`. On a version tag such as `v1.1.0`, GitHub Actions runs tests, packages the app, and uploads a ZIP containing the complete app folder to the GitHub Release. Extract the ZIP and launch `TurboTypeRacer.exe`; keep the other files alongside it.

## Controls

- Type the highlighted passage to move. An incorrect letter must be cleared with Backspace before continuing.
- Choose a passage collection before a solo race; each race selects a different passage from that collection when possible.
- Press Escape during a race or countdown to return to the main menu.
- Press F11 to toggle fullscreen.
- Toggle ambient sound from the top bar. The first click starts it when enabled.

## Multiplayer

The host generates an offer and sends it to the guest. The guest creates an answer and sends it back; the host pastes the answer and connects. Both players must choose the same STUN setting. Enable the public Google STUN option when playing across the internet; it is not required for many LAN connections.

WebRTC can reveal network connection details to the other peer. This app keeps Chromium's local-IP obfuscation enabled. LAN connectivity can depend on the browser's mDNS candidate support and network configuration. STUN helps with some NAT configurations but does not guarantee a connection through every firewall or symmetric NAT. The signaling offer and answer are not encrypted by this app before you share them, so exchange them privately with the intended player.

## Local records and privacy

Race count, wins, best WPM, best accuracy, selected difficulty, and sound preference are stored in this app's local browser storage on the current device. They are not uploaded or synchronized. Clearing the app's site data removes them.

## License

MIT. See [LICENSE](LICENSE).