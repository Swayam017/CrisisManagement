const Queue = require("bull");

const bookingQueue = new Queue("bookingQueue", {
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT), 
    password: process.env.REDIS_PASSWORD
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: 5000
  }
});

module.exports = bookingQueue;