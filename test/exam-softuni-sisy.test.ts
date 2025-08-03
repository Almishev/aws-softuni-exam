import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as ExamSoftuniSisy from '../lib/exam-softuni-sisy-stack';

describe('ExamSoftuniSisyStack', () => {
  let stack: ExamSoftuniSisy.ExamSoftuniSisyStack;
  let template: Template;

  beforeEach(() => {
    const app = new cdk.App();
    stack = new ExamSoftuniSisy.ExamSoftuniSisyStack(app, 'MyTestStack');
    template = Template.fromStack(stack);
  });

  test('SNS Topic Created', () => {
    template.hasResourceProperties('AWS::SNS::Topic', {
      DisplayName: 'JSON Processing Notifications',
      TopicName: 'json-processing-notifications'
    });
  });

  test('API Gateway Created', () => {
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: 'JSON Processing Service',
      Description: 'API for processing JSON objects'
    });
  });
});
