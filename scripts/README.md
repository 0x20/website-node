# Scripts

## `test-calendar-get-events.js`
Fetches events from the calendar to verify read access.

## `test-calendar-add-post.js`
Creates a test event to verify write permissions.

## `calendar-add-post-from-md.js`
Creates a calendar event from a markdown file in the events folder.

**Usage:**
```bash
node scripts/calendar-add-post-from-md.js events/your-event.md
```

## `calendar-export-to-md.js`
Exports all upcoming calendar events to markdown files in the events folder.

**Usage:**
```bash
node scripts/calendar-export-to-md.js
```
