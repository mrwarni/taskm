const STORAGE_KEY = "task-manager.tasks";

const state = {
  tasks: loadTasks(),
  filter: "all",
};

const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");
const template = document.getElementById("taskTemplate");
const countLabel = document.getElementById("taskCount");
const clearCompletedButton = document.getElementById("clearCompleted");
const filterButtons = [...document.querySelectorAll(".filter-btn")];

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  state.tasks.push({
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: Date.now(),
  });

  input.value = "";
  saveAndRender();
});

list.addEventListener("click", (event) => {
  const taskItem = event.target.closest(".task-item");
  if (!taskItem) return;
  const taskId = taskItem.dataset.id;

  if (event.target.matches(".delete-btn")) {
    state.tasks = state.tasks.filter((task) => task.id !== taskId);
    saveAndRender();
  }
});

list.addEventListener("change", (event) => {
  if (!event.target.matches(".toggle")) return;
  const taskItem = event.target.closest(".task-item");
  const task = state.tasks.find((entry) => entry.id === taskItem.dataset.id);
  if (!task) return;

  task.completed = event.target.checked;
  saveAndRender();
});

clearCompletedButton.addEventListener("click", () => {
  state.tasks = state.tasks.filter((task) => !task.completed);
  saveAndRender();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    filterButtons.forEach((element) => {
      const selected = element === button;
      element.classList.toggle("active", selected);
      element.setAttribute("aria-selected", String(selected));
    });
    render();
  });
});

function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  render();
}

function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function filteredTasks() {
  if (state.filter === "active") return state.tasks.filter((task) => !task.completed);
  if (state.filter === "completed") return state.tasks.filter((task) => task.completed);
  return state.tasks;
}

function render() {
  list.replaceChildren();

  const visibleTasks = filteredTasks();
  visibleTasks.forEach((task) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = task.id;
    node.classList.toggle("completed", task.completed);
    node.querySelector(".task-text").textContent = task.text;
    node.querySelector(".toggle").checked = task.completed;
    list.append(node);
  });

  const activeCount = state.tasks.filter((task) => !task.completed).length;
  countLabel.textContent = `${activeCount} task${activeCount === 1 ? "" : "s"} left`;
}

render();
