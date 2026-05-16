import path from "path";
import sharp from "sharp";
import s3 from "../storage.js";
import prisma from "../lib/prisma.js";

const BUCKET = process.env.FILEBASE_BUCKET || "pixeled";
const SIGNED_URL_EXPIRES_SECONDS = 60 * 60 * 24;

export function normalizeImageEdits(input = {}) {
  const numberOrNull = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const intWithDefault = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
  };

  const boolValue = (value) => value === true || value === "true";

  return {
    width: numberOrNull(input.width),
    height: numberOrNull(input.height),
    rotation: ((intWithDefault(input.rotation, 0) % 360) + 360) % 360,
    sharpness: Math.min(200, Math.max(0, intWithDefault(input.sharpness, 0))),
    exportFormat: normalizeFormat(input.exportFormat || input.format || "png"),
    exportQuality: Math.min(
      100,
      Math.max(1, intWithDefault(input.exportQuality || input.quality, 92)),
    ),
    grayscale: boolValue(input.grayscale),
    blur: Math.min(50, Math.max(0, intWithDefault(input.blur, 0))),
    brightness: Math.min(200, Math.max(10, intWithDefault(input.brightness, 100))),
    contrast: Math.min(200, Math.max(10, intWithDefault(input.contrast, 100))),
    flipHorizontal: boolValue(input.flipHorizontal),
    flipVertical: boolValue(input.flipVertical),
  };
}

export function createSignedImageUrl(key) {
  return s3.getSignedUrl("getObject", {
    Bucket: BUCKET,
    Key: key,
    Expires: SIGNED_URL_EXPIRES_SECONDS,
  });
}

export function contentTypeForFormat(format) {
  return `image/${format === "jpg" ? "jpeg" : format}`;
}

export async function uploadOriginalImage({ file, buffer, key }) {
  const result = await s3
    .upload({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.mimetype,
      Metadata: {
        "original-filename": file.originalname || "image",
      },
    })
    .promise();

  return {
    key,
    url: result.Location || createSignedImageUrl(key),
  };
}

export async function processImageJob({ imageId }) {
  const image = await prisma.image.findUnique({
    where: { id: imageId },
    include: { versions: true },
  });

  if (!image) {
    throw new Error(`Image ${imageId} was not found`);
  }

  await prisma.image.update({
    where: { id: imageId },
    data: { status: "PROCESSING" },
  });

  try {
    const original = await s3
      .getObject({
        Bucket: BUCKET,
        Key: image.key,
      })
      .promise();

    const editedBuffer = await applySharpEdits(original.Body, image);
    const extension = image.exportFormat === "jpeg" ? "jpg" : image.exportFormat;
    const parsed = path.parse(image.key);
    const editedKey = `${parsed.name}-edited-${Date.now()}.${extension}`;

    await s3
      .upload({
        Bucket: BUCKET,
        Key: editedKey,
        Body: editedBuffer,
        ContentType: contentTypeForFormat(image.exportFormat),
        Metadata: {
          "source-key": image.key,
          "image-id": image.id,
        },
      })
      .promise();

    const signedUrl = createSignedImageUrl(editedKey);

    await prisma.image.update({
      where: { id: imageId },
      data: {
        status: "COMPLETED",
        versions: {
          create: {
            type: "edited",
            key: editedKey,
            url: signedUrl,
          },
        },
      },
    });

    return {
      imageId,
      key: editedKey,
      downloadUrl: signedUrl,
      status: "COMPLETED",
    };
  } catch (error) {
    await prisma.image.update({
      where: { id: imageId },
      data: { status: "FAILED" },
    });
    throw error;
  }
}

async function applySharpEdits(inputBuffer, image) {
  let pipeline = sharp(inputBuffer, { failOn: "none" }).rotate();

  if (image.flipHorizontal) pipeline = pipeline.flop();
  if (image.flipVertical) pipeline = pipeline.flip();

  if (image.rotation) {
    pipeline = pipeline.rotate(image.rotation);
  }

  if (image.width || image.height) {
    pipeline = pipeline.resize({
      width: image.width || null,
      height: image.height || null,
      fit: "fill",
      withoutEnlargement: false,
    });
  }

  if (image.grayscale) {
    pipeline = pipeline.grayscale();
  }

  if (image.brightness !== 100) {
    pipeline = pipeline.modulate({ brightness: image.brightness / 100 });
  }

  if (image.contrast !== 100) {
    const contrast = image.contrast / 100;
    pipeline = pipeline.linear(contrast, -(128 * contrast) + 128);
  }

  if (image.blur > 0) {
    pipeline = pipeline.blur(Math.max(0.3, image.blur / 10));
  }

  if (image.sharpness > 0) {
    pipeline = pipeline.sharpen({
      sigma: 1,
      m1: 0,
      m2: image.sharpness / 25,
      x1: 2,
      y2: 10,
      y3: 20,
    });
  }

  const options =
    image.exportFormat === "jpeg" || image.exportFormat === "jpg"
      ? { quality: image.exportQuality, mozjpeg: true }
      : image.exportFormat === "webp"
        ? { quality: image.exportQuality }
        : {};

  return pipeline.toFormat(image.exportFormat, options).toBuffer();
}

function normalizeFormat(format) {
  const normalized = String(format).toLowerCase();
  if (normalized === "jpg") return "jpeg";
  if (["jpeg", "png", "webp"].includes(normalized)) return normalized;
  return "png";
}
