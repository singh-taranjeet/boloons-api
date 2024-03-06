import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";

const prefix = "BoloonsApiServer";
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

    const certificate = acm.Certificate.fromCertificateArn(
      this,
      "Certificate",
      "arn:aws:acm:us-east-1:533267098557:certificate/d5a47a7c-00ab-43b6-a50a-b26e59106af6"
    );

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
      cpu: 2048,
      memoryLimitMiB: 4096,
      executionRole: executionRole,
    });

    taskDef.addContainer(`${prefix}RedisContainer`, {
      image: ecs.ContainerImage.fromRegistry("redis/redis-stack-server:latest"),
      // expose port 6379 for redis
      portMappings: [{ containerPort: 6379, protocol: ecs.Protocol.TCP }],
      essential: true,
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

    // Add permissions to the task to access AWS Secrets Manager
    taskDef.addToTaskRolePolicy(
      new iam.PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        resources: [
          "arn:aws:secretsmanager:us-east-1:533267098557:secret:boloons-api-secret-B3c3bG",
        ],
      })
    );

    // Create a load-balanced Fargate service and make it public
    const service = new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      `${prefix}Service`,
      {
        cluster: cluster, // Required
        desiredCount: 1, // Default is 1
        taskDefinition: taskDef,
        publicLoadBalancer: true, // Default is true,
        assignPublicIp: true,
        certificate: certificate,
        minHealthyPercent: 100,
        maxHealthyPercent: 250,
      }
    );

    // Get the hosted zone
    const zone = route53.HostedZone.fromLookup(this, "Zone", {
      domainName: "boloons.com",
    });

    // Create a record that points to the load balancer
    new route53.ARecord(this, "AliasRecord", {
      zone: zone,
      recordName: "api.boloons.com",
      target: route53.RecordTarget.fromAlias(
        new targets.LoadBalancerTarget(service.loadBalancer)
      ),
    });
  }
}
