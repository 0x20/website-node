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
node scripts/calender-export-to-md.js

# Create calendar event from markdown file
node scripts/calender-add-post-from-md.js events/your-event.md
```

## Architecture

This is a Node.js/Express website for Hackerspace Gent (0x20).

### Event System (Dual Source)

Events come from two sources, merged client-side:

1. **Google Calendar (ICS)** - Fetched via `public/js/modules/ics-loader.js`, cached 1 hour
2. **Markdown files** - Served via `/api/events.json`, parsed in `server.js` using gray-matter

Client-side JS modules in `public/js/modules/` handle loading, deduplication, and categorization of events from both sources.

### Markdown Event Format

Files in `/events/` with YAML frontmatter:
- Required: `title`, `date` (ISO format)
- Optional: `end`, `recurring` (weekly/monthly/false)

### Views

Pug templates in `views/` with partials for head, header, footer. Each page has a corresponding client-side JS file in `public/js/`.
