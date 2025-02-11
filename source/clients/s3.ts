import {
  S3Client,
  GetObjectCommand,
  GetObjectCommandInput,
} from "@aws-sdk/client-s3";

const { DEPLOY_REGION } = process.env;

export const s3Client = new S3Client({
  region: DEPLOY_REGION,
});

export const s3ClientGetObject = (params: GetObjectCommandInput) =>
  s3Client.send(new GetObjectCommand(params));
