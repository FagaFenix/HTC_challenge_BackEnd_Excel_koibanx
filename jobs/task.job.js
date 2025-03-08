const task = require("../models/Task.model");
const { v4: uuidv4 } = require("uuid");

class Task {
  constructor() {
    this.taskId = uuidv4();
    this.status = "pending";
    this.Errors = [];
  }

  async createTask() {
    try {
      return await task.create({
        taskId: this.taskId,
        fileId: null,
        status: this.status,
        Errors: [],
      });
    } catch (error) {
      console.error("Error creating task:", error);
    }
  }
  async getTask(TaskId) {
    try {
      return await task.findOne({ taskId: TaskId });
    } catch (error) {
      console.error("Error getting task:", error);
    }
  }
  async updateTask({ status, fileId, errors }) {
    try {
      return await task.findOneAndUpdate(
        { taskId: this.taskId },
        {
          status: status,
          fileId: fileId ? fileId : null,
          Errors: errors ? errors : [],
        }
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }
}

module.exports = {
  Task,
};
