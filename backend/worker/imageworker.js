import amqp from "amqplib";
import dotenv from "dotenv";
import { processImageJob } from "../services/imageProcessor.js";

dotenv.config();

const queueName = "image_tasks";

async function startWorker() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_CONNECTION);
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });
    console.log("RabbitMQ image worker listening...");

    channel.consume(
      queueName,
      async (msg) => {
        if (!msg) return;

        const data = JSON.parse(msg.content.toString());
        console.log("Processing image job:", data.imageId || data.key);

        try {
          await processImageJob(data);
          channel.ack(msg);
        } catch (err) {
          console.error("Worker error:", err.message);
          channel.nack(msg, false, false);
        }
      },
      { noAck: false },
    );
  } catch (error) {
    console.error("Worker setup error:", error);
  }
}

startWorker();
