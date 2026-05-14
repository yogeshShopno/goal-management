const express = require("express");
const {
  fetchActions,
  fetchActionById,
  createAction,
  updateAction,
  deleteAction,
  addActionUpdate,
} = require("../controllers/actionController");

const buildActionRoutes = (env) => {
  const router = express.Router();
  const { protect, requirePermissions } = require("../middlewares/authMiddleware");

  const auth = protect(env.jwtSecret);

  // GET /actions - Fetch all actions (requires view_actions permission)
  router.get("/", auth, requirePermissions("view_actions"), fetchActions);

  // GET /actions/:id - Fetch a single action (requires view_actions permission)
  router.get("/:id", auth, requirePermissions("view_actions"), fetchActionById);

  // POST /actions - Create a new action (requires manage_actions permission)
  router.post("/", auth, requirePermissions("manage_actions"), createAction);

  // PUT /actions/:id - Update an action (requires manage_actions permission)
  router.put("/:id", auth, requirePermissions("manage_actions"), updateAction);

  // DELETE /actions/:id - Delete an action (requires manage_actions permission)
  router.delete("/:id", auth, requirePermissions("manage_actions"), deleteAction);

  // POST /actions/:id/updates - Add an update to an action
  router.post("/:id/updates", auth, addActionUpdate);

  return router;
};

module.exports = buildActionRoutes;
