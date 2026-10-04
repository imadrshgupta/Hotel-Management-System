import { Queue, Worker } from 'bullmq';
import { env } from './env';
import { logger } from './logger';

const connection = {
  host: env.QUEUE.HOST,
  port: env.QUEUE.PORT,
};

const queues: Map<string, Queue> = new Map();

export function getQueue(name: string): Queue {
  if (!queues.has(name)) {
    const queue = new Queue(name, {
      connection,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });
    queues.set(name, queue);
  }
  return queues.get(name)!;
}

export function createWorker(
  queueName: string,
  processor: (jobData: any) => Promise<any>
): Worker {
  const worker = new Worker(
    queueName,
    async (job) => {
      logger.info(`Processing job ${job.id} in queue ${queueName}`);
      try {
        const result = await processor(job.data);
        logger.info(`Job ${job.id} completed in queue ${queueName}`);
        return result;
      } catch (error) {
        logger.error(`Job ${job.id} failed in queue ${queueName}:`, error);
        throw error;
      }
    },
    {
      connection,
      concurrency: 5,
    }
  );

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed in queue ${queueName}:`, err);
  });

  worker.on('completed', (job) => {
    logger.debug(`Job ${job.id} completed in queue ${queueName}`);
  });

  return worker;
}

export async function closeQueues(): Promise<void> {
  for (const [name, queue] of queues) {
    await queue.close();
    logger.info(`Queue "${name}" closed`);
  }
  queues.clear();
}

// Queue names
export const QUEUE_NAMES = {
  EMAIL: 'email',
  SMS: 'sms',
  WHATSAPP: 'whatsapp',
  INVOICE: 'invoice',
  REPORT: 'report',
  NOTIFICATION: 'notification',
  SCHEDULED: 'scheduled',
  INTEGRATION: 'integration',
} as const;
