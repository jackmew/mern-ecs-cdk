import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import { Construct } from 'constructs';

export class InfraCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'ZestVPC', {
      maxAzs: 2,
      natGateways: 1
    });

    // Create an ECS cluster
    const cluster = new ecs.Cluster(this, 'ZestCluster', {
      vpc: vpc
    });

    // Create security groups
    const apiGatewaySG = new ec2.SecurityGroup(this, 'ApiGatewaySG', {
      vpc,
      allowAllOutbound: true,
      description: 'Security group for API Gateway service'
    });

    const authServiceSG = new ec2.SecurityGroup(this, 'AuthServiceSG', {
      vpc,
      allowAllOutbound: true,
      description: 'Security group for Auth service'
    });

    const mainServiceSG = new ec2.SecurityGroup(this, 'MainServiceSG', {
      vpc,
      allowAllOutbound: true,
      description: 'Security group for Main service'
    });

    const paymentServiceSG = new ec2.SecurityGroup(this, 'PaymentServiceSG', {
      vpc,
      allowAllOutbound: true,
      description: 'Security group for Payment service'
    });

    const graphqlServiceSG = new ec2.SecurityGroup(this, 'GraphqlServiceSG', {
      vpc,
      allowAllOutbound: true,
      description: 'Security group for GraphQL service'
    });

    // Add ingress rules
    apiGatewaySG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3000), 'Allow inbound HTTP');
    authServiceSG.addIngressRule(apiGatewaySG, ec2.Port.tcp(3001), 'Allow traffic from API Gateway');
    mainServiceSG.addIngressRule(apiGatewaySG, ec2.Port.tcp(3002), 'Allow traffic from API Gateway');
    paymentServiceSG.addIngressRule(apiGatewaySG, ec2.Port.tcp(3003), 'Allow traffic from API Gateway');
    graphqlServiceSG.addIngressRule(apiGatewaySG, ec2.Port.tcp(4000), 'Allow traffic from API Gateway');

    // Create Fargate services
    this.createFargateService(cluster, 'ApiGatewayService', apiGatewaySG, 3000);
    this.createFargateService(cluster, 'AuthService', authServiceSG, 3001);
    this.createFargateService(cluster, 'MainService', mainServiceSG, 3002);
    this.createFargateService(cluster, 'PaymentService', paymentServiceSG, 3003);
    this.createFargateService(cluster, 'GraphqlService', graphqlServiceSG, 4000);
  }

  private createFargateService(cluster: ecs.ICluster, serviceName: string, securityGroup: ec2.ISecurityGroup, containerPort: number) {
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, serviceName, {
      cluster: cluster,
      cpu: 256,
      desiredCount: 1,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
        containerPort: containerPort
      },
      memoryLimitMiB: 512,
      publicLoadBalancer: true,
      securityGroups: [securityGroup]
    });
  }
}
