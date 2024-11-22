# AWS Reference Architecture with Pulumi & TypeScript

This repository provides a layered reference architecture for AWS, implemented using Pulumi and TypeScript. The architecture is organized into distinct folders, each representing a logical layer of the infrastructure.

## Structure and Deployment
* Layers 1–2: Each of these layers is designed to function as an independent unit, similar to separate repositories. They can be deployed in sequence and are intended to align with different deployment cadences and team boundaries.

* Layer 3 - Shared Services: This layer includes shared services that are consumed by the workloads in Layer 4. Each shared service is designed to have its own repository and should be deployed independently, enabling modularity and clear separation of responsibilities.

* Layer 4 - Workloads: This layer contains independent workloads, each of which can be deployed individually. These workloads consume outputs from Layers 1–3 and are structured to represent standalone repositories.
For best results, deploy Layers 1–3 sequentially before proceeding to workloads in Layer 4.

## Pre-Requisites

1. [Install Pulumi](https://www.pulumi.com/docs/reference/install).
1. Install [Node.js](https://nodejs.org/en/download).
1. Install a package manager for Node.js, such as [NPM](https://www.npmjs.com/get-npm) or [Yarn](https://yarnpkg.com/lang/en/docs/install).
1. [Configure AWS Credentials](https://www.pulumi.com/docs/reference/clouds/aws/setup/).

## Layer1-Network

1.  Change to the networking project
    ```bash
    cd layer1-network
    ```

1.  Install the dependencies.

    ```bash
    npm install
    ```

1.  Create a new Pulumi stack named `dev`.

    ```bash
    pulumi stack init dev
    ```

1.  Set the Pulumi configuration variables for the project.

    ```bash
    pulumi config set aws:region us-west-2
    ```
   
    If you wish to control the number of availability zones that the VPC will be created within, you can do this by setting:
   
    ```bash
    pulumi config set azCount 2
    ```
    
    For subnetting, you can allocate a CIDR block for the VPC by setting:

    ```bash
    pulumi config set baseCidr 10.0.0.0/16
    ```

1.  Deploy the networking stack

    ```bash
    pulumi up
    ```
  Note the outputs from the deployment. These will be used in subsequent layers.

## Layer2-Security

1.  Change to the security project
    ```bash
    cd layer2-security
    ```

1.  Install the dependencies.

    ```bash
    npm install
    ```

1.  Create a new Pulumi stack named `dev`.

    ```bash
    pulumi stack init dev
    ```

1.  Set the Pulumi configuration variables for the project.

    ```bash
    pulumi config set name <your-name>
    ```

    Next we set a stack reference to the networking stack.

    ```bash
    pulumi config set networking <organization_or_user>/<projectName>/<stackName>
    ```

1.  Deploy the security stack

    ```bash
    pulumi up
    ```

## Layer3-Infra

1.  Change to the security project
    ```bash
    cd layer3-infra/<service>
    ```

1.  Install the dependencies.

    ```bash
    npm install
    ```

1.  Create a new Pulumi stack named `dev`.

    ```bash
    pulumi stack init dev
    ```

1.  Set the Pulumi configuration variables for the project.

1.  Deploy shared infrastructure

    ```bash
    pulumi up
    ```

## Layer4-Workloads