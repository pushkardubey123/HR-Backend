const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/auth");
const projectController = require("../Controllers/projectController");

// ✅ Project CRUD Routes
router.post("/projects", verifyToken, projectController.createProject);           // Create project
router.get("/", verifyToken, projectController.getAllProjects);                  // Get all projects
router.get("/:id", verifyToken, projectController.getProjectById);               // Get single project
router.put("/:id", verifyToken, projectController.updateProject);                // Update project
router.delete("/:id", verifyToken, projectController.deleteProject);             // Delete project

// ✅ Task Routes (within project)
router.post("/:id/tasks", verifyToken, projectController.addTaskToProject);                      // Add task
router.delete("/:projectId/tasks/:taskId", verifyToken, projectController.deleteTaskFromProject); // Delete task
router.put("/:projectId/tasks/:taskId/status", verifyToken, projectController.updateTaskStatus); // Update task status
router.post("/:projectId/tasks/:taskId/comments", verifyToken, projectController.addCommentToTask); // Add comment
router.post("/:projectId/tasks/:taskId/timelogs", verifyToken, projectController.addTimeLogToTask); // Add timelog

module.exports = router;
