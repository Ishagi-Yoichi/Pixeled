import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import prisma from "../../lib/prisma.js";
import { sendToQueue } from "../../utils/rabbitmq.js";
import {
  createSignedImageUrl,
  normalizeImageEdits,
  uploadOriginalImage,
} from "../../services/imageProcessor.js";

export async function Upload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "Image file is required" });
  }

  const edits = normalizeImageEdits(req.body);
  const extension = path.extname(req.file.originalname || "") || ".png";
  const uniqueKey = `original/${randomUUID()}${extension}`;

  try {
    const fileContent = fs.readFileSync(req.file.path);
    const original = await uploadOriginalImage({
      file: req.file,
      buffer: fileContent,
      key: uniqueKey,
    });

    const image = await prisma.image.create({
      data: {
        key: uniqueKey,
        filename: req.file.originalname || "image",
        contentType: req.file.mimetype,
        size: Number(req.file.size),
        status: "PENDING",
        rotation: edits.rotation,
        width: edits.width,
        height: edits.height,
        sharpness: edits.sharpness,
        exportFormat: edits.exportFormat,
        exportQuality: edits.exportQuality,
        grayscale: edits.grayscale,
        blur: edits.blur,
        brightness: edits.brightness,
        contrast: edits.contrast,
        flipHorizontal: edits.flipHorizontal,
        flipVertical: edits.flipVertical,
        ownerId: req.user?.id || null,
        versions: {
          create: {
            type: "original",
            key: original.key,
            url: createSignedImageUrl(original.key),
          },
        },
      },
    });

    const queued = await sendToQueue({
      imageId: image.id,
      key: image.key,
      type: "image-edit",
    });

    res.status(202).json({
      message: queued
        ? "Image uploaded. Processing has started."
        : "Image uploaded. RabbitMQ is not connected, so processing is pending.",
      imageId: image.id,
      status: image.status,
      queued,
      statusUrl: `/image/status/${image.id}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: "File upload failed",
      details: error.message,
      code: error.code || "UNKNOWN_ERROR",
    });
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
}
