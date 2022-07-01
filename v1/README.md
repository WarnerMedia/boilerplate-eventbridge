# AWS EventBridge Trunk-Based Deployment CodePipeline (v1)

## Table of Contents

- [Folder Structure](#folder-structure)
- [Initial Setup](#initial-setup)
- [GitHub Branch Flow](#github-branch-flow)
- [CloudFormation Linting Tools](#cloudFormation-linting-tools)
- [Infrastructure Components](#infrastructure-components)
- [Infrastructure Additions and Updates](#infrastructure-additions-and-updates)
- [Local Lambda Function Testing](#local-lambda-function-testing)
- [Current Implementation](#current-implementation)

# Folder Structure

This section describes the layout of the `v1` version of this project.

- [`build`](build): Everything that build processes would need to execute successfully.
    * For AWS CodeBuild, the needed BuildSpec and related shell scripts are all in this folder.
- [`env`](env): Any environment-related override files.
    * There are a number of JSON files in this folder which are used to override parameters in the various CloudFormation templates (via CodePipeline CloudFormation stages).  This is very useful for making specific changes to different environments.
    * This folder could also contain other environment configuration files for the application itself.
- [`git-hook`](git-hook): Any git hooks that are needed for local development.
    * If the [main setup script](script/cfn/setup/main.sh) is used, it will help set the hooks up.
- [`iac`](iac): Any infrastructure-as-code (IaC) templates.
    * Currently this only contains CloudFormation YAML templates.
    * The templates are categorized by AWS service to try to make finding and updated infrastructure easy.
    * This folder could also contain templates for other IaC solutions.
- [`local`](local): Tools to help with local development and testing of the function(s).
    * There are instructions for [Local Lambda Function Testing](#local-lambda-function-testing).
- [`node_modules`](node_modules): Optional Node.js modules that the Lambda(s) need to function.
- [`script`](script): General scripts that are needed for this project.
    * This folder includes the [main infrastructure setup script](script/cfn/setup/main.sh), which is the starting point of getting things running.
    * This folder could contain any other general scripts needed for this project (sans the CodeBuild related scripts, which are always in the [build](build) folder).
- [`src`](src): The source files needed for the function (sans the `node_modules` folder).
    * You could house the source code for multiple related functions in this folder if this project has multiple functions to deploy.
- [`test`](test): Any resources needed for doing testing of the application.
    * This project supports [Cucumber.js](https://cucumber.io/docs/installation/javascript/) Behavior-Driven Development (BDD) testing by default.
    * Cucumber.js is a very versatile testing solution which integrates well with CodeBuild reporting.
    * Cucumber tests can be written in [many different programming languages](https://cucumber.io/docs/installation/) including Java, Node.js, Ruby, C++, Go, PHP, Python, etc.
- [`version root`](./): All of the files that are generally designed to be at the base of the project.
    * Node.js `package-lock.json` and `package.json` files.
    * Miscellaneous files, such as the `.shellcheckrc`, and `README.md` file.

# Initial Setup

These setup instructions assume you are working with a non-prod/prod AWS account split and that you have already set up the base infrastructure: [boilerplate-aws-account-setup](https://github.com/warnermedia/boilerplate-aws-account-setup)

## GitHub User Connection

1. Since you have the base infrastructure in place, in your primary region, there should be an SSM parameter named: `/account/main/github/service/username`
2. This should be the name of the GitHub service account that was created for use with your AWS account.
3. You will want to add this service account user to your new repository (since the repository is likely private, this is required).
4. During the initial setup, the GitHub service account will need to be given admin. access so that it can create the needed webhook (no other access level can create webhooks at this time).
5. Once you try to add the service account user to your repository, someone who is on the mailing list for that service account should approve the request.

## Local AWS CLI Credentials (Needed for AWS CLI Helper Script)

If you want to use the helper script (recommended), you will need to have AWS credentials for both your AWS non-prod and AWS production accounts and have the AWS CLI installed.

1. Instructions for installing the AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html
2. WarnerMedia currently only allows for local credentials to be generated from your SSO access.
3. You will need to install and configure the [gimme-aws-creds](https://github.com/WarnerMedia/gimme-aws-creds) tool.
4. You will then use that tool to generate the needed AWS CLI credentials for both the non-prod and production AWS accounts.
4. You will need to keep track of what your AWS profile names are for use with the script.

## Spinning Things Up

This can be done via the helper script or manually through CloudFormation.  The script takes more setup but then handles more things for you.  The manual CloudFormation upload requires more clicking around but less setup since you don't have to locally configure the AWS CLI, etc.

### Using the Helper Script (AWS CLI)

1. You will want to make a local checkout of the repository that you created.
2. Once you have the local checkout, switch to the `v1` folder.
3. Change to this directory: `./script/cfn/setup/`
3. Locate the following file: `.setuprc`.
4. Open this file for editing, you will see the initial values that the boilerplate was making use of.
5. Modify all of these values to line up with the values related to your accounts.  It may be useful to look at the `.setuprc` of an existing repository for your account if you are not familiar with the values that you need to fill in.
6. Run the following script: `main.sh`
7. The `main.sh` script will use the `.setuprc` file to set its default values.
8. The script will ask you a number of questions, at which time you will have the option to change some of the default values.
9. Once you have run through all of the questions in the script, it will kick off the CloudFormation process in both the non-prod and production accounts.
10. At this point, CloudFormation will create a setup and infrastructure CodePipeline.  These CodePipelines will set up everything else that your CI/CD process needs.  The following environments will be set up:
    - `dev`
    - `int`
    - `qa`
    - `stage`
    - `prod`
11. If you need to make changes to any of the infrastructure, you can do so via CloudFormation templates located in this folder: `v1/iac/cfn`
12. You can make your changes and merge then into the `main` branch via a pull request, from this point forward, the CodePipelines will make sure the appropriate resources are updated.

### Manually Setup (AWS Console)

If you don't want to go through the work of setting up the AWS CLI locally, you can manually upload the main setup CloudFormation template.

You may want to look at the helper script to make sure you set all the parameters correctly.

1. You will want to make a local checkout of the repository that you created.
2. Once you have the local checkout, switch to the `v1` folder.
3. Find the following CloudFormation template: `./iac/cfn/setup/main.yaml`
4. Log into the AWS Console for your production account.
5. Go to the CloudFormation console.
6. Upload this template and then fill in all of the needed parameter values.
7. Go through all the other CloudFormation screens and then launch the stack.
8. Monitor the stack and make sure that it completes successfully.
9. Log into the AWS Console for your non-prod account.
10. Go to the CloudFormation console.
11. Upload this template and then fill in all of the needed parameter values.
12. Go through all the other CloudFormation screens and then launch the stack.
13. Monitor the stack and make sure that it completes successfully.
14. Once the stacks have created everything successfully, you will need to kick the CodeBuild off.  This can be done in one of two ways:
    - Make a commit to your `main` branch in your repository.
    - Locate a CodeBuild project in your primary region named `(your project name)-orchestrator` and then run a build.
15. At this point, CloudFormation will create a setup and infrastructure CodePipeline.  These CodePipelines will set up everything else that your CI/CD process needs.  The following environments will be set up:
    - `dev`
    - `int`
    - `qa`
    - `stage`
    - `prod`
16. If you need to make changes to any of the infrastructure, you can do so via CloudFormation templates located in this folder: `v1/iac/cfn`
17. You can make your changes and merge then into the `main` branch via a pull request, from this point forward, the CodePipelines will make sure the appropriate resources are updated.

# GitHub Branch Flow

## Main Branches

1. `main`:
    - This branch is the primary branch that all bug and feature branches will be created from and merged into.
    - For the purposes of this flow, it is the "trunk" branch.
2. `dev`:
    - This is a pseudo-primary branch which should always be considered unstable.
    - It will be automatically created once the first production deployment happens and will be based off of the release that was just deployed.
    - This branch will support an "off-to-the-side" environment for testing changes that may be too risky to deploy into the main flow.  For instance, interactions with a new AWS service that is hard to test locally.
    - Feature/bug-fix branches can be merged into this branch for testing before being merged into the `main` branch.
    - **NOTE:** The `dev` branch should never be merged into the `main` branch, only feature/bugfix branches should ever be merged into `main`.
3. `.*hotfix.*`:
    - Branches with the keyword `hotfix` anywhere in the middle of the name will temporarily override the main flow, allowing for a specific hotfix to get pushed through the flow.
    - Once a `hotfix` branch has been deployed to fix the problem, the changes can be merged/cherry-picked back into the `main` branch for deployment with the next full release.
4. feature/bugfix branches:
    - These branches will be created from the `main` branch.
    - Engineers will use their feature/bugfix branch to work locally.
    - Once a change is deemed ready locally, a pull request should be used to get it merged into the `main` branch.
    - An optional step would be to merge your feature branch into the `dev` branch first to test in the `dev` environment.
    - If you do merge your feature/bugfix branch into the `dev` branch for testing, once you verify things are good, then you would merge your feature/bugfix branch into `main` via a pull request.
    - **NOTE:** The `dev` branch should never be merged into the `main` branch, only feature/bugfix branches should ever be merged into `main`.

## General Flow

1. An engineer would create a feature branch from the `main` branch.
2. The engineer would then make their changes and do in-depth local testing.
3. The engineer should write unit test for their changes as well and any infrastructure changes that might be useful.
4. If this feature isn't fully functional, it is good practice to wrap it in a feature flag so that it can be disabled until it is ready.
5. Once things look good locally, the engineer would push the branch to GitHub.
6. In GitHub, a pull request will be created to the `main` branch.
7. A peer review should be done of the pull request by at least one other engineer.
8. Once the pull request is approved, it will be merged into the `main` branch.
9. The changes will be deployed to the initial integration (`int`) environment.
10. If things are approved in the `int` environment, then a manual approval in the CodePipeline will promote the changes to the Quality Assurance (`qa`) environment.  At this point a GitHub pre-release tag will be created.
11. Once things are approved in the `qa` environment, a manual approval in the CodePipeline will promote the change to the Staging (`stage`) environment.
12. The `stage` environment will allow for one last review before things go to the production (`prod`) environment.
13. At this point a time and date should be set for the production deployment.
14. At the desired time, a manual approval in the `stage` CodePipeline will then promote the changes to the `prod` environment in the production AWS account.
15. The changes will then be deployed to the production account and the `dev` branch will be overwritten with the release that was just deployed to production.

## Optional Flow Steps

In the above flow, there is one additional environment that changes can be pushed to if they are high-risk.  Here are the details:

1. Once a developer is ready to get their changes merged into the `main` branch, they can optionally first choose to create a pull request into the `dev` branch.
2. Once their branch is merged into the `dev` branch, the changes will be deployed to an "off-to-the-side" environment where the changes can be tested and verified without blocking the main flow.
3. Once the changes look good on the `dev` environment, the engineer can create a separate pull request for the `main` branch.
4. The `dev` branch is wiped out and replaced whenever there is a production deployment.  It is replaced with the release SHA that was just deployed to the production environment.  This prevents the `dev` environment from becoming a "junk drawer" of failed test branches.
5. The `dev` branch and environment should never really be considered a "stable" environment.
6. **NOTE:** The `dev` branch should never be merged into the `main` branch, only feature/bugfix branches should ever be merged into `main`.

# Local Lambda Function Testing

This repository contains a sample Lambda that can be used as an EventBridge target.  By default it simply logs out to CloudWatch, but it could be modified to do more advanced interactions, if needed.

Since Lambda will likely be a common target, it makes sense to have this available as an example.

There are various ways to test Lambdas locally, we have opted to stick with AWS solutions for this version of the boilerplate.  Because of this, we will be leveraging the SAM CLI for doing local development.

## Prerequisites

Your local system will need to have the following installed:

1. [docker](https://docs.docker.com/get-docker/)
2. [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

---
**NOTE**

For Ubuntu Linux, Homebrew is no longer needed, you can install globally using `pip3`:

1. Install: `sudo pip3 install aws-sam-cli`
2. Upgrade: `sudo pip3 install --upgrade aws-sam-cli`

---

## Running the Lambda Function

A simple helper shell script has been put in place to help run SAM CLI.

1. From within the `v1` folder, you can run the following command: `./local/run.sh <event>`
2. This will cause a docker instance to spin up and run the function.
3. The output of the function will be written out to this folder: `./local/output/`
4. The event that is fed into the Lambda is stored in this folder: `./local/event/`
    - There are currently two events in the `./local/event/` folder, `event-bridge.json` and `sns.json`.
    - You can target which event you want to test with by passing the name as a parameter (e.g. `./local/run.sh sns`).
5. There is a small CloudFormation template which SAM CLI uses to determine the runtime and handler, it is located here: `./local/cfn/function.yaml`

---
**NOTE**

The SAM CLI is fairly powerful and can be used to simulate a number of Lambda use-cases.  The advanced documentation is located here:

https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html

It should also be noted that we are only leveraging SAM for local testing.  We may eventually have additional version in this repository which have SAM and Serverless Framework deployments.

---
# CloudFormation Linting Tools

Since the Infrastructure as Code (IaC) solution for this version is CloudFormation, it is recommended to use some linting tools to make your life easier.

Assuming that you are using [Visual Studio Code](https://code.visualstudio.com), these extensions are recommended:

1. [Cfn-Nag Linter](https://marketplace.visualstudio.com/items?itemName=eastman.vscode-cfn-nag)
2. [CloudFormation Linter](https://marketplace.visualstudio.com/items?itemName=kddejong.vscode-cfn-lint)
3. [CloudFormation Snippets](https://marketplace.visualstudio.com/items?itemName=dsteenman.cloudformation-yaml-snippets)

# Infrastructure Components

There are multiple components to the AWS infrastructure.

## CodeBuild Orchestrator

This project uses CodeBuild to pull resources from GitHub.  This has been done for the following reasons:

1. CodeBuild has advanced GitHub webhook interactions which are critical for the kind of interactions we want with GitHub.
2. All CodeBuild projects within an AWS region share a signle GitHub service account connection, making it easy to rotate credentials.
3. CodeBuild allows us to have complex logic to determine what kind of changes were made to the repository, so that we can determine which CodePipeline should be triggered.

---
**NOTE**

Currently we are using standard AWS CodeBuild images because they are always available and we don't need to worry about any kind of rate-limiting.  The downside to this is that the standard images are large and somewhat slow to load.  A custom CodeBuild image could be created in order to speed up orchestrator builds.

---

There is an orchestrator in each account (`nonprod`/`prod`) in the primary region.  It is triggered when a Pull Request (PR) is merged with either the `main`, `dev`, or `hotfix` branches. Please see the [GitHub Branch Flow](#github-branch-flow) section for more details.

### List Files

The orchestrator uses `include`/`exclude` list files to determine which files trigger which CodePipelines.  As you are adding new files, you may need to modify these list files to make sure that the proper CodePipelines triggered with file changes.  These files are located in the [orchestrator folder](env/cfn/codebuild/orchestrator).

## Setup CodePipeline

This is a simple CodePipeline which makes fully automated updates via GitHub Pull Requests possible.  This CodePipeline doesn't do anything other than create and maintain the main infrastructure CodePipeline.

There is a setup CodePipeline in each account (`nonprod`/`prod`) in the primary region.

## Infrastructure CodePipeline

This project has an infrastructure CodePipeline which is used to create the base infrastructure for the project.  In this case, we consider "base infrastructure" to be anything that is shared and/or rarely updated.  CodePipelines can create resources in any region in the current account, so we use one CodePipeline in each account to create resources in all the needed regions.

Here are some of the things that this CodePipeline creates and maintains:

1. CodeBuild/CodePipeline IAM Roles.
2. Testing CodeBuild projects.
3. EventBridge Schema registries.
4. EventBridge deployment CodePipelines.

## Deployment CodePipelines

Each EventBridge environment has its own deployment CodePipeline.  These CodePipelines will perform the following tasks:

1. If the testing rule has been enabled (and the application testing stage has been enabled), then the sample Lambda Node.js application will be tested to ensure it is functioning.
2. If the testing rule has been enabled, then the sample SNS Topic and sample Lambda will be deployed for the given environment.
3. The SQS dead letter queue for the current EventBridge will be created.
4. The EventBridge event bus will be created.
5. The EventBridge schemas for the current environment will be created.
6. All of the rules for the current EventBridge environment will be deployed.
7. If the infrastructure testing action has been enabled, then a test event will get sent to the test rule to ensure that everything is working for this environment.

# Infrastructure Additions and Updates

Since EventBridge is basically all infrastructure, and since this version of the infrastructure uses CloudFormation to deploy the infrastructure, most all changes in this repository will be done through CloudFormation.

Please review the [Folder Structure](#folder-structure) section for details on the different base folders.

Generally speaking, the main thing that will get added to each EventBridge would be rules and schemas.  Other updates would follow a similar pattern, so going to cover how to add rules and schemas.

## Adding Rules

1. Use an existing rule template as your starting point, most likely the [standard template](iac/cfn/events/rules/detail-context/standard.yaml).
2. Copy the given template, make the needed changes for the new rule, and put the new template in a folder that makes logical sense.
3. Create some corresponding `env` files for the new rule, this will allow you to target changes for a specific environment.
    - You could start by making copies of the [standard](env/cfn/events/rules/detail-context/standard) rule folder.
    - These aren't required, but really nice to have when you need them, so worth doing it.
4. You will then want to modify the [deployment CodePipeline template](iac/cfn/codepipeline/deploy.yaml) to add in your new rule.
5. You can copy an existing rule block and then modify it to target your new rule template.
6. Then take the new rule block and add it as part of the `Deploy` stage.
7. Once your changes are ready, merge them into the `main` branch via a Pull Request (PR).
8. The infrastructure CodePipeline will update the deployment CodePipelines for the different environments.
9. The deployment CodePipelines will then get the new rules deployed out to all environments.
    - **NOTE:** CloudFormation does have conditional statements, so if you only wanted to add the rule to a specific environment for testing, that can be done (details below).

Here is a snippet for adding a rule to the deployment CodePipeline template (anything in `<>` is something you would replace):

```
        - Name: "Event_Rule_<folder>_<name>_First_Region"
          ActionTypeId:
            Category: "Deploy"
            Owner: "AWS"
            Provider: "CloudFormation"
            Version: "1"
          Configuration:
            ActionMode: !Ref ActionMode
            StackName: !Sub "${InfrastructureName}-event-bus-rule-<folder>-<name>-${ProjectName}-${TagEnvironment}"
            Capabilities: !Ref CloudFormationCapabilities
            TemplatePath:
              Fn::Sub:
              - "EVENT_BUS_SOURCE_FILES::${Folder}iac/cfn/events/rules/<folder>/<name>.yaml"
              - Folder: !If [ AppBaseFolder, !Sub "${AppBaseFolder}/", "" ]
            TemplateConfiguration:
              Fn::Sub:
              - "EVENT_BUS_ENV_SOURCE_FILES::${Folder}env/cfn/events/rules/<folder>/<name>/${TagEnvironment}.json"
              - Folder: !If [ AppBaseFolder, !Sub "${AppBaseFolder}/", "" ]
            RoleArn: !Sub "{{resolve:ssm:/iam/${InfrastructureName}/role/codepipeline/${ProjectName}/deploy/arn}}"
            OutputFileName: "out.json"
            ParameterOverrides: !Sub |
              {
                "InfrastructureName": "${InfrastructureName}",
                "BusName": "${BusName}",
                "ProjectName": "${ProjectName}",
                "RuleDetailContext": "<context>",
                "TagEnvironment": "${TagEnvironment}"
              }
          InputArtifacts:
          - Name: "EVENT_BUS_SOURCE_FILES"
          - Name: "EVENT_BUS_ENV_SOURCE_FILES"
          OutputArtifacts:
          - Name: "RULE_DETAIL_CONTEXT_<name>_FIRST_REGION_OUTPUT"
          RunOrder: <number>
          Region: !Ref "AWS::Region"
```

Here is an example which will cause the rule to only get added to the `Integration` environment:

```
        - !If
          - Integration
          - Name: "Event_Rule_<folder>_<name>_First_Region"
            ActionTypeId:
              Category: "Deploy"
              Owner: "AWS"
              Provider: "CloudFormation"
              Version: "1"
            Configuration:
              ActionMode: !Ref ActionMode
              StackName: !Sub "${InfrastructureName}-event-bus-rule-<folder>-<name>-${ProjectName}-${TagEnvironment}"
              Capabilities: !Ref CloudFormationCapabilities
              TemplatePath:
                Fn::Sub:
                - "EVENT_BUS_SOURCE_FILES::${Folder}iac/cfn/events/rules/<folder>/<name>.yaml"
                - Folder: !If [ AppBaseFolder, !Sub "${AppBaseFolder}/", "" ]
              TemplateConfiguration:
                Fn::Sub:
                - "EVENT_BUS_ENV_SOURCE_FILES::${Folder}env/cfn/events/rules/<folder>/<name>/${TagEnvironment}.json"
                - Folder: !If [ AppBaseFolder, !Sub "${AppBaseFolder}/", "" ]
              RoleArn: !Sub "{{resolve:ssm:/iam/${InfrastructureName}/role/codepipeline/${ProjectName}/deploy/arn}}"
              OutputFileName: "out.json"
              ParameterOverrides: !Sub |
                {
                  "InfrastructureName": "${InfrastructureName}",
                  "BusName": "${BusName}",
                  "ProjectName": "${ProjectName}",
                  "RuleDetailContext": "<context>",
                  "TagEnvironment": "${TagEnvironment}"
                }
            InputArtifacts:
            - Name: "EVENT_BUS_SOURCE_FILES"
            - Name: "EVENT_BUS_ENV_SOURCE_FILES"
            OutputArtifacts:
            - Name: "RULE_DETAIL_CONTEXT_<name>_FIRST_REGION_OUTPUT"
            RunOrder: <number>
            Region: !Ref "AWS::Region"
          - !Ref "AWS::NoValue"
```

## Updating Rules

Once a rule has been added, it is easy to update.  The steps are as follows:

1. Find the template that you need to update in the [rules folder](iac/cfn/events/rules).
2. Make you modifications to the rule template in a feature branch.
3. Merge your feature branch into the `main` branch via a Pull Request (PR).
4. The deployment CodePipeline for the `integration` (int) environment will get the updates deployed for that environment.
5. If things look good in the `integration` environment, then you can approve it using the manual approval step to promote it to the next environment.
6. You would then promote through all environments all the way out to production.

## Adding Schemas

### For an existing product

For schemas, we are grouping them per product into one template.  So, for example, the `standard` schemas are all in the [standard schema template](iac/cfn/events/schemas/standard.yaml).  If you wanted to add a schema for the `standard` product, you would do the following:

1. Make you modifications to the [standard schema template](iac/cfn/events/schemas/standard.yaml) in a feature branch.
2. Merge your feature branch into the `main` branch via a Pull Request (PR).
3. The deployment CodePipeline for the `integration` (int) environment will get the updates deployed for that environment.
4. If things look good in the `integration` environment, then you can approve it using the manual approval step to promote it to the next environment.
5. You would then promote through all environments all the way out to production.

### For a new product

1. Use an existing schema template as your starting point, most likely the [standard schema template](iac/cfn/events/schemas/standard.yaml).
2. Copy the given template, make the needed changes for the product schema, and put the template in the [schemas folder](iac/cfn/events/schemas).
3. Create a corresponding `env` file for the new schema template.
    - You could start by making a copy of the [standard.json](env/cfn/events/schemas/standard.json) file.
    - These aren't required, but really nice to have when you need them, so worth doing it.
4. You will then want to modify the [deployment CodePipeline template](iac/cfn/codepipeline/deploy.yaml) to add in your new schema template.
5. You can copy an existing schema block and then modify it to target your new rule template.
6. Then take the new schema block and add it as part of the `Deploy` stage.
7. Once your changes are ready, merge them into the `main` branch via a Pull Request (PR).
8. The infrastructure CodePipeline will update the deployment CodePipelines for the different environments.
9. The deployment CodePipelines will then get the new schema stack deployed out to all environments.
    - **NOTE:** CloudFormation does have conditional statements, so if you only wanted to add the schema stack to a specific environment for testing, that can be done (details below).

Here is a snippet for adding a product schema to the deployment CodePipeline template (anything in `<>` is something you would replace):

```
        - Name: "Event_Bus_Schemas_<name>_First_Region"
          ActionTypeId:
            Category: "Deploy"
            Owner: "AWS"
            Provider: "CloudFormation"
            Version: "1"
          Configuration:
            ActionMode: !Ref ActionMode
            StackName: !Sub "${InfrastructureName}-event-bus-schemas-<name>-${ProjectName}-${TagEnvironment}"
            Capabilities: !Ref CloudFormationCapabilities
            TemplatePath:
              Fn::Sub:
              - "EVENT_BUS_SOURCE_FILES::${Folder}iac/cfn/events/schemas/<name>.yaml"
              - Folder: !If [ AppBaseFolder, !Sub "${AppBaseFolder}/", "" ]
            TemplateConfiguration:
              Fn::Sub:
              - "EVENT_BUS_ENV_SOURCE_FILES::${Folder}env/cfn/events/schemas/<name>.json"
              - Folder: !If [ AppBaseFolder, !Sub "${AppBaseFolder}/", "" ]
            RoleArn: !Sub "{{resolve:ssm:/iam/${InfrastructureName}/role/codepipeline/${ProjectName}/deploy/arn}}"
            OutputFileName: "out.json"
            ParameterOverrides: !Sub |
              {
                "InfrastructureName": "${InfrastructureName}",
                "TagEnvironment": "${TagEnvironment}"
              }
          InputArtifacts:
          - Name: "EVENT_BUS_SOURCE_FILES"
          - Name: "EVENT_BUS_ENV_SOURCE_FILES"
          OutputArtifacts:
          - Name: "EVENT_BUS_SCHEMAS_<name>_FIRST_REGION_OUTPUT"
          RunOrder: <number>
          Region: !Ref "AWS::Region"
```

Here is an example which will cause the schema stack to only get added to the `Integration` environment:

```
        - !If
          - Integration
          - Name: "Event_Bus_Schemas_<name>_First_Region"
            ActionTypeId:
              Category: "Deploy"
              Owner: "AWS"
              Provider: "CloudFormation"
              Version: "1"
            Configuration:
              ActionMode: !Ref ActionMode
              StackName: !Sub "${InfrastructureName}-event-bus-schemas-<name>-${ProjectName}-${TagEnvironment}"
              Capabilities: !Ref CloudFormationCapabilities
              TemplatePath:
                Fn::Sub:
                - "EVENT_BUS_SOURCE_FILES::${Folder}iac/cfn/events/schemas/<name>.yaml"
                - Folder: !If [ AppBaseFolder, !Sub "${AppBaseFolder}/", "" ]
              TemplateConfiguration:
                Fn::Sub:
                - "EVENT_BUS_ENV_SOURCE_FILES::${Folder}env/cfn/events/schemas/<name>.json"
                - Folder: !If [ AppBaseFolder, !Sub "${AppBaseFolder}/", "" ]
              RoleArn: !Sub "{{resolve:ssm:/iam/${InfrastructureName}/role/codepipeline/${ProjectName}/deploy/arn}}"
              OutputFileName: "out.json"
              ParameterOverrides: !Sub |
                {
                  "InfrastructureName": "${InfrastructureName}",
                  "TagEnvironment": "${TagEnvironment}"
                }
            InputArtifacts:
            - Name: "EVENT_BUS_SOURCE_FILES"
            - Name: "EVENT_BUS_ENV_SOURCE_FILES"
            OutputArtifacts:
            - Name: "EVENT_BUS_SCHEMAS_<name>_FIRST_REGION_OUTPUT"
            RunOrder: <number>
            Region: !Ref "AWS::Region"
          - !Ref "AWS::NoValue"
```