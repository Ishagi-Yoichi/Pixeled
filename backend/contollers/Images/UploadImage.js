import fs from "fs";
import { randomUUID } from "crypto";
import s3 from "../../storage.js";
import { Image } from "../../models/Image.js";
import { sendToQueue } from "../../utils/rabbitmq.js";



 export async function Upload(req,res){
        try{
            const fileContent = fs.readFileSync(req.file.path);
            const uniqueKey = `${randomUUID()}-${req.file.originalname}`;
            const params = {
                Bucket: "pixeled",
                Key:uniqueKey,
                Body: fileContent,
                ContentType:req.file.mimetype,
            };
            //uploadd to filebase(S3 compatiblee)
            const result = await s3.upload(params).promise();
            //cleaning up temp fole
            fs.unlinkSync(req.file.path);

            //send image metadata to RabbitMQ
            await sendToQueue({
                key:uniqueKey,
                url:result.Location,
                userId: req.user?.id || "anonymous",
                uploadedAt: new Date(),
            });

            //save metadata to mongodb
            const imageDoc = new Image({
                key:uniqueKey,
                originalName:req.file.originalName,
                ownerId:req.user?.id || null, //add kr dena user after auth
                size:req.file.mimetype,
                url:result.Location,
                versions:[
                    {
                    type:"original",
                    key:uniqueKey,
                    url:result.Location
                    }
                ],
                status:"uploaded"
            });
            await imageDoc.save();
            await sendToQueue({key:uniqueKey,ownerId:req.user?._id});
            
            res.status(200).json({
                message:"File uploaded & metadata saved successfully!",
                fileUrl:result.Location,
                key:uniqueKey,
            });
        }
    catch(error){
        console.error("Upload error:", error);
        console.error("Error details:", {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            stack: error.stack
        });
        res.status(500).json({
            error: "File upload failed",
            details: error.message,
            code: error.code || 'UNKNOWN_ERROR'
        });
    }
}
