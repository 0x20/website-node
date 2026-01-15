# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (auto-reload)
npm run dev

# Production
npm start

# Docker deployment (used with Traefik on production VM)
docker compose up -d --build
```

### Calendar Scripts

```bash
# Export calendar events to markdown
node scripts/calendar-export-to-md.js

# Create calendar event from markdown file
node scripts/calendar-add-post-from-md.js events/your-event.md
```

## Architecture

This is a Node.js/Express website for Hackerspace Gent (0x20).

### Event System

Events are served from **Markdown files** via `/api/events.json`, parsed in `server.js` using gray-matter.

Client-side JS modules in `public/js/modules/` handle loading, deduplication, and categorization of events.

### Markdown Event Format

Files in `/events/` with YAML frontmatter:
                                                                    - Required: `title`, `date` (ISO format with timezone)
- Optional: `end`, `recurring` (weekly/monthly/false)

**Timezone:** Always include Belgium timezone offset:
- Winter (late Oct → late Mar): `+01:00` (CET)
- Summer (late Mar → late Oct): `+02:00` (CEST)

Examples:
```yaml
# Winter event (January)
date: 2026-01-21T19:30:00+01:00

# Summer event (July)
date: 2026-07-15T20:00:00+02:00
```

### Views

Pug templates in `views/` with partials for head, header, footer. Each page has a corresponding client-side JS file in `public/js/`.
