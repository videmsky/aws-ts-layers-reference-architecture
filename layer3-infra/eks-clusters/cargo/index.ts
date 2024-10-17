import * as pulumi from "@pulumi/pulumi";
import * as aws from '@pulumi/aws';
import * as eks from "@pulumi/eks";

// Grab some values from the Pulumi configuration (or use default values)
const config = new pulumi.Config();
const minClusterSize = config.getNumber("minClusterSize") || 3;
const maxClusterSize = config.getNumber("maxClusterSize") || 6;
const desiredClusterSize = config.getNumber("desiredClusterSize") || 3;
const eksNodeInstanceType = config.get("eksNodeInstanceType") || "t3.medium";
const name = config.require("name");

const baseTags = {
	owner: name,
	stack: pulumi.getStack(),
};

const networking = new pulumi.StackReference(config.require("networking"))

const nodeGroupRole = new aws.iam.Role(`${name}-nodeGroupRole`, {
  assumeRolePolicy: JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'sts:AssumeRole',
        Effect: 'Allow',
        Sid: undefined,
        Principal: {
          Service: 'ec2.amazonaws.com',
        },
      },
    ],
  }),
  managedPolicyArns: [
    'arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy',
    'arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy',
    'arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly',
  ],
});

const fixedNodeGroupProfile = new aws.iam.InstanceProfile(`${name}-fixedNodeGroupInstanceProfile`, {
  role: nodeGroupRole,
  tags: {
    ...baseTags,
  },
});


// Create the EKS cluster
const eksCluster = new eks.Cluster(`${name}-eks-cluster`, {
	vpcId: networking.getOutput("vpcId"),
	publicSubnetIds: networking.getOutput("vpcPublicSubnetIds"),
	privateSubnetIds: networking.getOutput("vpcPrivateSubnetIds"),
	nodeAssociatePublicIpAddress: false,
	endpointPrivateAccess: false,
	endpointPublicAccess: true,
	skipDefaultNodeGroup: true,
	instanceRoles: [nodeGroupRole],
	defaultAddonsToRemove: ["coredns"],
  tags: {
    ...baseTags,
  },
});

const fixedNodeGroup = new eks.NodeGroupV2(`${name}-fixedNodeGroup`, {
  cluster: eksCluster,
  instanceType: eksNodeInstanceType,
  instanceProfile: fixedNodeGroupProfile,
  desiredCapacity: desiredClusterSize,
  minSize: minClusterSize,
  maxSize: maxClusterSize,
});

const eksAddon = new aws.eks.Addon(`${name}-eksAddon`, {
	clusterName: eksCluster.core.cluster.id,
	addonName: "coredns",
	addonVersion: "v1.11.3-eksbuild.1",
	resolveConflictsOnUpdate: "OVERWRITE",
	resolveConflictsOnCreate: "OVERWRITE",
});

// Export some values for use elsewhere
export const kubeconfig = eksCluster.kubeconfig;
