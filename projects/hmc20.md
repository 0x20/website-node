---
title: Human Machine Controller HMC-20
author: Sam Lefebvre
image: /projects/hmc20/HMC-20_console_600x370.jpg
link: https://www.tindie.com/products/saleconix/hmc-20-human-machine-controller-interface/
tags: [electronics, STM32, display]
status: finished
date: 2026-05-17
---

The HMC-20 is a flexible, low-cost, multi-purpose HMI interface board. It can host an add-on module for dedicated interfaces.

## General description

The HMC-20 **is a multi-purpose HMI board** with the following characteristics:

* 7-inch capacitive touch panel, 1000 cd/m2
* Optional resistive touch panel
* Keypad interface with 4x5 buttons
* User application board connector with command interpreter
* PWM-controlled backlight
* 5 digital inputs, 5 digital outputs + PWM
* 24-bit RGB interface
* Internal fonts, soft fonts, and external font ROM chip
* RTC with battery
* SD card for images, layouts, and firmware updates
* USB-C with serial port for control
* Acoustic feedback
* Saving parameters and settings with on board flash

It contains a range of predefined widgets that can be configured with a JSON files loaded from an SD card. Each property can be bound to events or changed with a command through the **command interpreter interface**. This allows you to develop your own board and connect an FTDI cable to the connector to evaluate your application before having the application board.

![HMC-20](/projects/hmc20/20240312_165421_blur_noback.png)

## Operation

The USB-C connector provides a SD drive and serial port on the PC, with a menu to dump and load layouts (applications), clear memory, set the clock, rotate the display, change brightness, and perform firmware updates. It comes with a bootloader (MCUboot) that provides a robuust firmware update procedure.

```text
HMI PANEL 1.2.1+0
----
Build May  5 2026 23:34:10
Total flash size: 64Mb
Index   [##..................] 8,91%
Storage [##..................] 10,85%
www.saleconix.be | info@saleconix.be
2026 All rights reserved.

Settings
----
Time: 01/01/1970 00:00:00
Display size WxH: 800x480
Debug port speed: virtual
Command port speed: 115200Bd
LCD bits per pixel: 8
Display orientation: 0 degrees
Backlight brightness: 100%
Current app selected: appgraphchinese

Menu
----
s: Settings menu
i: Info menu
h: Help menu
1: Dump current layout to json
2: Load application from memory
3: Clear selected application
4: Store application from SD card
5: Set clock
6: Set orientation
7: Set brightness
8: Clear data for all applications
9: Format flash memory
10: Erase full flash memory
11: Firmware update
12: Reboot device
```

## JSON applications

Layouts are described in JSON format. Each widget belongs to a page. Visual widgets have a render priority which defines the visible order. Each property can have a default value and can be updated by the command interpreter port. Some parameters are stored permanently in memory like PIN codes, etc.

```json
{
  "buttons": [
    {
      "name": "B0",
      "Xloc": 72,
      "Yloc": 80,
      "width": 15,
      "height": 17,
      "background": "image",
      "image": "s2.bmp",
      "backcolor": 0,
      "fontcolor": 65535
    }
  ],
  "functions": [],
  "pages": [],
  "pincodes": []
}
```

## Dual-board solution

To enable maximum flexibility, two boards can be connected to each other. The base board HMC-20 provides the core graphical functionality, supplies power, and can also run independently. The add-on board UAB-23 contains the specific interfaces for a given application. Both boards communicate through serial command interpreter with an open protocol. The SD card can be accessed from the application board to upload layouts and firmware images without removing the SD card. For robuust appications, the card can be replaced by a chip, however this requires a board layout update.

![HMC-20](/projects/hmc20/Afbeelding2.jpg)

## Downloads

Datasheet [HMC-20_V12\.pdf](/projects/hmc20/HMC-20_Datasheet_V12.pdf)

Firmware [1.1.0+0\.bin](/projects/hmc20/hmc20_1.1.0+0.bin)

For extra information, demos, orders, collaborations, or project ideas, email info@saleconix.be.

