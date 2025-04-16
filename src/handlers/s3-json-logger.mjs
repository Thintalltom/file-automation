import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { sdkStreamMixin } from "@aws-sdk/util-stream-node";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
const s3 = new S3Client({});
const sns = new SNSClient({});
const SNS_ARN = "arn:aws:sns:us-east-1:529088262208:fileprocessedtopic";
const processed_Bucket = "file-upload-processedbucket-xzqsnpx69yjv";


export const s3JsonLoggerHandler = async (event, context) => {
  try {
    const record = event.Records[0];
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    const { Body } = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );
    const stream = sdkStreamMixin(Body);
    const content = await stream.transformToString();
    console.log("📦 File contents:", content);

    await s3.send(
      new CopyObjectCommand({
        Bucket: processed_Bucket,
        CopySource: `${bucket}/${key}`,
        Key: key,
      })
    );

    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));

    await sns.send(
      new PublishCommand({
        TopicArn: SNS_ARN,
        Subject: "✅ File Processed",
        Message: `File "${key}" has been processed and moved to "${PROCESSED_BUCKET}".`,
      })
    );
    console.log("🎉 File processed successfully.");
  } catch (error) {
    console.error("❌ Error processing file:", error);
  }
};
