import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";

// Get the Pulumi API token.
const pulumiConfig = new pulumi.Config();
const pulumiAccessToken = pulumiConfig.requireSecret("pulumiAccessToken")
const awsAccessKeyId = pulumiConfig.require("awsAccessKeyId")
const awsSecretAccessKey = pulumiConfig.requireSecret("awsSecretAccessKey")
const awsSessionToken = pulumiConfig.requireSecret("awsSessionToken")

// Create the API token as a Kubernetes Secret.
const accessToken = new kx.Secret("accesstoken", {
  stringData: { accessToken: pulumiAccessToken },
});

const awsCreds = new kx.Secret("aws-creds", {
	stringData: { 
		"AWS_ACCESS_KEY_ID": awsAccessKeyId,
		"AWS_SECRET_ACCESS_KEY": awsSecretAccessKey,
		"AWS_SESSION_TOKEN": awsSessionToken,
	},
});

// Create an NGINX deployment in-cluster.
const mystack = new k8s.apiextensions.CustomResource("lotctl-aws-ts-static-website", {
	apiVersion: 'pulumi.com/v1',
	kind: 'Stack',
	spec: {
		accessTokenSecret: accessToken.metadata.name,
		config: {
			"aws:region": "us-east-1",
		},
		envSecrets: [awsCreds.metadata.name],
		stack: "team-ce/aws-ts-static-website/lotctl",
		projectRepo: "https://github.com/videmsky/aws-ts-static-website",
		commit: "ee94e2dade90697bd2a7a204d4d02b10c23e54b3",
		// branch: "refs/heads/main",
		destroyOnFinalize: false,
	}
});
