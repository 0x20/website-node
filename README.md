# Hackerspace Gent Website (Node.js/Express)

This is a Node.js/Express port of the Hackerspace Gent website.

## Features

- Home page with space status and upcoming/past events
- Events page with detailed event listings
- Contact page with space information and status
- Dynamic navigation
- Server-side ICS calendar fetching with 1-hour caching
- Space status API integration
- No GitHub Actions required - calendar updates automatically

## Installation

```bash
npm install
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## Project Structure

```
website-node/
├── public/              # Static assets
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   │   └── modules/    # JavaScript modules
│   └── images/         # Images and media
├── views/              # Pug templates
│   ├── partials/       # Reusable template parts
│   ├── index.pug       # Home page
│   ├── events.pug      # Events page
│   └── contact.pug     # Contact page
├── server.js           # Express server
└── package.json        # Dependencies
```

## Routes

- `/` - Home page
- `/events` - Events page
- `/contact` - Contact page
- `/calendar.ics` - Calendar file (fetched from Google Calendar, cached for 1 hour)

## Event System

The website displays events from two sources:

### 1. Google Calendar (ICS)
- **Source:** `https://calendar.google.com/calendar/ical/info@hackerspace.gent/public/basic.ics`
- **Caching:** Events are cached server-side for 1 hour
- **Fallback:** If Google Calendar is unavailable, stale cache is served
- **No maintenance:** No GitHub Actions or cron jobs needed!

### 2. Markdown Files (NEW!)
- **Location:** `/events/` folder
- **Format:** Markdown files with YAML frontmatter
- **Access:** Anyone can add events via Pull Request - no calendar access needed!
- **See:** `/events/README.md` for format and examples

Events from both sources are automatically merged and displayed together.

## Technologies Used

- Node.js
- Express.js
- Pug (templating engine)
- Bootstrap 5
- Vanilla JavaScript (ES6 modules)
