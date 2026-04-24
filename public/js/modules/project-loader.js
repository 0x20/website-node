export { fetchProjects };

async function fetchProjects() {
    try {
        const response = await fetch('/api/projects.json');
        if (!response.ok) {
            console.error('Failed to fetch projects');
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
}
