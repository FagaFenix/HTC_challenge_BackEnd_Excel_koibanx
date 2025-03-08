const xlsx = require("xlsx");
const { Transform } = require("stream");
const { MongoDBGridFS } = require("../config/db/mongoDb");
const { Task } = require("../jobs/task.job");
const busboy = require("busboy");
const { rowErrorsValidator } = require("../services/rowErrorsValidator");
const fileQueue = require("../jobs/Queue");

const UploadStream = async (req, res) => {
  try {
    const { query } = req;
    const bucket = new MongoDBGridFS();
    const TaskJob = new Task();

    const newTask = await TaskJob.createTask();

    res.json({
      message: `The file is going to be uploaded to MongoDB`,
      taskId: newTask.taskId,
    });

    // Use busboy to handle file uploads via streaming
    const bb = busboy({ headers: req.headers });

    bb.on("file", (fieldname, file, info) => {
      const { filename } = info;

      // Create a GridFS upload stream with the original filename
      const uploadStream = bucket.getUploadStream(filename);

      // Read Excel file as a stream
      const buffers = [];
      file.on("data", (chunk) => buffers.push(chunk));

      TaskJob.updateTask({ status: "processing" });

      file.on("end", () => {
        console.log("File upload completed");
        const fileBuffer = Buffer.concat(buffers);
        const workbook = xlsx.read(fileBuffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert sheet to streaming JSON
        const stream = xlsx.stream.to_json(sheet, { raw: false });

        let rowCounterForTrasnformSream = 1;
        let rowErrors = [];

        // Transform stream: Process data
        const transformStream = new Transform({
          objectMode: true,
          writableObjectMode: true,
          transform(row, _, callback) {
            const FixRowAndErrors = rowErrorsValidator(
              { ...row },
              rowCounterForTrasnformSream++
            );
            rowErrors.push(FixRowAndErrors.errors);
            callback(null, JSON.stringify(row) + "\n");
          },
        });

        // Pipe transformed data into MongoDB GridFS
        stream.pipe(transformStream).pipe(uploadStream);

        uploadStream.on("finish", async () => {
          TaskJob.updateTask({
            status: "Done",
            fileId: uploadStream.id,
            Errors: rowErrors.flat(),
          });
          await fileQueue.add("processExcel", {
            fileId: uploadStream.id,
            taskId: newTask.taskId,
          });
          console.log(`File ${filename} added to the Queue`);
        });

        uploadStream.on("error", (err) => {
          console.error(err);
          res.status(500).json({ message: "Upload failed" });
        });
      });
    });

    req.pipe(bb); // Pipe request data into busboy
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing file" });
  }
};

module.exports = {
  UploadStream,
};
