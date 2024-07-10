#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkEc2NginxStack } from '../lib/cdk-ec2-nginx-stack';

const app = new cdk.App();

// console.log('CDK_DEFAULT_ACCOUNT:', process.env.CDK_DEFAULT_ACCOUNT);
// console.log('CDK_DEFAULT_REGION:', process.env.CDK_DEFAULT_REGION);

new CdkEc2NginxStack(app, 'CdkEc2NginxStack', {
  env: { account: '905418260297', region: 'ap-southeast-2' },
});
