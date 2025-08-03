import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export class ExamSoftuniSisyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const notificationTopic = new sns.Topic(this, 'NotificationTopic', {
      displayName: 'JSON Processing Notifications',
      topicName: 'json-processing-notifications'
    });

    const jsonProcessingTable = new dynamodb.Table(this, 'JsonProcessingTable', {
      tableName: 'json-processing-table',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'TTL',
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const jsonHandler = new lambda.Function(this, 'JsonHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'json-handler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        TABLE_NAME: jsonProcessingTable.tableName,
        TOPIC_ARN: notificationTopic.topicArn,
        EMAIL_ADDRESS: 'your-email@example.com' // Sisi will change this
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256
    });

    const deleteHandler = new lambda.Function(this, 'DeleteHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'delete-handler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        TABLE_NAME: jsonProcessingTable.tableName,
        TOPIC_ARN: notificationTopic.topicArn,
        EMAIL_ADDRESS: 'your-email@example.com' // Sisi will change this
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256
    });

    jsonProcessingTable.grantWriteData(jsonHandler);
    jsonProcessingTable.grantReadWriteData(deleteHandler);
    notificationTopic.grantPublish(jsonHandler);
    notificationTopic.grantPublish(deleteHandler);

    const api = new apigateway.RestApi(this, 'JsonProcessingApi', {
      restApiName: 'JSON Processing Service',
      description: 'API for processing JSON objects',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key']
      }
    });

    const jsonIntegration = new apigateway.LambdaIntegration(jsonHandler);
    const jsonResource = api.root.addResource('process-json');
    jsonResource.addMethod('POST', jsonIntegration);

    const deleteRule = new events.Rule(this, 'DeleteInvalidJsonRule', {
      schedule: events.Schedule.rate(cdk.Duration.minutes(30)), // Check every 30 minutes
      description: 'Delete invalid JSON entries after 24 hours'
    });

    deleteRule.addTarget(new targets.LambdaFunction(deleteHandler));

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL'
    });

    new cdk.CfnOutput(this, 'DynamoDBTableName', {
      value: jsonProcessingTable.tableName,
      description: 'DynamoDB Table Name'
    });

    new cdk.CfnOutput(this, 'NotificationTopicArn', {
      value: notificationTopic.topicArn,
      description: 'SNS Topic ARN'
    });
  }
}
