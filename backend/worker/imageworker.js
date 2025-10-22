import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectRabbitMQ, receiveFromQueue } from "../utils/rabbitmq.js";
 import { Image } from "../db.js";

dotenv.config();

(async () => {
  await connectRabbitMQ();
  console.log("Worker started, waiting for messages...");

  await receiveFromQueue(async (msg) => {
    console.log("Processing image:", msg.key);
    // Example: Save to MongoDB (pseudo)
     await Image.create(msg);

    // or generate thumbnail / trigger another process
  });
})();
