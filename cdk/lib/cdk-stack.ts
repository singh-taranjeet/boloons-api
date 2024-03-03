import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

const prefix = "BoloonsApi";
export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Use an existing VPC
    const vpc = ec2.Vpc.fromLookup(this, "VPC", {
      isDefault: true,
    });

    // Create an ECS cluster
    const cluster = new ecs.Cluster(this, `${prefix}Cluster`, {
      vpc: vpc,
    });

    const executionRole = iam.Role.fromRoleArn(
      this,
      "ExecutionRole",
      "arn:aws:iam::533267098557:role/ecsTaskExecutionRole",
      {
        mutable: false,
      }
    );

    // Create a new Fargate task definition
    const taskDef = new ecs.FargateTaskDefinition(this, `${prefix}TaskDef`, {
      cpu: 512,
      memoryLimitMiB: 1024,
      executionRole: executionRole,
    });

    // Add a container to the task definition
    taskDef.addContainer(`${prefix}AppContainer`, {
      image: ecs.ContainerImage.fromRegistry(
        "taranjeetsingh/boloons-api-ecs:latest"
      ),
      logging: new ecs.AwsLogDriver({
        streamPrefix: prefix,
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      // expose port 4000 for redis
      portMappings: [{ containerPort: 4000, protocol: ecs.Protocol.TCP }],
      essential: true,
    });

    taskDef.addContainer(`${prefix}RedisContainer`, {
      image: ecs.ContainerImage.fromRegistry("redis/redis-stack-server:latest"),
      // expose port 6379 for redis
      portMappings: [{ containerPort: 6379, protocol: ecs.Protocol.TCP }],
    });

    // Add permissions to the task to access AWS Secrets Manager
    taskDef.addToTaskRolePolicy(
      new iam.PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        resources: [
          "arn:aws:secretsmanager:ap-southeast-2:533267098557:secret:boloons-api-secret-B3c3bG",
        ],
      })
    );

    // Create a load-balanced Fargate service and make it public
    new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      `${prefix}Service`,
      {
        cluster: cluster, // Required
        //cpu: 2, // Default is 256
        desiredCount: 1, // Default is 1
        taskDefinition: taskDef,
        //memoryLimitMiB: 2048, // Default is 512
        publicLoadBalancer: true, // Default is true,
        // certificate: certificate,
        assignPublicIp: true,
      }
    );
  }
}
