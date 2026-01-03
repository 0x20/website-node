const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs').promises;
const matter = require('gray-matter');

const app = express();
const PORT = process.env.PORT || 3000;

// Calendar caching
const CALENDAR_URL = 'https://calendar.google.com/calendar/ical/info%40hackerspace.gent/public/basic.ics';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
let calendarCache = {
  data: null,
  lastFetch: 0
};

// Function to fetch calendar from Google
function fetchCalendar() {
  return new Promise((resolve, reject) => {
    https.get(CALENDAR_URL, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        if (response.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`Failed to fetch calendar: ${response.statusCode}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

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

// Serve calendar.ics with server-side caching
app.get('/calendar.ics', async (req, res) => {
  try {
    const now = Date.now();

    // Check if cache is valid
    if (calendarCache.data && (now - calendarCache.lastFetch) < CACHE_DURATION) {
      console.log('Serving cached calendar');
      res.set('Content-Type', 'text/calendar; charset=utf-8');
      res.set('Last-Modified', new Date(calendarCache.lastFetch).toUTCString());
      return res.send(calendarCache.data);
    }

    // Fetch fresh data
    console.log('Fetching fresh calendar from Google');
    const data = await fetchCalendar();

    // Update cache
    calendarCache.data = data;
    calendarCache.lastFetch = now;

    res.set('Content-Type', 'text/calendar; charset=utf-8');
    res.set('Last-Modified', new Date(now).toUTCString());
    res.send(data);
  } catch (error) {
    console.error('Error fetching calendar:', error);

    // If we have cached data, serve it even if expired
    if (calendarCache.data) {
      console.log('Serving stale cache due to error');
      res.set('Content-Type', 'text/calendar; charset=utf-8');
      res.set('Last-Modified', new Date(calendarCache.lastFetch).toUTCString());
      return res.send(calendarCache.data);
    }

    res.status(500).send('Error fetching calendar');
  }
});

// Parse and serve markdown events from /events folder
app.get('/api/events.json', async (req, res) => {
  try {
    const eventsDir = path.join(__dirname, 'events');
    const files = await fs.readdir(eventsDir);

    // Filter only .md files (exclude README)
    const mdFiles = files.filter(file =>
      file.endsWith('.md') && file.toLowerCase() !== 'readme.md'
    );

    const events = [];

    for (const file of mdFiles) {
      const filePath = path.join(eventsDir, file);
      const fileContent = await fs.readFile(filePath, 'utf8');

      // Parse frontmatter
      const { data, content } = matter(fileContent);

      // Validate required fields
      if (!data.title || !data.date) {
        console.warn(`Skipping ${file}: missing required fields (title, date)`);
        continue;
      }

      // Handle recurring events
      if (data.recurring && data.recurring !== 'false') {
        // Generate occurrences for the next 6 months
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

          // Increment based on recurrence
          if (data.recurring === 'weekly') {
            currentDate.setDate(currentDate.getDate() + 7);
          } else if (data.recurring === 'monthly') {
            currentDate.setMonth(currentDate.getMonth() + 1);
          } else {
            break; // Unknown recurrence type
          }

          occurrenceCount++;
        }
      } else {
        // One-time event
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
