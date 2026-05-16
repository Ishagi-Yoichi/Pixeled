import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { Signup } from "./contollers/auth/signup.js";
import { SignIn } from "./contollers/auth/signin.js";
import { Upload } from "./contollers/Images/UploadImage.js";
import s3 from "./storage.js";
import { connectRabbitMQ } from "./utils/rabbitmq.js";
import prisma from "./lib/prisma.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";

// Load environment variables
dotenv.config();
const app = express();
const upload = multer({ dest: "uploads/" });

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://pixeled.nikunjkr1752003.workers.dev",
    ],
    credentials: true,
  }),
);
app.use(express.json());
// server.js
app.use(
  clerkMiddleware({
    // Tells Clerk to extract the JWT from the Authorization header
    // in addition to (or instead of) cookies
    authorizedParties: ["https://pixeled.nikunjkr1752003.workers.dev"],
  }),
);

app.use(express.urlencoded({ extended: true })); // For parsing form data

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hey" });
});

app.post("/signup", Signup);
app.post("/signin", SignIn);

app.post("/upload", upload.single("image"), Upload);
app.get("/image/status/:id", async (req, res) => {
  try {
    const image = await prisma.image.findUnique({
      where: { id: req.params.id },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    const edited = image.versions.find((version) => version.type === "edited");
    const downloadUrl = edited
      ? s3.getSignedUrl("getObject", {
          Bucket: process.env.FILEBASE_BUCKET || "pixeled",
          Key: edited.key,
          Expires: 3600 * 24,
        })
      : null;

    res.json({
      imageId: image.id,
      status: image.status,
      downloadUrl,
      key: edited?.key || null,
      filename: image.filename,
      exportFormat: image.exportFormat,
    });
  } catch (err) {
    console.error("Error reading image status:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/image/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const params = {
      Bucket: process.env.FILEBASE_BUCKET || "pixeled",
      Key: key,
      Expires: 300,
    };
    const url = s3.getSignedUrl("getObject", params);
    console.log("Generated URL:", url);
    res.json({ signedUrl: url });
  } catch (err) {
    console.error("Error generating pre-signed URL:", err);
    res.status(500).json({ error: err.message });
  }
});

// Simple health/info route for video feature (backend)
app.get("/video", (req, res) => {
  res.status(200).json({
    message:
      "Video route is active. Use the frontend at /video to convert videos in-browser.",
  });
});

app.listen("3000", async () => {
  console.log(`Server started at http://localhost:3000`);
  await connectRabbitMQ(); // connect when server starts
});
