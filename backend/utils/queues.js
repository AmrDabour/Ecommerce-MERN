const { Queue, Worker } = require('bullmq');
const { winstonLogger } = require('./logger.js');
const sendEmail = require('./email.js');

const redisOptions = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
};

// Create Email Queue
const emailQueue = new Queue('email-queue', { connection: redisOptions });

// Worker for Email Queue
const emailWorker = new Worker('email-queue', async job => {
  winstonLogger.info(`Processing email job ${job.id} for ${job.data.email}`);
  try {
    await sendEmail(job.data);
    winstonLogger.info(`Successfully sent email job ${job.id}`);
  } catch (err) {
    winstonLogger.error(`Failed email job ${job.id}`, { error: err.message });
    throw err; // retry mechanism
  }
}, { connection: redisOptions });

emailWorker.on('failed', (job, err) => {
  winstonLogger.error(`Job ${job.id} failed with error ${err.message}`);
});

module.exports = { emailQueue };
