// import * as cdk from "aws-cdk-lib";
// import { Construct } from "constructs";
// import * as ecs from "aws-cdk-lib/aws-ecs";
// import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";

// export class CdkStack extends cdk.Stack {
//   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
//     super(scope, id, props);

//     //const cluster = new ecs.Cluster(this, "BoloonsApiCluster");

//     // Create a load-balanced Fargate service and make it public
//     // new ecs_patterns.ApplicationLoadBalancedFargateService(
//     //   this,
//     //   "BoloonsApiService",
//     //   {
//     //     cluster: cluster, // Required
//     //     cpu: 512, // Default is 256
//     //     desiredCount: 1, // Default is 1
//     //     taskImageOptions: {
//     //       image: ecs.ContainerImage.fromRegistry(
//     //         "taranjeetsingh/boloons-api-ecs:latest"
//     //       ),
//     //     },
//     //     memoryLimitMiB: 2048, // Default is 512
//     //     publicLoadBalancer: true, // Default is true
//     //   }
//     // );

//     // Create a new Fargate task definition
//     const taskDef = new ecs.FargateTaskDefinition(this, "TaskDef");

//     // Add a container to the task definition
//     const container = taskDef.addContainer("Container", {
//       image: ecs.ContainerImage.fromRegistry(
//         "taranjeetsingh/boloons-api-ecs:latest"
//       ),
//     });

//     // Create a load-balanced Fargate service
//     new ecs_patterns.ApplicationLoadBalancedFargateService(this, "Service", {
//       taskDefinition: taskDef,
//       publicLoadBalancer: true, // Make the load balancer public
//     });
//   }
// }

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as ecr from "aws-cdk-lib/aws-ecr";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an ECS cluster
    const cluster = new ecs.Cluster(this, "BoloonsApiCluster");

    // Create a new Fargate task definition
    const taskDef = new ecs.FargateTaskDefinition(this, "BoloonsTaskDef");

    // Get the ECR repository
    const repository = ecr.Repository.fromRepositoryName(
      this,
      "Repository",
      "boloons-api"
    );

    // Add a container to the task definition
    const container = taskDef.addContainer("Container", {
      image: ecs.ContainerImage.fromEcrRepository(repository, "latest"),
      logging: new ecs.AwsLogDriver({
        streamPrefix: "BoloonsApi",
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
    });
    container.addPortMappings({
      containerPort: 80,
      protocol: ecs.Protocol.TCP,
    });

    // Add permissions to the task to access AWS Secrets Manager
    taskDef.addToTaskRolePolicy(
      new iam.PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        resources: [
          "arn:aws:secretsmanager:ap-southeast-2:305511985066:secret:boloons-api-JvIqax",
        ],
      })

      // new iam.PolicyStatement({
      //   actions: [
      //     "ecr:GetAuthorizationToken",
      //     "ecr:BatchCheckLayerAvailability",
      //     "ecr:GetDownloadUrlForLayer",
      //     "ecr:BatchGetImage",
      //     "secretsmanager:GetSecretValue",
      //   ],
      //   resources: ["*"],
      // })
    );

    // Add permissions to the task to access ECR
    taskDef.addToExecutionRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
        ],
        resources: ["*"],
      })
    );

    // Create a load-balanced Fargate service and make it public
    new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      "BoloonsApiService",
      {
        cluster: cluster, // Required
        cpu: 512, // Default is 256
        desiredCount: 1, // Default is 1
        taskDefinition: taskDef,
        memoryLimitMiB: 2048, // Default is 512
        publicLoadBalancer: true, // Default is true
      }
    );
  }
}
