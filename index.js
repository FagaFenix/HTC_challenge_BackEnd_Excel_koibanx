const express = require("express");
const router = require("./routes/routes");
const cors = require("cors");
const app = express();
const port = 3000;
const { MongoDBGridFS } = require("./config/db/mongoDb");
const MongoDb = new MongoDBGridFS(
  "kinbanxDB",
  "excelUploads",
  "mongodb://localhost:27017"
);

// Middleware
app.use(express.raw());
app.use(cors());

MongoDb.connect();

app.use("/api", router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
