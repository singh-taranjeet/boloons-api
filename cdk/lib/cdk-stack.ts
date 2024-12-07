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
      "arn:aws:acm:us-east-1:533267098557:certificate/664f3090-e5a6-4919-91a5-d8c90a416dd0"
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
      cpu: 512,
      memoryLimitMiB: 1024,
      executionRole: executionRole,
    });

    // Add a container to the task definition for app
    taskDef.addContainer(`${prefix}AppContainer`, {
      image: ecs.ContainerImage.fromRegistry(
        "taranjeetsingh/boloons-api-ecs:latest"
      ),
      logging: new ecs.AwsLogDriver({
        streamPrefix: prefix,
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      // connect redis and mongo on port
      portMappings: [{ containerPort: 4000, protocol: ecs.Protocol.TCP }],
      essential: true,
    });

    // add container for redis
    taskDef.addContainer(`${prefix}RedisContainer`, {
      image: ecs.ContainerImage.fromRegistry("redis:latest"),
      essential: false,
      // Add environment variables
      portMappings: [{ containerPort: 6379, protocol: ecs.Protocol.TCP }],
    });

    // add container for mongodb
    taskDef.addContainer(`${prefix}MongoContainer`, {
      image: ecs.ContainerImage.fromRegistry("mongo:latest"),
      essential: false,
      // Add environment variables
      environment: {
        MONGO_INITDB_ROOT_USERNAME: "root",
        MONGO_INITDB_ROOT_PASSWORD: "password",
      },
      portMappings: [{ containerPort: 27017, protocol: ecs.Protocol.TCP }],
    });

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
        certificate,
        minHealthyPercent: 100,
        maxHealthyPercent: 250,
      }
    );

    // Get the hosted zone
    const zone = route53.HostedZone.fromLookup(this, "Zone", {
      domainName: "taranjeet-singh.com",
    });

    // Create a record that points to the load balancer
    new route53.ARecord(this, "AliasRecord", {
      zone: zone,
      recordName: "boloon-api.taranjeet-singh.com",
      target: route53.RecordTarget.fromAlias(
        new targets.LoadBalancerTarget(service.loadBalancer)
      ),
    });
  }
}
