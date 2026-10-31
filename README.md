# Turbo Type Racer

Cyberpunk-themed desktop typing racing game featuring bot opponents and serverless WebRTC peer-to-peer multiplayer, developed in Electron.

**Creator:** Dipayan Bhanja

---

## Overview

Turbo Type Racer combines speed typing with arcade racing. Each keystroke propels your vehicle forward across a neon track, calculating your real-time WPM, accuracy, and position against AI drivers or friends over direct peer-to-peer connections.

---

## Features

- **Single Player Mode**:
  - Three opponent speed tiers:
    - Beginner: 30–45 WPM
    - Normal: 55–70 WPM
    - Expert: 85–105 WPM
  - Opponents feature natural drift, typing bursts, and variable pacing to simulate realistic human typing behavior.

- **Peer-to-Peer Multiplayer (WebRTC)**:
  - Direct browser-to-browser data channel communication using manual SDP offer and answer string exchange.
  - Ghost Bot fills the third lane at Normal speed to complete podium standings (1st, 2nd, and 3rd place). The host simulates this bot and synchronizes its coordinates with the guest.
  - Telemetry synchronization streaming position, current WPM, and accuracy every 100 ms over an ordered data channel.
  - Rematch flow that maintains the active connection across rounds.

- **Networking Modes**:
  - Local Area Network (LAN): Chromium WebRTC local IP obfuscation (`WebRtcHideLocalIpsWithMdns`) is disabled in the main process, allowing direct local network play without internet access.
  - Internet Play: Optional Google public STUN server (`stun:stun.l.google.com:19302`) configuration for NAT traversal across different networks.

- **User Interface & Controls**:
  - Custom frameless 1200x800 window with built-in minimize and close window controls.
  - Fullscreen toggle via F11.
  - Procedural inline SVG car graphics with responsive glow styling.
  - Real-time HTML5 canvas rendering for checkered finish line.
  - Race summary modal displaying final WPM, accuracy, and podium placements.

---

## Project Structure

```text
turbo-type-racer/
├── index.html        # UI, typing engine, SVG rendering, and WebRTC logic
├── main.js           # Electron lifecycle, frameless window, IPC handlers
├── package.json      # Project dependencies and build scripts
├── package-lock.json # Dependency lockfile
├── .gitignore        # Ignored files for version control
├── LICENSE           # MIT License
└── README.md         # Documentation
```

---

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (installed with Node.js)

---

## Installation

Install development dependencies:

```bash
npm install
```

---

## Running the Game

Start the development Electron window:

```bash
npm start
```

### Controls

- Type: Match the highlighted text displayed on screen.
- Backspace: Clear incorrect keystrokes.
- Escape: Exit race and return to the main menu.
- F11: Toggle fullscreen.

---

## Multiplayer Setup

### Host Instructions:
1. Select "Host Game" from the main menu.
2. If connecting over the internet, check "Use public STUN server". For LAN play, leave it unchecked.
3. Click "1. Generate Offer".
4. Click "Copy Offer" and send the generated string to the guest player.
5. Paste the guest player's answer string into the answer field and click "2. Connect".
6. Once connected, click "Start Race".

### Guest Instructions:
1. Select "Join Game" from the main menu.
2. If the host enabled the STUN option, check "Use public STUN server" as well.
3. Paste the host's offer string into the top field.
4. Click "Generate Answer & Connect".
5. Click "Copy Answer" and send the answer string back to the host.
6. The connection will establish automatically once the host applies the answer string.

---

## Building Standalone Application

To package a standalone 64-bit Windows executable into the `dist/` directory:

```bash
npm run package-win
```

Output path:
```text
dist/TurboTypeRacer-win32-x64/TurboTypeRacer.exe
```

---

## Credits

- **Creator & Developer:** Dipayan Bhanja

---

## License

This project is licensed under the [MIT License](LICENSE).
