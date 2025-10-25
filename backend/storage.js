import AWS from "aws-sdk";

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint("https://s3.filebase.com"), 
  region: "us-east-1",                                   
  accessKeyId: process.env.FILEBASE_ACCESS_KEY,
  secretAccessKey: process.env.FILEBASE_SECRET_KEY,
  s3ForcePathStyle: true,                               
  signatureVersion: "v4",                                
});

export default s3;
