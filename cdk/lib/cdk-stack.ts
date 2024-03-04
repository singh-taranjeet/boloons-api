import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";

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

    const certificate = acm.Certificate.fromCertificateArn(
      this,
      "Certificate",
      "arn:aws:acm:ap-southeast-2:533267098557:certificate/e7cec50c-476f-4473-a502-7ff027ee1327"
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
    const service = new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      `${prefix}Service`,
      {
        cluster: cluster, // Required
        //cpu: 2, // Default is 256
        desiredCount: 1, // Default is 1
        taskDefinition: taskDef,
        //memoryLimitMiB: 2048, // Default is 512
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
      recordName: "server.boloons.com",
      target: route53.RecordTarget.fromAlias(
        new targets.LoadBalancerTarget(service.loadBalancer)
      ),
    });
  }
}