import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { v4 as uuidv4 } from 'uuid';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({});

interface JsonObject {
  valid: boolean;
  value: number;
  description: string;
  buyer: string;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    const body = event.body;
    if (!body) {
      console.error('No body provided in request');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST'
        },
        body: JSON.stringify({
          error: 'No request body provided'
        })
      };
    }

    let jsonObject: JsonObject;
    try {
      jsonObject = JSON.parse(body);
    } catch (error) {
      console.error('Invalid JSON format:', error);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST'
        },
        body: JSON.stringify({
          error: 'Invalid JSON format'
        })
      };
    }

    if (!isValidJsonStructure(jsonObject)) {
      console.error('Invalid JSON structure');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST'
        },
        body: JSON.stringify({
          error: 'Invalid JSON structure. Required fields: valid, value, description, buyer'
        })
      };
    }

    const timestamp = Date.now();
    const itemId = uuidv4();

    if (jsonObject.valid) {
      console.log('Processing valid JSON:', jsonObject);
      
      const emailMessage = {
        subject: 'Valid JSON Object Received',
        body: `A valid JSON object was received:\n\n${JSON.stringify(jsonObject, null, 2)}\n\nTimestamp: ${new Date(timestamp).toISOString()}`
      };

      const snsParams = {
        TopicArn: process.env.TOPIC_ARN!,
        Subject: emailMessage.subject,
        Message: emailMessage.body,
        MessageAttributes: {
          'email_type': {
            DataType: 'String',
            StringValue: 'valid_json_notification'
          }
        }
      };

      await snsClient.send(new PublishCommand(snsParams));
      console.log('Email sent for valid JSON');

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST'
        },
        body: JSON.stringify({
          message: 'Valid JSON processed successfully. Email notification sent.',
          data: jsonObject,
          timestamp: timestamp
        })
      };
    } else {
      console.log('Processing invalid JSON:', jsonObject);
      
      const ttl = Math.floor(Date.now() / 1000) + (24 * 60 * 60); 
      
      const dynamoParams = {
        TableName: process.env.TABLE_NAME!,
        Item: {
          PK: `INVALID_JSON#${itemId}`,
          SK: `TIMESTAMP#${timestamp}`,
          data: jsonObject,
          timestamp: timestamp,
          TTL: ttl,
          createdAt: new Date(timestamp).toISOString()
        }
      };

      await docClient.send(new PutCommand(dynamoParams));
      console.log('Invalid JSON stored in DynamoDB');

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST'
        },
        body: JSON.stringify({
          message: 'Invalid JSON stored in database. Will be automatically deleted after 24 hours.',
          data: jsonObject,
          timestamp: timestamp,
          itemId: itemId
        })
      };
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST'
      },
      body: JSON.stringify({
        error: 'Internal server error'
      })
    };
  }
};

function isValidJsonStructure(obj: any): obj is JsonObject {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.valid === 'boolean' &&
    typeof obj.value === 'number' &&
    typeof obj.description === 'string' &&
    typeof obj.buyer === 'string'
  );
} 