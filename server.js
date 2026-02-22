const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const matter = require('gray-matter');

const app = express();
const PORT = process.env.PORT || 3000;

// Set Pug as templating engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('index', { activePage: 'Home' });
});

app.get('/events', (req, res) => {
  res.render('events', { activePage: 'Events' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { activePage: 'Visiting / Contact' });
});

// Shared function to parse all events
async function getAllEvents() {
  const eventsDir = path.join(__dirname, 'events');
  const files = await fs.readdir(eventsDir, { recursive: true });
  const mdFiles = files.filter(file =>
    file.endsWith('.md') && file.toLowerCase() !== 'readme.md'
  );

  const events = [];

  for (const file of mdFiles) {
    const filePath = path.join(eventsDir, file);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    if (!data.title || !data.date) {
      console.warn(`Skipping ${file}: missing required fields (title, date)`);
      continue;
    }

    // Skip recurring event files — we hardcode the next weekly social below
    if (data.recurring && data.recurring !== 'false') {
      continue;
    }

    events.push({
      title: data.title,
      date: data.date,
      end: data.end || null,
      description: content.trim(),
      uid: `md-${file.replace('.md', '')}`,
      source: 'markdown'
    });
  }

  // Hardcoded next weekly social — always shows the upcoming Thursday at 21:00 CET/CEST
  const now = new Date();
  const nextThursday = new Date(now);
  nextThursday.setDate(now.getDate() + ((4 - now.getDay() + 7) % 7 || 7));
  nextThursday.setHours(20, 0, 0, 0); // 20:00 UTC = 21:00 CET
  events.push({
    title: 'Weekly Social',
    date: nextThursday.toISOString(),
    end: null,
    description: 'Join us every Thursday at 21:00 for our weekly social!\n\nOpen to everyone - members and visitors welcome. Come hang out, work on projects, or just chat.',
    uid: 'weekly-social-next',
    source: 'markdown'
  });

  return events;
}

// Individual event page
app.get('/events/:eventId(*)', async (req, res) => {
  try {
    const eventId = `md-${req.params.eventId}`;
    const events = await getAllEvents();
    const event = events.find(e => e.uid === eventId);

    if (!event) {
      return res.redirect('/events');
    }

    res.render('event-detail', {
      activePage: 'Events',
      event: event,
      eventPath: req.params.eventId
    });
  } catch (error) {
    console.error('Error loading event:', error);
    res.redirect('/events');
  }
});

// API endpoint for events
app.get('/api/events.json', async (req, res) => {
  try {
    const events = await getAllEvents();
    res.json(events);
  } catch (error) {
    console.error('Error reading markdown events:', error);
    res.status(500).json({ error: 'Failed to load markdown events' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
