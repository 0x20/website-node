---
title: LED-BARt
author: Mateo Van Damme
image: https://storage.googleapis.com/mateo-website-bucket/ledbart-demo.jpg
link: https://github.com/0x20/LED-BARt
tags: [electronics, esp32, arduino, wifi, display]
status: finished
date: 2026-04-24
---

A WiFi-connected LED bar display for the hackerspace. Type a message in the web interface, and it shows up on the physical 5×7 pixel LED display.

## The display

The bar was salvaged from outside a train station — one of those old departure/arrival displays. It found a new home at the hackerspace.

- 5×7 pixel dot matrix — 19 characters max width
- Custom 5×7 bitmap font, embedded in both firmware and web preview
- Shift register multiplexing — direct bit-banging on Arduino
- 12V input, internal stepdown to 5V

## Two-chip architecture

![Wiring diagram showing ESP32-C3 connected to Arduino Uno via UART](https://storage.googleapis.com/mateo-website-bucket/ledbart-schematic-black-small.webp)

The LED bar runs on 5V logic, but the ESP32-C3 only outputs 3.3V. Rather than using level shifters, the work is split across two chips — the ESP32-C3 handles WiFi and serves the API, while the Arduino Uno drives the display at the correct voltage. They communicate over UART at 9600 baud.

- **Xiao ESP32-C3** — WiFi + web server (3.3V)
- **Arduino Uno** — LED display driver (5V)
- **mDNS discovery** — accessible as `ledbart.local`

## Web interface

![LED-BARt web interface screenshot](https://storage.googleapis.com/mateo-website-bucket/ledbart-frontend2.png)

A static web interface sends curl commands to the ESP32-C3 webserver. Features a pixel-perfect canvas preview using the same 5×7 font as the hardware. Only works on the hackerspace LAN.

If you're on the LAN, try it yourself:

```
curl -X POST http://ledbart.local/text -H "Content-Type: text/plain" -d "YOUR TEXT"
```

## API

- `POST /text` — send plain text (max 19 chars), rendered with the 5×7 font
- `POST /pixels` — send 190 hex chars (95 raw column bytes) for full pixel control
- `WS :81` — binary WebSocket, 95 bytes per frame
- `GET /log` — recent activity log

[Live demo](https://0x20.github.io/LED-BARt/) · [Source on GitHub](https://github.com/0x20/LED-BARt)
