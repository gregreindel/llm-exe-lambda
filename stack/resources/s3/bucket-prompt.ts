import { RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";

const kebabCase = require('lodash.kebabcase');

export class S3Bucket extends Construct {
  public readonly s3Bucket: s3.Bucket;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const AppName = this.node.tryGetContext("AppName");

    this.s3Bucket = new s3.Bucket(this, id, {
      bucketName: `${kebabCase(AppName)}-${Math.random().toString(36).slice(2, 8)}`,
      removalPolicy: !!this.node.tryGetContext("terminationProtection")
        ? RemovalPolicy.RETAIN
        : RemovalPolicy.DESTROY,
      versioned: true,
      publicReadAccess: false,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      intelligentTieringConfigurations: [],
      lifecycleRules: [],
      cors: [],
    });
  }
}
