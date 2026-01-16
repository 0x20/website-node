# Hackerspace Gent Website

Website for Hackerspace Gent (0x20).

## Events

Events are managed via markdown files in `/events/` with YAML frontmatter. Anyone can add events via Pull Request - see `/events/README.md` for the format.

## Development

```bash
npm install
npm run dev    # Development with auto-reload
npm start      # Production
```

Server runs on `http://localhost:3000`

### Project Structure

```
website-node/
├── public/           # Static assets (css, js, images)
├── views/            # Pug templates
├── events/           # Event markdown files
├── scripts/          # Calendar export/import scripts
└── server.js         # Express server
```

### Deployment

```bash
docker compose up -d --build
```
