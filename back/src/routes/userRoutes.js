const express = require("express");
const { getAllUsers, updateUserRole } = require("../controllers/userController");
const {
  protect,
  authorizeRoles,
  requirePermissions,
} = require("../middlewares/authMiddleware");
const { ROLES } = require("../utils/roles");

const buildUserRoutes = (env) => {
  const router = express.Router();
  const auth = protect(env.jwtSecret);

  router.get(
    "/",
    auth,
    requirePermissions("view_users"),
    authorizeRoles(ROLES.ADMIN, ROLES.MANAGER),
    getAllUsers
  );
  router.patch(
    "/:id/role",
    auth,
    requirePermissions("manage_users"),
    authorizeRoles(ROLES.ADMIN),
    updateUserRole
  );

  return router;
};

module.exports = buildUserRoutes;
