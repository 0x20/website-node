import { fetchEvents, getLocalIsoString } from "./modules/event-loader.js";
import { categorizeEvents, deduplicateRecurringEvents } from "./modules/event-utils.js";

// Adds events to events page
async function processEvents() {
    const events = await fetchEvents();

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

// Render markdown to HTML (sanitized to prevent XSS)
function renderMarkdown(text) {
    if (!text) return '';
    if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
        // Parse markdown with safe defaults
        const html = marked.parse(text, { async: false });
        // Sanitize with strict allowlist
        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'a', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'hr', 'img'],
            ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title'],
            ALLOW_DATA_ATTR: false,
            ADD_ATTR: ['rel'],
            FORCE_BODY: true,
            // Add noopener noreferrer to all links
            AFTER_SANITIZE_ATTRIBUTES: function(node) {
                if (node.tagName === 'A' && node.hasAttribute('href')) {
                    node.setAttribute('rel', 'noopener noreferrer');
                    node.setAttribute('target', '_blank');
                }
            }
        });
    }
    // Fallback: escape HTML if libraries not loaded
    return text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function addPastEvents(target, events) {
    target.innerHTML = ""; // Clear existing content
    events.forEach(event => {
        const eventDate = new Date(event.start);
        const eventStr = getLocalIsoString(eventDate).split('T')[0];

        // Check if event has meaningful description
        const hasDescription = event.description && event.description.trim() !== '';

        if (hasDescription) {
            // Full event card with description (markdown handles images automatically)
            const eventHTML = `
            <div id=${event.uid} class="framed mb-5">
                <div class="mb-3">
                    <colored>${eventStr}</colored> - ${event.summary}
                </div>
                <div class="event-description">
                    ${renderMarkdown(event.description)}
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
        const description = event.description ? renderMarkdown(event.description) : "No description available.";
        const eventHTML = `
        <div id=${event.uid} class="framed m-2 tile" style="min-width: 400px;">
            <div class="mb-3">
                <colored>${eventStr}</colored> - ${event.summary}
            </div>
            <div class="event-description">
                ${description}
            </div>
        </div>`;

        target.innerHTML += eventHTML;
    });
}

function convertDateToStr(eventDate){
    return `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')} ${String(eventDate.getHours()).padStart(2, '0')}h${String(eventDate.getMinutes()).padStart(2, '0')}m`;
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
    await processEvents();
    scrollToAnchor();
}

initialize();
