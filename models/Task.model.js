const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  taskId: { type: String, required: true, unique: true },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "done"],
    default: "pending",
  },
  Errors: [{ row: Number, col: Number }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Task", taskSchema);
