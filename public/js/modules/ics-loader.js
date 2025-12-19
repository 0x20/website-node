export {fetchEvents, getLastModified, getLocalIsoString}

import ICAL from "https://unpkg.com/ical.js/dist/ical.min.js";

async function fetchEvents(filePath) {
    const response = await fetch(filePath);
    const data = await response.text();
    var vevents = [];

    try {
        var jcalData = ICAL.parse(data);
        var vcalendar = new ICAL.Component(jcalData);
        vevents = vcalendar.getAllSubcomponents('vevent');
    } catch (ex) {
        console.log("Parsing failed");
        console.log(ex.message);
        return []; // Return empty array if parsing fails
    }

    const allEvents = [];

    // Expand events to show occurrences in a time range
    // Show 6 months in the past and 6 months in the future
    const rangeStart = new Date();
    rangeStart.setMonth(rangeStart.getMonth() - 6);
    const rangeEnd = new Date();
    rangeEnd.setMonth(rangeEnd.getMonth() + 6);

    vevents.forEach(vevent => {
        const event = new ICAL.Event(vevent);

        // Check if event is recurring
        if (event.isRecurring()) {
            // Expand recurring event within time range
            const expand = event.iterator();
            let next;
            let occurrenceCount = 0;

            while ((next = expand.next())) {
                const occurrence = next.toJSDate();

                // Stop if we're past the range
                if (occurrence > rangeEnd) break;

                // Only add if within range
                if (occurrence >= rangeStart) {
                    allEvents.push({
                        summary: event.summary,
                        start: occurrence,
                        end: event.endDate ? event.endDate.toJSDate() : null,
                        uid: event.uid.split('@')[0] + '-' + occurrence.getTime(),
                        description: event.description,
                    });
                }

                // Safety limit: max 200 occurrences per event to prevent infinite loops
                occurrenceCount++;
                if (occurrenceCount > 200) break;
            }
        } else {
            // Single event (non-recurring)
            allEvents.push({
                summary: event.summary,
                start: event.startDate ? event.startDate.toJSDate() : null,
                end: event.endDate ? event.endDate.toJSDate() : null,
                uid: event.uid.split('@')[0],
                description: event.description,
            });
        }
    });

    return allEvents;
}

//Use this function to see when the server was last update
async function getLastModified(filePath) {
    const response = await fetch(filePath);
    const lastModified = response.headers.get('Last-Modified');
    if (lastModified) 
        return new Date(lastModified);
    return null;
}

//I want to use the ISO notation but with the local timezone instead of the UTC one
function getLocalIsoString(date){
    const offset = date.getTimezoneOffset() * 60000;
    const localTime = new Date(date.getTime() - offset);
    return localTime.toISOString();
}