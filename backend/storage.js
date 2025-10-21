import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    endpoint: "https://s3.filebase.com", 
  region: "us-east-1", 
  accessKeyId: process.env.FILEBASE_ACCESS_KEY, 
  secretAccessKey: process.env.FILEBASE_SECRET_KEY,
  signatureVersion: "v4"
  //s3ForcePathStyle: true 
});

export default s3;