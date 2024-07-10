import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class CdkEc2NginxStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'MyVPC', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        }
      ]
    });

    // Create a security group for the EC2 instance
    const securityGroup = new ec2.SecurityGroup(this, 'NginxSecurityGroup', {
      vpc,
      description: 'Allow HTTP traffic',
      allowAllOutbound: true
    });

    // Allow incoming HTTP traffic
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP traffic');

    // Allow SSH access (optional, for troubleshooting)
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH');

    const keyPair = ec2.KeyPair.fromKeyPairName(this, 'KeyPair', 'bookipi-2024-07-10');
    // EC2 instance
    const ec2Instance = new ec2.Instance(this, 'NginxInstance', {
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      securityGroup: securityGroup,
      keyPair,
    });

    // User data to install and start Nginx
    ec2Instance.addUserData(
      'sudo yum update -y',
      'sudo amazon-linux-extras install nginx1',
      'sudo systemctl start nginx',
      'sudo systemctl enable nginx'
    );

    // Allocate an Elastic IP and associate it with the EC2 instance
    const eip = new ec2.CfnEIP(this, 'EIP');
    new ec2.CfnEIPAssociation(this, 'EIPAssociation', {
      eip: eip.ref,
      instanceId: ec2Instance.instanceId,
    });

    // Output the public IP address of the EC2 instance
    new cdk.CfnOutput(this, 'NginxPublicIP', {
      value: eip.ref,
      description: 'Public IP address of the Nginx server',
    });
  }
}
