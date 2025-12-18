# Hackerspace Gent Website (Node.js/Express)

This is a Node.js/Express port of the Hackerspace Gent website.

## Features

- Home page with space status and upcoming/past events
- Events page with detailed event listings
- Contact page with space information and status
- Dynamic navigation
- ICS calendar integration
- Space status API integration

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
│   ├── images/         # Images and media
│   └── calendar.ics    # Events calendar
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
- `/calendar.ics` - Calendar file

## Technologies Used

- Node.js
- Express.js
- Pug (templating engine)
- Bootstrap 5
- Vanilla JavaScript (ES6 modules)
