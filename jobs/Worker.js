const { Worker } = require("bullmq");
const { RedisClient } = require("../config/db/redis");
const { Task } = require("./task.job");
const { MongoDBGridFS } = require("../config/db/mongoDb");
const xlsx = require("xlsx");

const connection = new RedisClient({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "file-processing",
  async (job) => {
    const { fileId, taskId } = job.data;
    console.log({ fileId, taskId });
    const bucket = new MongoDBGridFS(
      "kinbanxDB",
      "excelUploads",
      "mongodb://localhost:27017"
    );
    await bucket.connect();

    console.log(`Processing file: ${fileId}`);

    // Download file from GridFS
    const downloadStream = bucket.downLoadStreamByName(fileId);
    const chunks = [];

    downloadStream.on("data", (chunk) => chunks.push(chunk));
    downloadStream.on("end", async () => {
      const buffer = Buffer.concat(chunks);
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = xlsx.utils.sheet_to_json(sheet, { raw: false });

      let errors = [];

      // Process each row
      jsonData.forEach((row, rowIndex) => {
        if (!row.Nombre || !row.Edad || !row.Nums) {
          if (!row.Nombre) errors.push({ row: rowIndex + 1, col: 1 });
          if (!row.Edad) errors.push({ row: rowIndex + 1, col: 2 });
          if (!row.Nums) errors.push({ row: rowIndex + 1, col: 3 });
        }
      });

      // Update task with status and errors
      await Task.updateTask({ status: "Done", fileId, errors });

      console.log(`Finished processing task ${taskId}`);
    });
  },
  { connection }
);

worker.on("completed", (job) => console.log(`Job ${job.id} completed!`));
worker.on("failed", (job, err) =>
  console.error(`Job ${job.id} failed: ${err}`)
);
