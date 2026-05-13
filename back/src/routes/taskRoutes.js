const express = require("express");
const {
  fetchTasks,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
  updateNumericProgress,
} = require("../controllers/taskController");

const buildTaskRoutes = (env) => {
  const router = express.Router();
  const { protect, requirePermissions } = require("../middlewares/authMiddleware");

  const auth = protect(env.jwtSecret);

  // PUT /tasks/reorder - Reorder tasks (must come before /:id route, requires manage_tasks)
  router.put("/reorder", auth, requirePermissions("manage_tasks"), reorderTasks);

  // GET /tasks - Fetch all tasks (requires view_tasks permission)
  router.get("/", auth, requirePermissions("view_tasks"), fetchTasks);

  // GET /tasks/:id - Fetch a single task (requires view_tasks permission)
  router.get("/:id", auth, requirePermissions("view_tasks"), fetchTaskById);

  // POST /tasks - Create a new task (requires manage_tasks permission)
  router.post("/", auth, requirePermissions("manage_tasks"), createTask);

  // PUT /tasks/:id - Update a task (requires manage_tasks permission)
  router.put("/:id", auth, requirePermissions("manage_tasks"), updateTask);

  // PATCH /tasks/:id/progress - Update numeric task progress (requires manage_tasks OR assigned to task)
  router.patch("/:id/progress", auth, requirePermissions("manage_tasks"), updateNumericProgress);

  // DELETE /tasks/:id - Delete a task (requires manage_tasks permission)
  router.delete("/:id", auth, requirePermissions("manage_tasks"), deleteTask);

  return router;
};

module.exports = buildTaskRoutes;
