const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/auth");
const companyMiddleware = require("../Middleware/companyMiddleware"); // ✅ added
const projectController = require("../Controllers/projectController");
const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");

// ✅ companyMiddleware + verifyToken apply to all routes
router.use(verifyToken, companyMiddleware,subscriptionMiddleware,moduleAccess("projects"), );

// ✅ same endpoints, nothing changed
router.post("/projects", projectController.createProject);
router.get("/", projectController.getAllProjects);
router.get("/:id", projectController.getProjectById);
router.put("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

router.post("/:id/tasks", projectController.addTaskToProject);
router.delete(
  "/:projectId/tasks/:taskId",
  projectController.deleteTaskFromProject
);
router.put(
  "/:projectId/tasks/:taskId/status",
  projectController.updateTaskStatus
);
router.post(
  "/:projectId/tasks/:taskId/comments",
  projectController.addCommentToTask
);
router.post(
  "/:projectId/tasks/:taskId/timelogs",
  projectController.addTimeLogToTask
);

module.exports = router;
