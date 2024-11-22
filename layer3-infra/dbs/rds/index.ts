import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const rdsInstance = new aws.rds.Instance("lotctl-test", {
  allocatedStorage: 20,
  engine: "mysql",
  engineVersion: "8.0",
  instanceClass: "db.t3.medium",
  dbName: "lotctltest",
  username: "admin",
  password: pulumi.secret("password123"),
  dbSubnetGroupName: "default",
  vpcSecurityGroupIds: ["sg-02811209a930831fd"],
  skipFinalSnapshot: true,
  performanceInsightsEnabled: true,
  performanceInsightsRetentionPeriod: 7,
  performanceInsightsKmsKeyId: "arn:aws:kms:us-west-2:052848974346:key/3a096961-260a-4853-aa70-7055b13c3c4e",
  // performanceInsightsKmsKeyId: "arn:aws:kms:us-west-2:052848974346:key/56d4c6a7-d787-441c-8dbb-3e85279cc2d4",
});

export const rdsEndpoint = rdsInstance.endpoint;
