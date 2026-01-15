# Events

Create events by adding markdown files to this folder! Each event is a markdown file with some YAML frontmatter.

## How to add an event

1. Create a new `.md` file in this folder. Name files descriptively, e.g.  `2025-12-20-arduino-workshop.md` and place them in the subfolder created for the current year. 
2. Add frontmatter with event details
3. Write the description
4. Commit and push!

##  Example event

```markdown
---
title: Event Title
date: 2025-12-19T21:00:00+01:00
end: 2025-12-19T23:00:00+01:00
recurring: false
---

Event description here! You can use **markdown** formatting.

Add images using markdown syntax:
![Image description](https://example.com/image.jpg)

The description supports:
- Markdown formatting
- Links: [Link text](https://example.com)
- Images: ![Alt text](image-url)
- Multiple paragraphs
```

## Fields

- `title` (required): Event name
- `date` (required): Start date/time in ISO format with timezone (see below)
- `end` (optional): End date/time in ISO format with timezone
- `recurring` (optional): Set to `weekly`, `monthly`, or `false` (default: `false`)

### Don't forget the timezone
Always include the Belgium timezone offset at the end of dates:

```yaml
# Winter event (late Oct → late Mar): `+01:00` (CET)
date: 2026-01-21T19:30:00+01:00
# Summer event (late Mar → late Oct): `+02:00` (CEST)
date: 2026-07-15T20:00:00+02:00
```

# Examples

### Single event (winter):
```markdown
---
title: Arduino Workshop
date: 2025-12-20T19:00:00+01:00
end: 2025-12-20T22:00:00+01:00
---

Learn Arduino basics! Bring your laptop.
```

### Single event (summer):
```markdown
---
title: BBQ at the space
date: 2026-07-15T18:00:00+02:00
end: 2026-07-15T23:00:00+02:00
---

Summer BBQ! Bring your own drinks.
```

### Recurring event:
```markdown
---
title: Weekly Social
date: 2025-12-19T21:00:00+01:00
recurring: weekly
---

Our weekly Thursday meetup. Everyone welcome!
```