const Project = require("../Modals/Project");

// Create Project
exports.createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, message: "Project created", data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating project", error: err.message });
  }
};

// Get All Projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("assignedEmployees", "name email");
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching projects", error: err.message });
  }
};

// Add a new task to a project
exports.addTaskToProject = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignedTo, dueDate } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const newTask = {
      title,
      description,
      assignedTo,
      dueDate,
      status: "pending",
      comments: [],
      timeLogs: []
    };

    project.tasks.push(newTask);
    await project.save();

    res.status(201).json({
      success: true,
      message: "Task added to project",
      data: project.tasks[project.tasks.length - 1] // latest added
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding task", error: err.message });
  }
};


// Get Single Project
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
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
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: "Project updated", data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating project", error: err.message });
  }
};

// Delete Project
exports.deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting project", error: err.message });
  }
};

// 1. Update Task Status
exports.updateTaskStatus = async (req, res) => {
  const { projectId, taskId } = req.params;
  const { status } = req.body;

  try {
    const project = await Project.findById(projectId);
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

// 2. Add Comment to Task
exports.addCommentToTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  const { commentText, commentedBy } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const task = project.tasks.id(taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    task.comments.push({ commentText, commentedBy, commentedAt: new Date() });
    await project.save();

    res.json({ success: true, message: "Comment added", data: task.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding comment", error: err.message });
  }
};

// 3. Add Time Log to Task
exports.addTimeLogToTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  const { employeeId, hours } = req.body;

  try {
    const project = await Project.findById(projectId);
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
