# Projects

Show off things you've built at Hackerspace Gent! Each project is a markdown file with some YAML frontmatter.

## How to add a project

1. Create a new `.md` file in this folder. Name files descriptively, e.g. `led-cube.md` or `retro-handheld.md`.
2. Add frontmatter with project details (only `title` is required).
3. Write a description in markdown — the first paragraph shows up on the projects list as a teaser.
4. Commit and push!

## Example

```markdown
---
title: LED Cube
author: Your Name
image: https://example.com/led-cube.jpg
link: https://github.com/you/led-cube
tags: [electronics, arduino]
status: finished
---

An 8×8×8 RGB LED cube driven by an Arduino Mega.

Built this over the winter — the hardest part was the soldering. The cube plays
animations from an SD card and has a small microphone for music reactive modes.
```

## Fields

- `title` (required): Project name
- `author` (optional): Who made it
- `image` (optional): Cover image URL (absolute URL or path like `/images/projects/my-pic.jpg`)
- `link` (optional): External link — repo, demo, writeup, etc.
- `tags` (optional): List of short tags, e.g. `[electronics, 3d-print]`
- `status` (optional): `idea`, `in-progress`, or `finished`
- `date` (optional): ISO date of last update, e.g. `2026-04-24`
