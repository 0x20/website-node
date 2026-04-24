const path = require('path');
const fs = require('fs').promises;
const matter = require('gray-matter');

const projectsDir = path.join(__dirname, '..', 'projects');

async function getAllProjects() {
  let files;
  try {
    files = await fs.readdir(projectsDir, { recursive: true });
  } catch (e) {
    return [];
  }
  const mdFiles = files.filter(file =>
    file.endsWith('.md') && file.toLowerCase() !== 'readme.md'
  );

  const projects = [];

  for (const file of mdFiles) {
    const filePath = path.join(projectsDir, file);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    if (!data.title) {
      console.warn(`Skipping ${file}: missing required field (title)`);
      continue;
    }

    projects.push({
      title: data.title,
      author: data.author || null,
      image: data.image || null,
      link: data.link || null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      status: data.status || null,
      date: data.date || null,
      description: content.trim(),
      uid: `md-${file.replace(/\.md$/, '').replace(/\\/g, '/')}`,
      source: 'markdown'
    });
  }

  return projects;
}

module.exports = { getAllProjects };
