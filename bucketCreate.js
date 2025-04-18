import pkg from "aws-sdk";
const { S3 } = pkg;
import fs from "fs";
const s3 = new S3();
const BUCKET_NAME = process.env.UPLOAD_BUCKET;
// Create a bucket if it doesn't exist
const createBucket = (bucketName) => {
  let bucketParams = { Bucket: bucketName };
  s3.createBucket(bucketParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.Location);
    }
  });
};

//list all buckets
const listBuckets = () => {
  s3.listBuckets({}, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.Buckets);
    }
  });
};

//upload files in buckets
const uploadFile = (bucketName, keyName, filePath) => {
  const file = fs.readFileSync(filePath);
  const uploadParams = { Bucket: bucketName, Key: keyName, Body: file };
  s3.upload(uploadParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Upload Success", data.Location);
    }
  });
};

listBuckets();
uploadFile(BUCKET_NAME, "user-image", '../file-upload/kgen.png');