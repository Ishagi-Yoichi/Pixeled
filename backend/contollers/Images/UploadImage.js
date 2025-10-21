import fs from "fs";
import { randomUUID } from "crypto";
import s3 from "../../storage.js";
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
            res.json({
                message:"File uploaded successfully!",
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