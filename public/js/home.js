import { fetchEvents, getLocalIsoString } from "./modules/event-loader.js";
import { categorizeEvents, deduplicateRecurringEvents } from "./modules/event-utils.js";

// Space status banner functionality
async function updateSpaceStatusBanner() {
    const banner = document.getElementById('space-open-banner');

    try {
        const response = await fetch('https://windowserver.0x20.be/spaceapi.json');

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Check the state of the space
        if (data.state && typeof data.state.open === 'boolean') {
            if (data.state.open) {
                // Show the banner
                banner.classList.remove('hidden');
            } else {
                // Hide the banner
                banner.classList.add('hidden');
            }
        } else {
            // Hide banner if tracker is down
            banner.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error fetching the space status:', error);
        // Hide banner on error
        banner.classList.add('hidden');
    }
}

// Poll the endpoint every 30 seconds
setInterval(updateSpaceStatusBanner, 30000);

// Initial update
updateSpaceStatusBanner();

//Adds events to homepage
async function processEvents(){
    const events = await fetchEvents();

    // Categorize events into future and past
    let { futureEvents, pastEvents } = categorizeEvents(events);

    // Deduplicate future events (only show next occurrence of recurring events)
    futureEvents = deduplicateRecurringEvents(futureEvents);

    // Process future events
    const closestFutureEvents = futureEvents
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, 5);

    // Process past events
    const recentPastEvents = pastEvents
        .sort((a, b) => new Date(b.start) - new Date(a.start))
        .slice(0, 10);

    // Add events to HTML
    addEvents(document.getElementById('upcomingEvents'), closestFutureEvents, true);
    addEvents(document.getElementById('pastEvents'), recentPastEvents);
}

function addEvents(target, events, highlightFirst = false) {
    target.innerHTML = ""; // Clear existing content
    events.forEach((event, index) => {
        const eventDate = new Date(event.start);
        const isFirst = highlightFirst && index === 0;
        const nextLabel = isFirst ? ' <span style="font-weight: bold; color: #fff;">« NEXT</span>' : '';
        const eventPath = event.uid.replace(/^md-/, '');
        const eventHTML = `<colored>${getLocalIsoString(eventDate).split('T')[0]}</colored> - <a href="/events/${eventPath}">${event.summary}</a>${nextLabel}
<br>`;
        target.innerHTML += eventHTML;
    });
}

processEvents();