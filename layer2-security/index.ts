import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const name = config.require("name");
const networking = new pulumi.StackReference(config.require("networking"))

const baseTags = {
	owner: name,
	stack: pulumi.getStack(),
};

const sg = new aws.ec2.SecurityGroup(`${name}-web-sg`, {
	vpcId: networking.getOutput("vpcId"),
	description: "sg for lotctl demo",
	ingress: [
		{ fromPort: 22, toPort: 22, protocol: "tcp", cidrBlocks: ["0.0.0.0/0"] },
    { fromPort: 80, toPort: 80, protocol: "tcp", cidrBlocks: ["0.0.0.0/0"] },
	],
	egress: [
		{ fromPort: 0, toPort: 0, protocol: "-1", cidrBlocks: ["0.0.0.0/0"] }
	],
	tags: {
		...baseTags,
	},
});

// create an IAM role so instances can call the EC2 api
const iamRole = new aws.iam.Role(`${name}-web-role`, {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: ["ec2.amazonaws.com", "fis.amazonaws.com"],
  }),
  tags: {
    ...baseTags,
  }
})

const managedPolicyArns: string[] = [
  'arn:aws:iam::aws:policy/AdministratorAccess'
]

/*
  Loop through the managed policies and attach
  them to the defined IAM role
*/
let counter = 0;
for (const policy of managedPolicyArns) {
  // Create RolePolicyAttachment without returning it.
  const rpa = new aws.iam.RolePolicyAttachment(`${name}-policy-${counter++}`,
    { policyArn: policy, role: iamRole.id }, { parent: iamRole }
  );
}

export const sgId = sg.id;