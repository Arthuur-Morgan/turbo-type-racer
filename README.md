# Turbo Type Racer

Cyberpunk-themed desktop typing racer with AI opponents and peer-to-peer multiplayer, built with Electron.

**Creator:** Dipayan Bhanja

## Features

- Race two AI drivers at Beginner, Normal, or Expert difficulty. Their pace drifts and includes short speed bursts.
- Play a friend directly over WebRTC using manual offer and answer exchange; no game server or account is required.
- Finish results wait for both human racers. The host also simulates and synchronizes the podium's ghost bot.
- Track personal race count, wins, best WPM, best accuracy, and selected difficulty on this device using browser local storage.
- Use the frameless desktop window, F11 fullscreen, keyboard typing, and accessible focus/status cues.

## Project structure

```text
turbo-type-racer/
├── .github/workflows/ci.yml  # Unit checks and Windows packaging artifact
├── app.js                    # UI, typing, AI, race and WebRTC coordination
├── game-core.js              # Pure gameplay calculations shared with tests
├── index.html                # Semantic interface and content security policy
├── main.js                   # Electron lifecycle and window controls
├── preload.js                # Narrow, context-isolated desktop API
├── styles.css                # Game presentation and responsive accessibility
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

The output is `dist/TurboTypeRacer-win32-x64/TurboTypeRacer.exe`. GitHub Actions runs the tests and stores a Windows build artifact for 14 days on pushes, pull requests, and manual runs.

## Controls

- Type the highlighted passage to move. An incorrect letter must be cleared with Backspace before continuing.
- Press Escape during a race or countdown to return to the main menu.
- Press F11 to toggle fullscreen.

## Multiplayer

The host generates an offer and sends it to the guest. The guest creates an answer and sends it back; the host pastes the answer and connects. Both players must choose the same STUN setting. Enable the public Google STUN option when playing across the internet; it is not required for many LAN connections.

WebRTC can reveal network connection details to the other peer. This app keeps Chromium's local-IP obfuscation enabled. LAN connectivity can depend on the browser's mDNS candidate support and network configuration. STUN helps with some NAT configurations but does not guarantee a connection through every firewall or symmetric NAT. The signaling offer and answer are not encrypted by this app before you share them, so exchange them privately with the intended player.

## Local records and privacy

Race count, wins, best WPM, best accuracy, and difficulty are stored in this app's local browser storage on the current device. They are not uploaded or synchronized. Clearing the app's site data removes them.

## License

MIT. See [LICENSE](LICENSE).
