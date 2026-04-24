const path = require('path');
const fs = require('fs').promises;
const matter = require('gray-matter');

const eventsDir = path.join(__dirname, '..', 'events');

async function getAllEvents() {
  const files = await fs.readdir(eventsDir, { recursive: true });
  const mdFiles = files.filter(file =>
    file.endsWith('.md') && file.toLowerCase() !== 'readme.md'
  );

  const events = [];

  for (const file of mdFiles) {
    const filePath = path.join(eventsDir, file);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    // weekly-social.md has no date — handled separately below
    if (file.replace(/\\/g, '/') === 'weekly-social.md') {
      continue;
    }

    if (!data.title || !data.date) {
      console.warn(`Skipping ${file}: missing required fields (title, date)`);
      continue;
    }

    events.push({
      title: data.title,
      date: data.date,
      end: data.end || null,
      description: content.trim(),
      uid: `md-${file.replace('.md', '').replace(/\\/g, '/')}`,
      source: 'markdown'
    });
  }

  // Weekly social — always shows as next Thursday
  const weeklySocialPath = path.join(eventsDir, 'weekly-social.md');
  try {
    const wsContent = await fs.readFile(weeklySocialPath, 'utf8');
    const { data: wsData, content: wsBody } = matter(wsContent);
    const now = new Date();
    const nextThursday = new Date(now);
    nextThursday.setDate(now.getDate() + ((4 - now.getDay() + 7) % 7 || 7));
    nextThursday.setHours(20, 0, 0, 0); // 20:00 UTC = 21:00 CET
    events.push({
      title: wsData.title || 'Weekly Social',
      date: nextThursday.toISOString(),
      end: null,
      description: wsBody.trim(),
      uid: 'weekly-social-next',
      source: 'markdown'
    });
  } catch (e) {
    // weekly-social.md missing, skip
  }

  return events;
}

module.exports = { getAllEvents };
