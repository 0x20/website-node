export { categorizeEvents };

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
