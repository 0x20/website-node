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

// Parse and serve markdown events from /events folder
app.get('/api/events.json', async (req, res) => {
  try {
    const eventsDir = path.join(__dirname, 'events');
    const files = await fs.readdir(eventsDir, { recursive: true });

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
