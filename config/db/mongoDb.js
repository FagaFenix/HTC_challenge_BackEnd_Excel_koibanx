const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

class MongoDBGridFS {
  constructor(dbName, bucketName, uri = "mongodb://localhost:27017") {
    this.uri = uri;
    this.dbName = dbName;
    this.bucketName = bucketName;
    if (!MongoDBGridFS.instance) {
      MongoDBGridFS.instance = this;
    }
    return MongoDBGridFS.instance;
  }

  async connect() {
    try {
      await mongoose.connect(this.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: this.dbName,
      });
      console.log("Connected to MongoDB");
      this.bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: this.bucketName,
      });
    } catch (error) {
      console.error("MongoDB connection error:", error);
    }
  }

  getUploadStream(filename) {
    if (!this.bucket) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.bucket.openUploadStream(filename);
  }

  downLoadStreamByName(fileId) {
    // const _id = new ObjectId(fileId);
    console.log("LOOOOOK", JSON.stringify(fileId));
    return this.bucket.openDownloadStream(fileId);
  }

  async close() {
    await this.client.close();
    console.log("MongoDB connection closed");
  }
}

module.exports = { MongoDBGridFS };
