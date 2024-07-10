#!/bin/bash

# Set variables
REGION="ap-southeast-2"
USERNAME="zest"
ACCOUNT_ID="905418260297"
ECR_REPO_NAME="api-gateway-service"

# Login to ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build the Docker image
docker build -t $ECR_REPO_NAME .

# Tag the image
docker tag $ECR_REPO_NAME:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO_NAME:latest

# Push the image to ECR
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO_NAME:latest

echo "Successfully built and pushed image to ECR"
