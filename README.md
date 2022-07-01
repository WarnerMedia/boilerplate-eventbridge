# EventBridge Event Bus Boilerplate

Create AWS EventBridge event buses (and all related resources).

---

## Table of Contents

- [Version-Specific Documentation](#version-specific-documentation)
- [Project CI/CD Versions](#project-cicd-versions)
- [Design Goals/Highlights](#design-goalshighlights)
- [License](#license)

# Version-Specific Documentation

- [Version One (v1) README](v1/README.md): Documentation for the main version that uses the current base infrastructure.  Go to this [README](v1/README.md) if you are looking for quick-start instructions.

# Project CI/CD Versions

- [Version One](v1): This version of the boilerplate assumes you are working with a non-prod/prod AWS account split and that you have already set up the base infrastructure: [boilerplate-aws-account-setup](https://github.com/warnermedia/boilerplate-aws-account-setup)
    * This version uses manual approval steps to move the current artifacts through the flow.
    * This version is the current active version and the one folks should typically use.

# Design Goals/Highlights

1. Control when infrastructure or application changes are deployed using configuration files.
2. Use a flavor of trunk-based development: https://trunkbaseddevelopment.com/
3. Make use of the GitHub API to help manage patch level revisions.
4. Create formal releases in GitHub using the GitHub API.
5. Minimize the number of GitHub webhooks needed.
6. Create an "orchestrator" to control the retrieval of all source files and distribute them where needed.
7. Allow for deployment to one or two regions.
8. Simplify the creation and management of AWS resources.
9. Take advantage of the latest CodeBuild/CodePipeline features.
10. Create working examples of function and infrastructure testing.
11. Encourage the use of "Conventional Commits" to help make commit message more meaningful: https://www.conventionalcommits.org/
12. Separation of duties, using different CodePipelines for different purposes to make things more modular and easier to maintain.
13. Create an optional helper script to make initial setup easier.
14. Think about how to manage versions from the start (to make things easier to maintain in the future).

# License

This repository is released under [the MIT license](https://en.wikipedia.org/wiki/MIT_License).  View the [local license file](./LICENSE).