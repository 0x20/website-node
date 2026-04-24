import { fetchProjects } from "./modules/project-loader.js";

function renderMarkdown(text) {
    if (!text) return '';
    if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
        const html = marked.parse(text, { async: false });
        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'a', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'hr', 'img'],
            ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title'],
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

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function firstParagraph(markdown) {
    if (!markdown) return '';
    const trimmed = markdown.trim().split(/\n\s*\n/)[0] || '';
    return trimmed.length > 280 ? trimmed.slice(0, 280).trimEnd() + '…' : trimmed;
}

function renderProjects(target, projects) {
    target.innerHTML = '';

    if (projects.length === 0) {
        target.innerHTML = '<div class="col-12"><p>No projects yet — be the first!</p></div>';
        return;
    }

    projects
        .sort((a, b) => a.title.localeCompare(b.title))
        .forEach(project => {
            const projectId = project.uid.replace(/^md-/, '');
            const col = document.createElement('div');
            col.className = 'col-xl-4 col-lg-6 col-md-12';
            col.style.marginBottom = '25px';

            const card = document.createElement('a');
            card.className = 'framed project-card';
            card.href = `/projects/${projectId}`;
            card.style.height = '100%';

            const tagsHtml = (project.tags || [])
                .map(t => `<span class="project-tag">${escapeHtml(t)}</span>`)
                .join('');

            const statusHtml = project.status
                ? `<span class="project-status" data-status="${escapeHtml(project.status)}">${escapeHtml(project.status)}</span>`
                : '';

            const authorHtml = project.author
                ? `<colored>By ${escapeHtml(project.author)}</colored>`
                : '';

            const imageHtml = project.image
                ? `<img class="project-card-image" src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}">`
                : '';

            card.innerHTML = `
                ${imageHtml}
                <h2>${escapeHtml(project.title)}</h2>
                <div class="project-meta mb-2">
                    ${authorHtml}
                    ${statusHtml}
                    ${tagsHtml}
                </div>
                <div class="project-card-desc">${renderMarkdown(firstParagraph(project.description))}</div>`;

            col.appendChild(card);
            target.appendChild(col);
        });
}

async function initialize() {
    const projects = await fetchProjects();
    renderProjects(document.getElementById('projectGrid'), projects);
}

initialize();
