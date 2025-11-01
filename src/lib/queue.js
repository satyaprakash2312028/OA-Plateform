// src/lib/queue.js
const amqp = require('amqplib');
const dotenv = require('dotenv');
dotenv.config();

const CLOUDAMQP_URL = process.env.CLOUDAMQP_URL;
const QUEUE_NAME = 'submissions'; // Must match your worker's queue name

let channel = null;

async function connectQueue() {
  try {
    const connection = await amqp.connect(CLOUDAMQP_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log('[API] RabbitMQ connected and queue asserted.');
  } catch (error) {
    console.error('[API] Failed to connect to RabbitMQ:', error);
    // Keep retrying
    setTimeout(connectQueue, 5000);
  }
}

async function sendSubmissionToQueue(submission) {
  if (!channel) {
    console.error('[API] RabbitMQ channel not available. Dropping submission.');
    return;
  }
  try {
    const submissionPayload = {
      submissionId: submission._id.toString(),
      code: submission.code,
      language: submission.language,
      problemId: submission.problem.toString(),
      // Add other details the worker needs
    };

    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(submissionPayload)), {
      persistent: true,
    });
    console.log(`[API] Sent submission ${submission._id} to queue.`);
  } catch (error) {
    console.error(`[API] Failed to send submission ${submission._id} to queue:`, error);
  }
}

module.exports = { connectQueue, sendSubmissionToQueue };