export {fetchEvents, getLocalIsoString}

// Fetch markdown events from server
async function fetchEvents() {
    try {
        const response = await fetch('/api/events.json');
        if (!response.ok) {
            console.error('Failed to fetch events');
            return [];
        }
        const mdEvents = await response.json();

        // Convert to our event format
        return mdEvents.map(event => ({
            summary: event.title,
            start: new Date(event.date),
            end: event.end ? new Date(event.end) : null,
            uid: event.uid,
            description: event.description
        }));
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

//I want to use the ISO notation but with the local timezone instead of the UTC one
function getLocalIsoString(date){
    const offset = date.getTimezoneOffset() * 60000;
    const localTime = new Date(date.getTime() - offset);
    return localTime.toISOString();
}