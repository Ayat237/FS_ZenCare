import { createClient } from "redis";
import redisConfig from "../config/redis.config.js";
import { Logger } from "./logger.utils.js";

class RedisService {
  constructor() {
    this.client = createClient({
      socket: redisConfig,
    });
    this.logger = new Logger();


    this.client.on("error", (err) =>
      this.logger.error("Redis Client Error", err)
    );

    this.client.on('connect', () => {
      this.logger.info('Connected to Redis');
    });

    this.connect();
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async SET(key, value, ttlInSeconds) {
    await this.connect();
    await this.client.set(key, value, { EX: ttlInSeconds });
  }
  async GET(key) {
    await this.connect();
    return await this.client.get(key);
  }

  async DEL(key) {
    await this.connect();
    await this.client.del(key);
  }
  async KEYS(pattern) {
    await this.connect();
    return await this.client.keys(pattern);
  }
}


const redisClient  = new RedisService();
export default redisClient;
