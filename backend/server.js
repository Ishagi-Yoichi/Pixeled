import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { Signup } from "./contollers/auth/signup.js";
import { SignIn } from "./contollers/auth/signin.js";
import { Upload } from "./contollers/Images/UploadImage.js";
import s3 from "./storage.js";
import { connectRabbitMQ } from "./utils/rabbitmq.js";

// Load environment variables
dotenv.config();
const app = express();
const upload = multer({dest:"uploads/"})
app.use(express.json());

app.get("/",(req,res)=>{
    res.status(200).json({message:"Hey"})
})

app.listen("3000", async ()=>{
    console.log(`Server started at http://localhost:3000`);
    await connectRabbitMQ() // connect when server starts
})

app.post("/signup",Signup)
app.post("/signin",SignIn)

app.post("/upload",upload.single("image"),Upload);
app.get("/image/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const params = {
        Bucket: "pixeled",
        Key: key,
        Expires: 60,
      };
      const url = s3.getSignedUrl("getObject", params);
      console.log("Generated URL:", url);
      res.json({ signedUrl: url });
    } catch (err) {
      console.error("Error generating pre-signed URL:", err);
      res.status(500).json({ error: err.message });
    }
  });
  