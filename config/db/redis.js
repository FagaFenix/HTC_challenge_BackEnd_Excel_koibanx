const { Redis } = require("ioredis");

class RedisClient {
  constructor({
    host = "127.0.0.1",
    port = 6379,
    maxRetriesPerRequest = null,
  }) {
    this.host = host;
    this.port = port;
    this.maxRetriesPerRequest = maxRetriesPerRequest;
    this.client = new Redis({
      host: this.host,
      port: this.port,
      maxRetriesPerRequest: this.maxRetriesPerRequest,
    });
  }
  å;

  async close() {
    await this.client.quit();
    console.log("Redis connection closed");
  }
}
module.exports = { RedisClient };
