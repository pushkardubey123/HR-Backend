const cron = require("node-cron");
const Project = require("../Modals/Project");
const sendNotification = require("./sendNotification");

const checkTaskDeadlines = async () => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const projects = await Project.find().populate("tasks.assignedTo", "name email");

    for (const project of projects) {
      for (const task of project.tasks) {
        if (!task.dueDate || task.status === "completed") continue;

        const dueDate = new Date(task.dueDate);
        const dueStr = dueDate.toISOString().split("T")[0];

        if (dueDate <= today) {
          for (const assignee of task.assignedTo) {
            await sendNotification({
              title: dueStr === todayStr ? "Task Due Today" : "Task Overdue",
              message: `Task "${task.title}" in project "${project.name}" is ${
                dueStr === todayStr ? "due today" : `overdue (was due on ${dueStr})`
              }.`,
              recipient: assignee._id,
              type: "task",
              sendEmailFlag: false,
            });
          }
        }
      }
    }
  } catch (err) {
     res.json({ success: false, error: true, message: "ask Deadline Reminder Error", code: 500 });
  }
};

cron.schedule("0 10 * * *", checkTaskDeadlines);
checkTaskDeadlines();

module.exports = checkTaskDeadlines;
