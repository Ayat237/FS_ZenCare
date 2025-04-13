import Queue from "bull";
import redisConfig from "../config/redis.config.js";


const taskQueue = new Queue('taskQueue', redisConfig);

// Add task to the queue
export const addTaskToQueue = (taskType, data) => {
  taskQueue.add(taskType, data);
};

export default taskQueue;