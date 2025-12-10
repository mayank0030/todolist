// server.js - Simple Express backend with file-based persistence (tasks.json)
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const DATA_FILE = path.join(__dirname, 'tasks.json');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Utility: load tasks from file (create file if missing)
function loadTasks() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([] , null, 2));
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE);
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading tasks:', err);
    return [];
  }
}

// Utility: save tasks to file
function saveTasks(tasks) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
  } catch (err) {
    console.error('Error saving tasks:', err);
  }
}

// REST API

// GET /api/tasks - list all tasks
app.get('/api/tasks', (req, res) => {
  const tasks = loadTasks();
  res.json(tasks);
});

// POST /api/tasks - create new task { title, done (optional) }
app.post('/api/tasks', (req, res) => {
  const { title, done = false } = req.body;
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Invalid title' });
  }
  const tasks = loadTasks();
  const newTask = { id: uuidv4(), title: title.trim(), done: !!done, createdAt: new Date().toISOString() };
  tasks.push(newTask);
  saveTasks(tasks);
  res.status(201).json(newTask);
});

// PUT /api/tasks/:id - update a task (title/done)
app.put('/api/tasks/:id', (req, res) => {
  const id = req.params.id;
  const { title, done } = req.body;
  const tasks = loadTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  if (typeof title === 'string') tasks[idx].title = title.trim();
  if (typeof done === 'boolean') tasks[idx].done = done;
  tasks[idx].updatedAt = new Date().toISOString();
  saveTasks(tasks);
  res.json(tasks[idx]);
});

// DELETE /api/tasks/:id - delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const id = req.params.id;
  const tasks = loadTasks();
  const newTasks = tasks.filter(t => t.id !== id);
  if (newTasks.length === tasks.length) return res.status(404).json({ error: 'Task not found' });
  saveTasks(newTasks);
  res.json({ success: true });
});

// Fallback: serve index.html for client-side routing (if any)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

