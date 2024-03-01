import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ec2 from "aws-cdk-lib/aws-ec2";
// import * as acm from "aws-cdk-lib/aws-certificatemanager";
// import * as route53 from "aws-cdk-lib/aws-route53";
// import * as targets from "aws-cdk-lib/aws-route53-targets";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Use an existing VPC
    const vpc = ec2.Vpc.fromLookup(this, "VPC", {
      isDefault: true, // or provide other properties to identify the VPC
    });

    // Create an ECS cluster
    const cluster = new ecs.Cluster(this, "BoloonsApiCluster", {
      vpc: vpc,
    });

    // Create a new Fargate task definition
    const taskDef = new ecs.FargateTaskDefinition(this, "BoloonsTaskDef");

    // Get the ECR repository
    // const repository = ecr.Repository.fromRepositoryName(
    //   this,
    //   "Repository",
    //   "boloons-api"
    // );

    // Add a container to the task definition
    const container = taskDef.addContainer("ApiContainer", {
      image: ecs.ContainerImage.fromRegistry("taranjeetsingh/boloons-api-ecs"),
      //image: ecs.ContainerImage.fromEcrRepository(repository, "latest"),
      logging: new ecs.AwsLogDriver({
        streamPrefix: "BoloonsApi",
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      // expose port 4000 for redis
      portMappings: [{ containerPort: 4000, protocol: ecs.Protocol.TCP }],
      essential: true,
    });

    const redisContainer = taskDef.addContainer("RedisContainer", {
      image: ecs.ContainerImage.fromRegistry("redis/redis-stack-server"),
      // expose port 6379 for redis
      portMappings: [{ containerPort: 6379, protocol: ecs.Protocol.TCP }],
    });

    // Import the SSL certificate
    // const certificate = acm.Certificate.fromCertificateArn(
    //   this,
    //   "Certificate",
    //   "arn:aws:acm:ap-southeast-2:533267098557:certificate/e853d77b-f9ac-4837-b081-85abb37a83ba"
    // );

    // Add permissions to the task to access AWS Secrets Manager
    taskDef.addToTaskRolePolicy(
      new iam.PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        resources: [
          "arn:aws:secretsmanager:ap-southeast-2:533267098557:secret:boloons-api-secret-B3c3bG",
        ],
      })
    );

    // Add permissions to the task to access ECR
    taskDef.addToExecutionRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
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
        cpu: 2, // Default is 256
        desiredCount: 1, // Default is 1
        taskDefinition: taskDef,
        memoryLimitMiB: 2048, // Default is 512
        publicLoadBalancer: true, // Default is true,
        // certificate: certificate,
      }
    );

    // Get the hosted zone
    // const zone = route53.HostedZone.fromLookup(this, "Zone", {
    //   domainName: "boloons.com",
    // });

    // Create a record that points to the load balancer
    // new route53.ARecord(this, "AliasRecord", {
    //   zone: zone,
    //   recordName: "api.boloons.com",
    //   target: route53.RecordTarget.fromAlias(
    //     new targets.LoadBalancerTarget(service.loadBalancer)
    //   ),
    // });
  }
}
