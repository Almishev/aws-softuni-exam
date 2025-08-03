import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({});

interface DynamoItem {
  PK: string;
  SK: string;
  data: any;
  timestamp: number;
  TTL: number;
  createdAt: string;
}

export const handler = async (): Promise<void> => {
  console.log('Starting delete handler for expired invalid JSON entries');

  try {
    const currentTime = Date.now();
    const cutoffTime = currentTime - (24 * 60 * 60 * 1000); // 24 hours ago

    console.log(`Current time: ${new Date(currentTime).toISOString()}`);
    console.log(`Cutoff time: ${new Date(cutoffTime).toISOString()}`);

    // Query for items that should be deleted (older than 24 hours)
    const queryParams = {
      TableName: process.env.TABLE_NAME!,
      KeyConditionExpression: 'begins_with(PK, :pk)',
      FilterExpression: 'timestamp < :cutoffTime',
      ExpressionAttributeValues: {
        ':pk': 'INVALID_JSON#',
        ':cutoffTime': cutoffTime
      }
    };

    console.log('Querying for expired items...');
    const queryResult = await docClient.send(new QueryCommand(queryParams));
    
    if (!queryResult.Items || queryResult.Items.length === 0) {
      console.log('No expired items found');
      return;
    }

    console.log(`Found ${queryResult.Items.length} expired items to delete`);

    // Process each expired item
    for (const item of queryResult.Items as DynamoItem[]) {
      try {
        console.log(`Processing item: ${item.PK}, created at: ${item.createdAt}`);

        // Calculate how long the item stayed in the table
        const timeInTable = currentTime - item.timestamp;
        const hoursInTable = Math.floor(timeInTable / (1000 * 60 * 60));
        const minutesInTable = Math.floor((timeInTable % (1000 * 60 * 60)) / (1000 * 60));

        // Delete the item
        const deleteParams = {
          TableName: process.env.TABLE_NAME!,
          Key: {
            PK: item.PK,
            SK: item.SK
          }
        };

        await docClient.send(new DeleteCommand(deleteParams));
        console.log(`Deleted item: ${item.PK}`);

        // Send email notification about the deletion
        const emailMessage = {
          subject: 'Invalid JSON Entry Deleted',
          body: `An invalid JSON entry has been automatically deleted from the database.\n\n` +
                `Item ID: ${item.PK}\n` +
                `Created: ${item.createdAt}\n` +
                `Deleted: ${new Date(currentTime).toISOString()}\n` +
                `Time in table: ${hoursInTable} hours, ${minutesInTable} minutes\n\n` +
                `Original data:\n${JSON.stringify(item.data, null, 2)}`
        };

        const snsParams = {
          TopicArn: process.env.TOPIC_ARN!,
          Subject: emailMessage.subject,
          Message: emailMessage.body,
          MessageAttributes: {
            'email_type': {
              DataType: 'String',
              StringValue: 'deletion_notification'
            }
          }
        };

        await snsClient.send(new PublishCommand(snsParams));
        console.log(`Email notification sent for deleted item: ${item.PK}`);

      } catch (error) {
        console.error(`Error processing item ${item.PK}:`, error);
        // Continue with other items even if one fails
      }
    }

    console.log('Delete handler completed successfully');

  } catch (error) {
    console.error('Error in delete handler:', error);
    throw error;
  }
}; 