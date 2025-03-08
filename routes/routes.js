const express = require("express");
const router = express.Router();

const { UploadStream } = require("../controllers/stream");

const { getTaskById } = require("../controllers/taskController");

router.post("/stream", UploadStream);
router.get("/task/:taskId", getTaskById);

module.exports = router;
