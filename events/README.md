# Events

Create events by adding markdown files to this folder!

## Format

Each event is a markdown file with YAML frontmatter:

```markdown
---
title: Event Title
date: 2025-12-19T21:00:00
end: 2025-12-19T23:00:00
recurring: false
---

Event description here! You can use **markdown** formatting.

Add images by including URLs in the description:
https://example.com/image.jpg

The description supports:
- Markdown formatting
- Links
- Images (just include the URL)
- Multiple paragraphs
```

## Fields

### Required:
- `title`: Event name
- `date`: Start date/time in ISO format (YYYY-MM-DDTHH:MM:SS)

### Optional:
- `end`: End date/time in ISO format
- `recurring`: Set to `weekly`, `monthly`, or `false` (default: `false`)

## Examples

### One-time event:
```markdown
---
title: Arduino Workshop
date: 2025-12-20T19:00:00
end: 2025-12-20T22:00:00
---

Learn Arduino basics! Bring your laptop.
```

### Recurring event:
```markdown
---
title: Weekly Social
date: 2025-12-19T21:00:00
recurring: weekly
---

Our weekly Thursday meetup. Everyone welcome!
```

## File naming

Name files descriptively, e.g.:
- `2025-12-20-arduino-workshop.md`
- `weekly-social.md`

## How to add an event

1. Create a new `.md` file in this folder
2. Add frontmatter with event details
3. Write the description
4. Commit and push!

No calendar access needed!
