import amqp from "amqplib";
import mongoose from "mongoose";
import sharp from "sharp";
import fs from "fs";
import s3 from "../storage.js";
import { Image } from "../models/Image.js";
import dotenv from "dotenv";

dotenv.config();

const queueName = "image_tasks";

async function startWorker() {
  try {
    // Connect MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(" MongoDB connected (Worker)");

    // Connect RabbitMQ
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName);
    console.log("RabbitMQ Worker listening...");

    channel.consume(queueName, async (msg) => {
      if (!msg) return;

      const data = JSON.parse(msg.content.toString());
      console.log("  Processing image:", data.key);

      try {
        //  Fetch image from Filebase
        const original = await s3
          .getObject({ Bucket: "pixeled", Key: data.key })
          .promise();

        //  Generate thumbnail (200x200)
        const thumbBuffer = await sharp(original.Body)
          .resize(200, 200)
          .toBuffer();

        const thumbKey = data.key.replace(/(\.[\w\d_-]+)$/i, "-thumb$1");

        //  Upload thumbnail back to Filebase
        const thumbUpload = await s3
          .upload({
            Bucket: "pixeled",
            Key: thumbKey,
            Body: thumbBuffer,
            ContentType: "image/jpeg",
          })
          .promise();

        //  Update MongoDB document
        const imageDoc = await Image.findOneAndUpdate(
          { key: data.key },
          {
            $set: { status: "processed" },
            $push: {
              versions: {
                type: "thumbnail",
                key: thumbKey,
                url: thumbUpload.Location,
              },
              transformations: {
                type: "resize",
                width: 200,
                height: 200,
                appliedAt: new Date(),
              },
            },
          },
          { new: true }
        );

        console.log(" Image processed:", imageDoc.key);
        channel.ack(msg);

      } catch (err) {
        console.error(" Worker error:", err.message);
        channel.nack(msg, false, false); // discard message if failed
      }
    });
  } catch (error) {
    console.error("Worker setup error:", error);
  }
}

startWorker();
