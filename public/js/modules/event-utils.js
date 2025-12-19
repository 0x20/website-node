export { categorizeEvents, deduplicateRecurringEvents };

/**
 * Categorizes events into future and past
 */
function categorizeEvents(events) {
    const now = new Date();
    const futureEvents = [];
    const pastEvents = [];

    events.forEach(event => {
        if (event.start) {
            const eventDate = new Date(event.start);
            if (eventDate > now) {
                futureEvents.push(event);
            } else if (eventDate < now) {
                pastEvents.push(event);
            }
        }
    });

    return { futureEvents, pastEvents };
}

/**
 * Deduplicates recurring events - keeps only the next occurrence of each recurring event
 */
function deduplicateRecurringEvents(events) {
    const eventsMap = new Map();

    events.forEach(event => {
        // Extract base UID (recurring events have format: baseuid-timestamp)
        const baseUid = event.uid.includes('-')
            ? event.uid.substring(0, event.uid.lastIndexOf('-'))
            : event.uid;

        // Only keep the earliest occurrence of each recurring event
        if (!eventsMap.has(baseUid) || new Date(event.start) < new Date(eventsMap.get(baseUid).start)) {
            eventsMap.set(baseUid, event);
        }
    });

    return Array.from(eventsMap.values());
}
