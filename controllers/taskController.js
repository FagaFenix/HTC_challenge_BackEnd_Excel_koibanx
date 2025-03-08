const { Task } = require("../jobs/task.job");

const getTaskById = async (req, res) => {
  try {
    const response = await new Task().getTask(req.params.taskId);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

module.exports = {
  getTaskById,
};
