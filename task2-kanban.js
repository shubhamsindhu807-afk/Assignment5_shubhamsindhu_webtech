// Task 2 — Data-driven Kanban board
const MAX_IN_PROGRESS_CARDS = 3;
const taskData = [
  { id: "t01", title: "Review JavaScript basics", tag: "JavaScript", priority: "high", status: "todo", minutes: 25, required: true },
  { id: "t02", title: "Practice array methods", tag: "JavaScript", priority: "high", status: "progress", minutes: 35, required: true },
  { id: "t03", title: "Sketch page layout", tag: "Design", priority: "medium", status: "todo", minutes: 20, required: false },
  { id: "t04", title: "Read DOM notes", tag: "Research", priority: "medium", status: "progress", minutes: 30, required: true },
  { id: "t05", title: "Write project summary", tag: "Writing", priority: "low", status: "todo", minutes: 15, required: false },
  { id: "t06", title: "Test form errors", tag: "JavaScript", priority: "high", status: "done", minutes: 40, required: true },
  { id: "t07", title: "Choose color palette", tag: "Design", priority: "low", status: "done", minutes: 15, required: false },
  { id: "t08", title: "Check accessibility labels", tag: "Research", priority: "high", status: "todo", minutes: 25, required: true },
  { id: "t09", title: "Polish card spacing", tag: "Design", priority: "medium", status: "progress", minutes: 20, required: false },
  { id: "t10", title: "Document test cases", tag: "Writing", priority: "medium", status: "todo", minutes: 30, required: true },
  { id: "t11", title: "Verify restart behavior", tag: "JavaScript", priority: "high", status: "done", minutes: 20, required: true },
  { id: "t12", title: "Review final checklist", tag: "Research", priority: "low", status: "todo", minutes: 10, required: false }
];

const boardElement = document.querySelector("#kanban-board");
const tagFilter = document.querySelector("#tag-filter");
const prioritySort = document.querySelector("#priority-sort");
const boardMessage = document.querySelector("#board-message");
const statusContainers = {
  todo: document.querySelector("#todo-list"),
  progress: document.querySelector("#progress-list"),
  done: document.querySelector("#done-list")
};
const priorityRank = { high: 3, medium: 2, low: 1 };

function visibleTasks() {
  let items = taskData.filter((task) => tagFilter.value === "all" || task.tag === tagFilter.value);
  if (prioritySort.value === "high") {
    items = items.slice().sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority]);
  } else if (prioritySort.value === "low") {
    items = items.slice().sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  }
  return items;
}

function makeTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";
  card.dataset.taskId = task.id;

  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = task.tag;
  const title = document.createElement("h4");
  title.textContent = task.title;
  const details = document.createElement("p");
  details.textContent = `${task.minutes} min · ${task.required ? "Required" : "Optional"}`;
  const priority = document.createElement("p");
  priority.className = `priority priority-${task.priority}`;
  priority.textContent = `${task.priority[0].toUpperCase()}${task.priority.slice(1)} priority`;

  const actions = document.createElement("div");
  actions.className = "card-actions";
  const destinations = [
    { status: "todo", label: "To do" },
    { status: "progress", label: "In progress" },
    { status: "done", label: "Done" }
  ];
  for (const destination of destinations) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = "move";
    button.dataset.destination = destination.status;
    button.textContent = destination.label;
    button.disabled = destination.status === task.status;
    button.setAttribute("aria-label", `Move ${task.title} to ${destination.label}`);
    actions.append(button);
  }

  card.append(tag, title, details, priority, actions);
  return card;
}

function calculateFinishedCount() {
  let finished = 0;
  for (const task of taskData) {
    if (task.status === "done") finished += 1;
  }
  return finished;
}

function renderBoard() {
  for (const container of Object.values(statusContainers)) {
    container.replaceChildren();
  }

  const tasks = visibleTasks();
  for (const task of tasks) {
    const container = statusContainers[task.status];
    container.append(makeTaskCard(task));
  }

  for (const [status, container] of Object.entries(statusContainers)) {
    if (container.children.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = tasks.length === 0 ? "No tasks match this filter." : "No cards in this column.";
      container.append(empty);
    }
    const countElement = document.querySelector(`#${status === "todo" ? "todo" : status === "progress" ? "progress" : "done"}-count`);
    const count = taskData.filter((task) => task.status === status).length;
    countElement.textContent = status === "progress" ? `${count} / ${MAX_IN_PROGRESS_CARDS}` : String(count);
  }

  const finished = calculateFinishedCount();
  const percent = Math.round((finished / taskData.length) * 100);
  document.querySelector("#progress-text").textContent = `${finished} of ${taskData.length} · ${percent}%`;
  document.querySelector("#progress-fill").style.width = `${percent}%`;
  document.querySelector("#progress-bar").setAttribute("aria-valuenow", String(finished));
}

function moveTask(taskId, destination) {
  const task = taskData.find((item) => item.id === taskId);
  if (!task || !Object.hasOwn(statusContainers, destination)) {
    boardMessage.textContent = "That action is not valid.";
    boardMessage.className = "message-line is-error";
    return;
  }
  if (destination === "progress" && task.status !== "progress" &&
      taskData.filter((item) => item.status === "progress").length >= MAX_IN_PROGRESS_CARDS) {
    boardMessage.textContent = `Move blocked: In progress already has ${MAX_IN_PROGRESS_CARDS} cards. Move one out first.`;
    boardMessage.className = "message-line is-error";
    return;
  }
  task.status = destination;
  boardMessage.textContent = `“${task.title}” moved to ${destination === "todo" ? "To do" : destination === "progress" ? "In progress" : "Done"}.`;
  boardMessage.className = "message-line is-success";
  renderBoard();
}

// One delegated listener handles buttons on every generated task card.
boardElement.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action='move']");
  if (!button || !boardElement.contains(button)) return;
  const card = button.closest("[data-task-id]");
  if (card) moveTask(card.dataset.taskId, button.dataset.destination);
});
tagFilter.addEventListener("change", renderBoard);
prioritySort.addEventListener("change", renderBoard);
renderBoard();
