import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as random from "@pulumi/random";

const config = new pulumi.Config();
const k8sNamespace = config.get("k8sNamespace") || "argocd";
const cargo = new pulumi.StackReference(config.require("cargo"))
const kubeconfig = cargo.getOutput("kubeconfig");
const appLabels = {
  app: "argocd",
};

const k8sProvider = new k8s.Provider("k8s-provider", {
	kubeconfig: kubeconfig,
});

const namespace = new k8s.core.v1.Namespace("argocd-ns", { metadata: { 
	name: k8sNamespace,
	labels: appLabels, 
}}, { provider: k8sProvider });

const redisPasswordResource = new random.RandomPassword("redis-password", {length: 16});
const redisSecret = new k8s.core.v1.Secret("redis-secret", {
	metadata: {
		name: "argocd-redis",
		namespace: namespace.metadata.apply(metadata => metadata.name),
	},
	type: "Opaque",
	stringData: {
		auth: redisPasswordResource.result,
	},
});

const argocd = new k8s.helm.v4.Chart("argocd", {
	chart: "argo-cd",
	version: "6.11.1",
	namespace: namespace.metadata.apply(metadata => metadata.name),
	repositoryOpts: {
		repo: "https://argoproj.github.io/argo-helm",
	},
	values: {
		fullnameOverride: "",
	},
});

export const redisPassword = redisPasswordResource.result;
// pulumi stack output redisPassword --show-secrets
// k get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
// k port-forward svc/argocd-server -n argocd 8080:443