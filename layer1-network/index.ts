import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
// import * as awsx from "@pulumi/awsx";
import {Vpc} from "./vpc";

const config = new pulumi.Config();
const name = config.require("name");
const azCount = config.getNumber("azCount") || 2;
const baseCidr = config.get("baseCidr") || "10.0.0.0/16";

const baseTags = {
	owner: name,
	stack: pulumi.getStack(),
};
const availabilityZones = aws.getAvailabilityZones({
	state: "available",
});

const outputs = availabilityZones.then(zones => {
	const vpc = new Vpc(`${name}-vpc`, {
		description: `${baseTags.owner} VPC`,
		baseTags: baseTags,
		baseCidr: baseCidr,
		availabilityZoneNames: zones.names.slice(0, azCount),
	});

	// const vpc = new awsx.ec2.Vpc(`${name}-vpc`, {
	// 	enableDnsHostnames: true,
	// 	cidrBlock: baseCidr,
	// 	tags: {
	// 		...baseTags
	// 	},
	// });

	return {
		vpcId: vpc.vpcId(),
		vpcPrivateSubnetIds: vpc.privateSubnetIds(),
		vpcPublicSubnetIds: vpc.publicSubnetIds(),
		// vpcId: vpc.vpcId,
		// vpcPrivateSubnetIds: vpc.privateSubnetIds,
		// vpcPublicSubnetIds: vpc.publicSubnetIds,
	}
});

export const vpcId = outputs.then(x => x.vpcId);
export const vpcPrivateSubnetIds = outputs.then(x => x.vpcPrivateSubnetIds);
export const vpcPublicSubnetIds = outputs.then(x => x.vpcPublicSubnetIds);

