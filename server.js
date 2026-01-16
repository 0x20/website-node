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

    if (data.recurring && data.recurring !== 'false') {
      const startDate = new Date(data.date);
      const endRange = new Date();
      endRange.setMonth(endRange.getMonth() + 6);
      let currentDate = new Date(startDate);
      let occurrenceCount = 0;

      while (currentDate <= endRange && occurrenceCount < 52) {
        events.push({
          title: data.title,
          date: currentDate.toISOString(),
          end: data.end ? new Date(new Date(data.end).getTime() + (currentDate - startDate)).toISOString() : null,
          description: content.trim(),
          uid: `md-${file.replace('.md', '')}-${currentDate.getTime()}`,
          source: 'markdown'
        });

        if (data.recurring === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (data.recurring === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else {
          break;
        }
        occurrenceCount++;
      }
    } else {
      events.push({
        title: data.title,
        date: data.date,
        end: data.end || null,
        description: content.trim(),
        uid: `md-${file.replace('.md', '')}`,
        source: 'markdown'
      });
    }
  }

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
