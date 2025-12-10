// public/main.js - very small frontend using fetch API
const API = '/api/tasks';
const taskList = document.getElementById('taskList');
const newTaskInput = document.getElementById('newTask');
const addBtn = document.getElementById('addBtn');

addBtn.addEventListener('click', createTask);
newTaskInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') createTask();
});

function createTask() {
  const title = newTaskInput.value.trim();
  if (!title) return;
  fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  }).then(r => r.json()).then(() => {
    newTaskInput.value = '';
    loadTasks();
  }).catch(err => console.error(err));
}

function loadTasks() {
  fetch(API).then(r => r.json()).then(tasks => {
    taskList.innerHTML = '';
    if (!Array.isArray(tasks)) return;
    tasks.slice().reverse().forEach(renderTask); // show newest first
  }).catch(err => console.error(err));
}

function renderTask(task) {
  const li = document.createElement('li');
  li.dataset.id = task.id;
  li.className = task.done ? 'done' : '';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = !!task.done;
  checkbox.addEventListener('change', () => toggleDone(task.id, checkbox.checked));

  const span = document.createElement('span');
  span.textContent = task.title;

  const spacer = document.createElement('div');
  spacer.className = 'spacer';

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.className = 'small';
  editBtn.addEventListener('click', () => editTask(task.id, task.title));

  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete';
  delBtn.className = 'small';
  delBtn.addEventListener('click', () => deleteTask(task.id));

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(spacer);
  li.appendChild(editBtn);
  li.appendChild(delBtn);

  taskList.appendChild(li);
}

function toggleDone(id, isDone) {
  fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done: isDone })
  }).then(() => loadTasks());
}

function editTask(id, oldTitle) {
  const newTitle = prompt('Edit task:', oldTitle);
  if (newTitle === null) return;
  fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: newTitle })
  }).then(() => loadTasks());
}

function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  fetch(`${API}/${id}`, { method: 'DELETE' }).then(() => loadTasks());
}

// initial load
loadTasks();
