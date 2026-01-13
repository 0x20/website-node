const { google } = require('googleapis');
const path = require('path');

async function addTestEvent() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../secrets/idyllic-unity-449600-g4-471be9f570db.json'),
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'info@hackerspace.gent';

    const event = {
      summary: 'Test Event from Node.js',
      description: 'This is a test event created by the Node.js script',
      start: {
        dateTime: '2025-12-30T19:00:00+01:00',
      },
      end: {
        dateTime: '2025-12-30T21:00:00+01:00',
      },
    };

    console.log('Attempting to add event to calendar:', calendarId);

    const response = await calendar.events.insert({
      calendarId,
      resource: event,
    });

    console.log('✅ Event created');
    console.log('ID:', response.data.id);
    console.log('Link:', response.data.htmlLink);

  } catch (error) {
    console.error('❌ Error adding event');
    console.error(error.message);

    if (error.response?.data) {
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

addTestEvent();
