const { google } = require('googleapis');

const serviceAccount = new google.auth.GoogleAuth({
    keyFile: "../secrets/idyllic-unity-449600-g4-471be9f570db.json",

    // turns out it was required, when not defined it returned 401
    scopes: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
    ],
});

google.options({ auth: serviceAccount });

(async () => {
    const events = await google.calendar("v3").events.list({
        calendarId: "info@hackerspace.gent",
        timeMin: "2024-07-11T00:00:00+07:00",
    });

    console.log(events.data.items);
})();