import { RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";

export class S3Bucket extends Construct {
  public readonly s3Bucket: s3.Bucket;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.s3Bucket = new s3.Bucket(this, id, {
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
