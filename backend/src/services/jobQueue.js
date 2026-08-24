const { Queue, Worker } = require('bullmq');
const { redisEnabled } = require('../config/redis');

let notificationQueue;
let batchQueue;
let workers = [];

function connectionOptions() {
  const url = new URL(process.env.REDIS_URL);
  return { host: url.hostname, port: Number(url.port || 6379), username: url.username || undefined, password: url.password || undefined, maxRetriesPerRequest: null };
}

function getQueues() {
  if (!redisEnabled()) return null;
  const connection = connectionOptions();
  notificationQueue ||= new Queue('student-management-notifications', { connection, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: 100, removeOnFail: 100 } });
  batchQueue ||= new Queue('student-management-batches', { connection, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 20, removeOnFail: 50 } });
  return { notificationQueue, batchQueue };
}

async function enqueueNotification(data) {
  const queues = getQueues();
  if (!queues) return null;
  return queues.notificationQueue.add('email-notification', data);
}

async function enqueueBatchOperation(data) {
  const queues = getQueues();
  if (!queues) return null;
  return queues.batchQueue.add('batch-operation', data);
}

function startWorkers({ sendNotification, processBatch }) {
  const queues = getQueues();
  if (!queues) return [];
  const connection = connectionOptions();
  workers = [
    new Worker('student-management-notifications', async (job) => sendNotification(job.data), { connection }),
    new Worker('student-management-batches', async (job) => processBatch(job.data), { connection }),
  ];
  workers.forEach((worker) => worker.on('failed', (job, error) => console.error('Queue job failed', { queue: worker.name, jobId: job?.id, error: error.name })));
  return workers;
}

async function closeQueues() {
  await Promise.all(workers.map((worker) => worker.close()));
  workers = [];
  await Promise.all([notificationQueue?.close(), batchQueue?.close()].filter(Boolean));
  notificationQueue = undefined;
  batchQueue = undefined;
}

module.exports = { getQueues, enqueueNotification, enqueueBatchOperation, startWorkers, closeQueues };
