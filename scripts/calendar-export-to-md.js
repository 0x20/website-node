const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

function sanitizeFilename(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString();
}

async function exportCalendarToMarkdown() {
  try {
    console.log('Setting up authentication...');
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../secrets/idyllic-unity-449600-g4-471be9f570db.json'),
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    });

    console.log('Creating calendar client...');
    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'info@hackerspace.gent';

    console.log('Fetching events from calendar:', calendarId);
    console.log('');

    const response = await calendar.events.list({
      calendarId,
      maxResults: 2500,
      singleEvents: true,
    });

    const events = response.data.items;

    if (!events || events.length === 0) {
      console.log('No upcoming events found.');
      return;
    }

    console.log(`Found ${events.length} events. Creating markdown files...`);
    console.log('');

    const eventsDir = path.join(__dirname, '../events');

    // Make sure events directory exists
    if (!fs.existsSync(eventsDir)) {
      fs.mkdirSync(eventsDir, { recursive: true });
    }

    let created = 0;
    let skipped = 0;

    events.forEach((event) => {
      const start = event.start.dateTime || event.start.date;
      const end = event.end.dateTime || event.end.date;
      const startDate = new Date(start);

      const dateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const titleSlug = sanitizeFilename(event.summary || 'untitled');
      const filename = `${dateStr}-${titleSlug}.md`;

      const filepath = path.join(eventsDir, filename);

      // Skip if file already exists
      if (fs.existsSync(filepath)) {
        console.log(`⏭️  Skipping (already exists): ${filename}`);
        skipped++;
        return;
      }

      // Create frontmatter
      const frontmatter = [
        '---',
        `title: ${event.summary || 'Untitled Event'}`,
        `date: ${formatDate(start)}`,
      ];

      if (end) {
        frontmatter.push(`end: ${formatDate(end)}`);
      }

      frontmatter.push('---');

      // Create markdown content
      const content = [
        frontmatter.join('\n'),
        '',
        event.description || '',
      ].join('\n');

      // Write file
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`✅ Created: ${filename}`);
      created++;
    });

    console.log('');
    console.log('Summary:');
    console.log(`  Created: ${created} files`);
    console.log(`  Skipped: ${skipped} files`);

  } catch (error) {
    console.error('❌ Error exporting calendar to markdown');
    console.error(error.message);

    if (error.response?.data) {
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

exportCalendarToMarkdown()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
