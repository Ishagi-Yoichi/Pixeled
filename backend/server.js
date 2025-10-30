import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { Signup } from "./contollers/auth/signup.js";
import { SignIn } from "./contollers/auth/signin.js";
import { Upload } from "./contollers/Images/UploadImage.js";
import s3 from "./storage.js";
import { connectRabbitMQ } from "./utils/rabbitmq.js";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();
const app = express();
const upload = multer({dest:"uploads/"})

// Enable CORS for frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Vite default port
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing form data

app.get("/",(req,res)=>{
    res.status(200).json({message:"Hey"})
})

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => console.error(" MongoDB connection error:", err));


app.post("/signup",Signup)
app.post("/signin",SignIn)

app.post("/upload",upload.single("image"),Upload);
app.get("/image/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const params = {
        Bucket: "pixeled",
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
    res.status(200).json({ message: "Video route is active. Use the frontend at /video to convert videos in-browser." });
});

  

  app.listen("3000", async ()=>{
    console.log(`Server started at http://localhost:3000`);
    await connectRabbitMQ() // connect when server starts
})