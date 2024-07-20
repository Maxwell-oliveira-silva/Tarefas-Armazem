const socket = io();

const taskForm = document.getElementById("taskForm");
const taskTable = document.getElementById("taskTable").querySelector("tbody");

const renderTasks = (tasks) => {
  taskTable.innerHTML = "";
  tasks.forEach((task) => {
    const row = taskTable.insertRow();
    row.dataset.id = task.id;
    row.insertCell(0).textContent = task.fornecedor;
    row.insertCell(1).textContent = task.descricao;
    row.insertCell(2).textContent = task.codigo;
    row.insertCell(3).textContent = task.status;
    row.insertCell(4).textContent = task.dateTime;

    const actionsCell = row.insertCell(5);
    const changeStatusBtn = document.createElement("button");
    changeStatusBtn.textContent = "Alterar Status";
    changeStatusBtn.onclick = () => changeStatus(task.id);
    actionsCell.appendChild(changeStatusBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Deletar";
    deleteBtn.onclick = () => deleteTask(task.id);
    actionsCell.appendChild(deleteBtn);
  });
};

const addTask = (e) => {
  e.preventDefault();
  const fornecedor = document.getElementById("fornecedor").value;
  const descricao = document.getElementById("descricao").value;
  const codigo = document.getElementById("codigo").value;
  const status = document.getElementById("status").value;
  const dateTime = new Date().toLocaleString();
  const id = Math.random().toString(36).substr(2, 9);

  const newTask = { id, fornecedor, descricao, codigo, status, dateTime };
  socket.emit("newTask", newTask);
  taskForm.reset();
};

const changeStatus = (taskId) => {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks.find((task) => task.id === taskId);
  if (!task) return;

  const statuses = [
    "Recebido",
    "Conferência",
    "Aguardando Fiscal",
    "Aguardando Qualidade",
    "Aguardando Armazenagem",
    "Armazenado",
  ];
  const select = document.createElement("select");
  statuses.forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.text = status;
    if (status === task.status) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = "Confirmar";
  confirmBtn.onclick = () => {
    task.status = select.value;
    task.dateTime = new Date().toLocaleString();
    socket.emit("updateTask", task);
  };

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancelar";
  cancelBtn.onclick = () => {
    loadTasks();
  };

  const actionsCell = taskTable.querySelector(`tr[data-id='${taskId}']`)
    .cells[5];
  actionsCell.innerHTML = "";
  actionsCell.appendChild(select);
  actionsCell.appendChild(confirmBtn);
  actionsCell.appendChild(cancelBtn);
};

const deleteTask = (taskId) => {
  socket.emit("deleteTask", taskId);
};

socket.on("initialTasks", (tasks) => {
  renderTasks(tasks);
});

socket.on("updateTasks", (tasks) => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks(tasks);
});

taskForm.addEventListener("submit", addTask);
