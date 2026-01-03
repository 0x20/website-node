const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const matter = require('gray-matter');

async function addEventFromMarkdown(filePath) {
  try {
    // Read the markdown file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    // Validate required fields
    if (!data.title) {
      throw new Error('Event title is required in frontmatter');
    }
    if (!data.date) {
      throw new Error('Event date is required in frontmatter');
    }

    // Parse dates
    const startDate = new Date(data.date);
    const endDate = data.end ? new Date(data.end) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default: 2 hours later

    // Set up Google Calendar API
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../secrets/idyllic-unity-449600-g4-471be9f570db.json'),
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    });

    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'info@hackerspace.gent';

    // Create event object
    const event = {
      summary: data.title,
      description: content.trim(),
      start: {
        dateTime: startDate.toISOString(),
      },
      end: {
        dateTime: endDate.toISOString(),
      },
    };

    console.log('Creating event from markdown file:', filePath);
    console.log('Title:', data.title);
    console.log('Start:', startDate.toISOString());
    console.log('End:', endDate.toISOString());
    console.log('');

    const response = await calendar.events.insert({
      calendarId,
      resource: event,
    });

    console.log('✅ Event created successfully!');
    console.log('ID:', response.data.id);
    console.log('Link:', response.data.htmlLink);

  } catch (error) {
    console.error('❌ Error creating event from markdown');
    console.error(error.message);

    if (error.response?.data) {
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Get file path from command line argument
const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node calender-add-post-from-md.js <path-to-markdown-file>');
  console.error('Example: node calender-add-post-from-md.js ../events/2025-12-30-special-social.md');
  process.exit(1);
}

addEventFromMarkdown(filePath);
