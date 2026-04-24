const express = require('express');
const path = require('path');
const { getAllEvents } = require('./lib/events');
const { getAllProjects } = require('./lib/projects');

const app = express();
const PORT = process.env.PORT || 3000;

// Set Pug as templating engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('index', { activePage: 'Home' });
});

app.get('/events', (req, res) => {
  res.render('events', { activePage: 'Events' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { activePage: 'Visiting / Contact' });
});

app.get('/presskit', (req, res) => {
  res.render('presskit', { activePage: 'Press Kit' });
});

app.get('/projects', (req, res) => {
  res.render('projects', { activePage: 'Projects' });
});

app.get('/event-list', (req, res) => {
  res.render('event-list');
});

// Individual event page
app.get('/events/:eventId(*)', async (req, res) => {
  try {
    const rawId = req.params.eventId;
    const events = await getAllEvents();
    const event = events.find(e => e.uid === `md-${rawId}` || e.uid === rawId);

    if (!event) {
      return res.redirect('/events');
    }

    res.render('event-detail', {
      activePage: 'Events',
      event: event,
      eventPath: req.params.eventId
    });
  } catch (error) {
    console.error('Error loading event:', error);
    res.redirect('/events');
  }
});

// API endpoint for events
app.get('/api/events.json', async (req, res) => {
  try {
    const events = await getAllEvents();
    res.json(events);
  } catch (error) {
    console.error('Error reading markdown events:', error);
    res.status(500).json({ error: 'Failed to load markdown events' });
  }
});

// Individual project page
app.get('/projects/:projectId(*)', async (req, res) => {
  try {
    const rawId = req.params.projectId;
    const projects = await getAllProjects();
    const project = projects.find(p => p.uid === `md-${rawId}` || p.uid === rawId);

    if (!project) {
      return res.redirect('/projects');
    }

    res.render('project-detail', {
      activePage: 'Projects',
      project: project,
      projectPath: req.params.projectId
    });
  } catch (error) {
    console.error('Error loading project:', error);
    res.redirect('/projects');
  }
});

// API endpoint for projects
app.get('/api/projects.json', async (req, res) => {
  try {
    const projects = await getAllProjects();
    res.json(projects);
  } catch (error) {
    console.error('Error reading markdown projects:', error);
    res.status(500).json({ error: 'Failed to load markdown projects' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
