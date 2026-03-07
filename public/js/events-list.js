import { fetchEvents, getLocalIsoString } from "./modules/event-loader.js";
import { categorizeEvents } from "./modules/event-utils.js";

function renderMarkdown(text) {
    if (!text) return '';
    if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
        const html = marked.parse(text, { async: false });
        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'a', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'hr', 'img'],
            ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title'],
            ALLOW_DATA_ATTR: false,
            FORCE_BODY: true,
            AFTER_SANITIZE_ATTRIBUTES: function(node) {
                if (node.tagName === 'A' && node.hasAttribute('href')) {
                    node.setAttribute('rel', 'noopener noreferrer');
                    node.setAttribute('target', '_blank');
                }
            }
        });
    }
    return text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function convertDateToStr(eventDate) {
    return `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')} ${String(eventDate.getHours()).padStart(2, '0')}h${String(eventDate.getMinutes()).padStart(2, '0')}m`;
}

function renderEvents(target, events, markLast = false) {
    target.innerHTML = "";
    if (events.length === 0) {
        target.innerHTML = '<p>No events.</p>';
        return;
    }
    events.forEach((event, index) => {
        const eventDate = new Date(event.start);
        const eventStr = convertDateToStr(eventDate);
        const eventId = event.uid.replace(/^md-/, '');
        const description = event.description ? renderMarkdown(event.description) : '';
        const isNext = markLast && index === events.length - 1;
        const nextLabel = isNext ? ' <span style="font-weight: bold; color: #fff;">« NEXT</span>' : '';

        const card = document.createElement('div');
        card.id = event.uid;
        card.className = 'framed event-card mb-4';
        card.style.cursor = 'pointer';
        card.onclick = () => window.location.href = `/events/${eventId}`;
        card.innerHTML = `
            <div class="mb-2">
                <colored>${eventStr}</colored> — ${event.summary}${nextLabel}
            </div>
            ${description ? `<div class="event-description">${description}</div>` : ''}`;

        target.appendChild(card);
    });
}

async function initialize() {
    const events = await fetchEvents();
    let { futureEvents, pastEvents } = categorizeEvents(events);

    // Upcoming: furthest in the future at top → closest to now at bottom
    futureEvents = futureEvents.sort((a, b) => new Date(b.start) - new Date(a.start));
    // Past: most recent at top → oldest at bottom
    pastEvents = pastEvents.sort((a, b) => new Date(b.start) - new Date(a.start));

    renderEvents(document.getElementById('upcomingEvents'), futureEvents, true);
    renderEvents(document.getElementById('pastEvents'), pastEvents);
}

initialize();
