import { fetchEvents, getLastModified, getLocalIsoString } from "./modules/ics-loader.js";
import { categorizeEvents, deduplicateRecurringEvents } from "./modules/event-utils.js";

const icsEndpoint = '/calendar.ics';

// Adds events to events page
async function processEvents(url) {
    const events = await fetchEvents(url);

    // Categorize events into future and past
    let { futureEvents, pastEvents } = categorizeEvents(events);

    // Deduplicate future events (only show next occurrence of recurring events)
    futureEvents = deduplicateRecurringEvents(futureEvents);

    // Sort events
    futureEvents = futureEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
    pastEvents = pastEvents.sort((a, b) => new Date(b.start) - new Date(a.start));

    // Add events to HTML
    addFutureEvents(document.getElementById('upcomingEvents'), futureEvents);
    addPastEvents(document.getElementById('pastEvents'), pastEvents);
}

// Function to extract image URLs from the description
function extractImageUrls(description) {
    if(description == null)
        return [];
    const imageRegex = /(https:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif))/gi;
    return description.match(imageRegex) || [];
}

function addPastEvents(target, events) {
    target.innerHTML = ""; // Clear existing content
    events.forEach(event => {
        const eventDate = new Date(event.start);
        const eventStr = getLocalIsoString(eventDate).split('T')[0];

        // Check if event has meaningful description
        const hasDescription = event.description && event.description.trim() !== '';

        if (hasDescription) {
            // Full event card with description and images
            const images = extractImageUrls(event.description);
            let imagesHTML = '';

            if (images.length > 0) {
                images.forEach(url => {
                    imagesHTML += `<img src="${url}" alt="Event Image" style="height:250px; margin:10px;">`;
                });
            }

            const eventHTML = `
            <div id=${event.uid} class="framed mb-5">
                <div class="mb-3">
                    <colored>${eventStr}</colored> - ${event.summary}
                </div>
                <div>
                    <p>${event.description}</p>
                    <div>${imagesHTML}</div>
                </div>
            </div>`;
            target.innerHTML += eventHTML;
        } else {
            // Compact one-liner for events without description
            const eventHTML = `
            <div id=${event.uid} style="padding: 4px 0;">
                <colored style="font-size: 0.9em;">${eventStr}</colored> <span style="color: #888; font-size: 0.9em;">- ${event.summary}</span>
            </div>`;
            target.innerHTML += eventHTML;
        }
    });
}

function addFutureEvents(target, events) {
    target.innerHTML = ""; // Clear existing content
    events.forEach(event => {
        const eventDate = new Date(event.start);
        const eventStr = convertDateToStr(eventDate);
        const eventHTML = `
        <div id=${event.uid} class="framed m-2 tile" style="min-width: 400px;">
            <div class="mb-3">
                <colored>${eventStr}</colored> - ${event.summary}
            </div>
            <div>
                <p>${event.description ?? "No description available."}</p>
            </div>
        </div>`;

        target.innerHTML += eventHTML;
    });
}

function convertDateToStr(eventDate){
    return `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')} ${String(eventDate.getHours()).padStart(2, '0')}h${String(eventDate.getMinutes()).padStart(2, '0')}m`;
}

async function setLastUpdatedTimestamp(icsEndpoint) {
    const timeStamp = await getLastModified(icsEndpoint);
    const coloredDiv = document.getElementById("calenderLastUpdated");
    let [day, hour] = getLocalIsoString(timeStamp).split('T');
    hour = hour.split('.')[0];
    coloredDiv.innerHTML = `${day}, ${hour}`;
}

function scrollToAnchor() {
    const hash = window.location.hash;
    if (hash) {
        const targetElementId = hash.substring(1); // Remove the '#' from the hash
        const targetElement = document.getElementById(targetElementId);
        console.log(`Trying to scroll to ${hash}`);             
        if (targetElement) {
            console.log(`Scrolling to ${hash}`);             
            const yPosition = targetElement.getBoundingClientRect().top + window.scrollY - 200; 
            // Compensate for  sticky header height
            window.scrollTo({ top: yPosition, behavior: "smooth" });
        }
    }
}

async function initialize(){
    await processEvents(icsEndpoint);
    await setLastUpdatedTimestamp(icsEndpoint);
    scrollToAnchor();
}

initialize();
