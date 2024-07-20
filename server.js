const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let tasks = [];

// Serve static files from the 'public' folder
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("a user connected");

  // Send existing tasks to the new user
  socket.emit("initialTasks", tasks);

  // Listen for new tasks
  socket.on("newTask", (task) => {
    tasks.push(task);
    io.emit("updateTasks", tasks);
  });

  // Listen for task updates
  socket.on("updateTask", (updatedTask) => {
    tasks = tasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    );
    io.emit("updateTasks", tasks);
  });

  // Listen for task deletions
  socket.on("deleteTask", (taskId) => {
    tasks = tasks.filter((task) => task.id !== taskId);
    io.emit("updateTasks", tasks);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
