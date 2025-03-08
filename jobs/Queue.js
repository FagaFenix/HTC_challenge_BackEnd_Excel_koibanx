const { Queue } = require("bullmq");
const { RedisClient } = require("../config/db/redis");

// Connect to Redis
const connection = new RedisClient({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

const fileQueue = new Queue("file-processing", { connection });

fileQueue.drain(); // Removes all jobs that are waiting or delayed
fileQueue.clean(0, "completed"); // Removes all completed jobs
fileQueue.clean(0, "failed"); // Removes all failed jobs
fileQueue.obliterate({ force: true }); // Removes everything, including active jobs

module.exports = fileQueue;
