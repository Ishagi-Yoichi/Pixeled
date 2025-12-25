import fs from "fs";
import { randomUUID } from "crypto";
import s3 from "../../storage.js";
import { Image } from "../../models/Image.js";
import { sendToQueue } from "../../utils/rabbitmq.js";
import sharp from "sharp";


 export async function Upload(req,res){
        try{
            // Extract transformation parameters from request body
            const { height, width, format, rotation, quality } = req.body;
            
            const fileContent = fs.readFileSync(req.file.path);
            const uniqueKey = `${randomUUID()}-${req.file.originalname}`;
            
            // Process image with Sharp if transformations are requested
            let processedBuffer = fileContent;
            let processedFormat = format || req.file.mimetype.split('/')[1];
            
            try {
                let sharpInstance = sharp(fileContent);
                
                // Apply resize if dimensions are provided
                if (height || width) {
                    sharpInstance = sharpInstance.resize({
                        width: width ? parseInt(width) : null,
                        height: height ? parseInt(height) : null,
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .sharpen()
                }
                
                // Apply rotation
                if (rotation === 'left') {
                    sharpInstance = sharpInstance.rotate(-90)
                                                 .sharpen();
                } else if (rotation === 'right') {
                    sharpInstance = sharpInstance.rotate(90)
                                                 .sharpen();
                }
                
                // Apply format conversion
                if (format && ['jpeg', 'jpg', 'png', 'webp'].includes(format.toLowerCase())) {
                    const formatOptions = {};
                    
                    // Apply quality for JPEG/WebP
                    if ((format === 'jpeg' || format === 'jpg') && quality) {
                        formatOptions.quality = parseInt(quality);
                        formatOptions.mozjpeg = true;
                    } else if (format === 'webp' && quality) {
                        formatOptions.quality = parseInt(quality);
                    }
                    
                    processedBuffer = await sharpInstance.sharpen().toFormat(format, formatOptions).toBuffer();
                } else {
                    // Just apply resize/rotation without format change
                    processedBuffer = await sharpInstance.sharpen().toBuffer();
                                                        
                }
            } catch (sharpError) {
                console.error('Sharp processing error:', sharpError);
                // Fall back to original file if processing fails
                processedBuffer = fileContent;
            }
            
            const contentType = format 
                ? `image/${format === 'jpg' ? 'jpeg' : format}` 
                : req.file.mimetype;
            
            const params = {
                Bucket: "pixeled",
                Key:uniqueKey,
                Body: processedBuffer,
                ContentType: contentType,
                ACL: 'public-read', // Make file publicly accessible
                Metadata: {
                    'original-filename': req.file.originalname || 'image'
                }
            };
            
            //upload to filebase(S3 compatible)
            const result = await s3.upload(params).promise();
            //cleaning up temp file
            fs.unlinkSync(req.file.path);

            // Generate signed URL for accessing the file (valid for 1 hour)
            const signedUrlParams = {
                Bucket: "pixeled",
                Key: uniqueKey,
                Expires: 3600, // 1 hour
            };
            const signedUrl = s3.getSignedUrl("getObject", signedUrlParams);

            //send image metadata to RabbitMQ with transformation parameters
            await sendToQueue({
                key:uniqueKey,
                url:signedUrl,
                userId: req.user?.id || "anonymous",
                uploadedAt: new Date(),
                transformations: {
                    height: height || null,
                    width: width || null,
                    format: format || null,
                    rotation: rotation || null,
                    quality: quality || null
                }
            });
            
            console.log("Uploaded file details:",req.file);
            console.log("Transformations applied:", { height, width, format, rotation, quality });
            
            //save metadata to mongodb
            const imageDoc = new Image({
                key:uniqueKey,
                originalName:req.file.originalName,
                ownerId:req.user?.id || null,
                size:Number(req.file.size),
                url:signedUrl,
                contentType:contentType,
                versions:[
                    {
                    type:"original",
                    key:uniqueKey,
                    url:signedUrl
                    }
                ],
                status:"uploaded",
                transformations: {
                    height: height || null,
                    width: width || null,
                    format: format || null,
                    rotation: rotation || null,
                    quality: quality || null
                }
            });
            await imageDoc.save();
            
            res.status(200).json({
                message:"File uploaded & processed successfully!",
                fileUrl:signedUrl,
                key:uniqueKey,
                transformations: {
                    height: height || null,
                    width: width || null,
                    format: format || null,
                    rotation: rotation || null,
                    quality: quality || null
                }
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
