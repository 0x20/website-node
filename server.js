const express = require('express');
const path = require('path');
const https = require('https');

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
      return res.send(calendarCache.data);
    }

    // Fetch fresh data
    console.log('Fetching fresh calendar from Google');
    const data = await fetchCalendar();

    // Update cache
    calendarCache.data = data;
    calendarCache.lastFetch = now;

    res.set('Content-Type', 'text/calendar; charset=utf-8');
    res.send(data);
  } catch (error) {
    console.error('Error fetching calendar:', error);

    // If we have cached data, serve it even if expired
    if (calendarCache.data) {
      console.log('Serving stale cache due to error');
      res.set('Content-Type', 'text/calendar; charset=utf-8');
      return res.send(calendarCache.data);
    }

    res.status(500).send('Error fetching calendar');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
