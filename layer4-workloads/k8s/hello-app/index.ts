import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

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

const namespace = new k8s.core.v1.Namespace("helloapp-ns", { metadata: { 
	name: k8sNamespace,
	labels: appLabels, 
}}, { provider: k8sProvider });

const helloapp = new k8s.yaml.v2.ConfigGroup("helloapp-argocd", {objs: [{
	apiVersion: "argoproj.io/v1alpha1",
	kind: "Application",
	metadata: {
		name: "helloapp-argocd",
		namespace: namespace.metadata.apply(metadata => metadata.name),
	},
	spec: {
		project: "default",
		source: {
			repoURL: "https://gitlab.com/nanuchi/argocd-app-config.git",
			targetRevision: "HEAD",
			path: "dev",
		},
		destination: {
			server: "https://kubernetes.default.svc",
			namespace: "helloapp",
		},
		syncPolicy: {
			syncOptions: ["CreateNamespace=true"],
			automated: {
				selfHeal: true,
				prune: true
			}
		}
	},
}]}, { provider: k8sProvider });
