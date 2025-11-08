const Project = require("../Modals/Project");

// Create Project
exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, companyId: req.companyId });
    res.status(201).json({ success: true, message: "Project created", data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating project", error: err.message });
  }
};

// Get all Projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ companyId: req.companyId })
      .populate("assignedEmployees", "name email")
      .populate("tasks.assignedTo", "name email")
      .populate("tasks.comments.commentedBy", "name")
      .populate("tasks.timeLogs.employeeId", "name");

    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching projects", error: err.message });
  }
};

// Add Task to Project
exports.addTaskToProject = async (req, res) => {
  const { id } = req.params;
  const { title, description, assignedTo, dueDate } = req.body;

  try {
    const project = await Project.findOne({ _id: id, companyId: req.companyId });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const assignedArray = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
    const newTask = { title, description, assignedTo: assignedArray, dueDate, status: "pending", comments: [], timeLogs: [] };

    project.tasks.push(newTask);
    await project.save();

    res.status(201).json({ success: true, message: "Task added successfully", data: project.tasks[project.tasks.length - 1] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding task", error: err.message });
  }
};

// Get Project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, companyId: req.companyId })
      .populate("assignedEmployees", "name email")
      .populate("tasks.assignedTo", "name email")
      .populate("tasks.comments.commentedBy", "name")
      .populate("tasks.timeLogs.employeeId", "name");

    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching project", error: err.message });
  }
};

// Update Project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      req.body,
      { new: true }
    );
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    res.json({ success: true, message: "Project updated", data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating project", error: err.message });
  }
};

// Delete Project
exports.deleteProject = async (req, res) => {
  try {
    const deleted = await Project.findOneAndDelete({ _id: req.params.id, companyId: req.companyId });
    if (!deleted) return res.status(404).json({ success: false, message: "Project not found" });

    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting project", error: err.message });
  }
};

// Delete Task from Project
exports.deleteTaskFromProject = async (req, res) => {
  const { projectId, taskId } = req.params;
  try {
    const project = await Project.findOne({ _id: projectId, companyId: req.companyId });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const taskIndex = project.tasks.findIndex(task => task._id.toString() === taskId);
    if (taskIndex === -1) return res.status(404).json({ success: false, message: "Task not found in this project" });

    project.tasks.splice(taskIndex, 1);
    await project.save();

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting task", error: err.message });
  }
};

// Update Task Status
exports.updateTaskStatus = async (req, res) => {
  const { projectId, taskId } = req.params;
  const { status } = req.body;

  try {
    const project = await Project.findOne({ _id: projectId, companyId: req.companyId });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const task = project.tasks.id(taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    task.status = status;
    await project.save();

    res.json({ success: true, message: "Task status updated", data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating task status", error: err.message });
  }
};

// Add Comment to Task
exports.addCommentToTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  const { commentText, commentedBy } = req.body;

  try {
    const project = await Project.findOne({ _id: projectId, companyId: req.companyId });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const task = project.tasks.id(taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    task.comments.push({ commentText, commentedBy, commentedAt: new Date() });
    await project.save();

    const updated = await Project.findOne({ _id: projectId, companyId: req.companyId })
      .populate("tasks.comments.commentedBy", "name");

    const updatedTask = updated.tasks.id(taskId);

    res.json({ success: true, message: "Comment added", data: updatedTask.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding comment", error: err.message });
  }
};

// Add Time Log to Task
exports.addTimeLogToTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  const { employeeId, hours } = req.body;

  try {
    const project = await Project.findOne({ _id: projectId, companyId: req.companyId });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const task = project.tasks.id(taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    task.timeLogs.push({ employeeId, hours, logDate: new Date() });
    await project.save();

    res.json({ success: true, message: "Time log added", data: task.timeLogs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding time log", error: err.message });
  }
};
