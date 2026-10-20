# C17inator

A lightweight, native desktop controller and exerciser for **AXIS C17-series Network Displays** (such as the C1710 and C1720), built with [tinyjs](https://tinyjs.app) and the official [Axis VAPIX® Speaker Display Notification API](https://developer.axis.com/vapix/device-configuration/speaker-display-notification/).

---

## Features

- **Full VAPIX® Integration**:
  - Sends notifications directly to `/config/rest/speaker-display-notification/v1/simple`.
  - Supports **Stop / Clear** via `/config/rest/speaker-display-notification/v1/stop`.
  - Test ping diagnostics via `/config/rest/speaker-display-settings/v1/appearance`.
  - Seamless authentication: Automatic **HTTP Digest Authentication** (RFC 2617) with **Basic Authentication** fallback.

- **Real-Time WCAG 2.1 Contrast Ratio Studio**:
  - Computes the exact contrast ratio between text and background colors in real time.
  - Live compliance rating tags: **WCAG AA** ($\ge 4.5:1$), **WCAG AAA** ($\ge 7.0:1$), and **Large Text AA** ($\ge 3.0:1$).
  - One-click **Color Swap** button.
  - Curated high-visibility preset palettes (*Amber Gold*, *Monochrome 21:1*, *Signal Green*, *Alert Red*, *Emergency*, *Navy Notice*).

- **Full RGB Color Controls**:
  - Dual visual color pickers.
  - Hex code inputs (`#RRGGBB`) with two-way sync.
  - Fine-grained **R**, **G**, and **B** sliders and numeric steppers ($0$–$255$).

- **Motion & Scrolling Controls**:
  - **Static Mode**: Sends `"scrollSpeed": 0` for stationary text.
  - **Scrolling Mode**: Adjustable scroll speed ($1$–$10$) and all three official Axis scroll directions:
    - `fromRightToLeft` (Standard horizontal marquee)
    - `fromLeftToRight` (Reverse horizontal scroll)
    - `fromBottomToTop` (Vertical roll)
  - Configurable notification duration in seconds (formatted as Axis `duration: { type: "time", value: ms }`).

- **Diagnostics & Debugging**:
  - Live **VAPIX Activity & Response Console** displaying HTTP status codes, round-trip latency, auth method utilized, and formatted JSON request/response payloads.
  - **Copy cURL**: Generates ready-to-run terminal `curl` commands with authentication and payloads.

- **Experimental Virtual Screen Preview**:
  - Hardware chassis and screen simulation with LED raster grid overlay and directional animations, tucked behind an on/off toggle.

- **Zero npm Dependencies & Persistent Settings**:
  - Compiles to a ~6 MB standalone native binary with no `node_modules`.
  - Automatically saves connection details, message history, and color preferences via `tiny.store`.

---

## Prerequisites

- [tinyjs](https://tinyjs.app) (v0.57.8 or newer)
- Supported OS: Windows 10/11 (WebView2), macOS 15+, Linux (WebKitGTK 4.1)

---

## Development

Run in development mode with hot reload:

```bash
tinyjs dev
```

Run health checks:

```bash
tinyjs doctor
```

---

## Building Standalone Executables

To package the application into a self-contained binary:

```bash
tinyjs build
```

The compiled binary will be placed in `dist/`:
- **Windows**: `dist/c17inator.exe`
- **macOS**: `dist/C17inator.app`
- **Linux**: `dist/c17inator`

---

## Disclaimer

AXIS and VAPIX are registered trademarks of Axis Communications AB. This project is an independent tool and is not affiliated with, endorsed by, or sponsored by Axis Communications AB.

---

## License

[MIT](LICENSE) © 2026 n8dgr8
