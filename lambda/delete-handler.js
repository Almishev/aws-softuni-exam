"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_sns_1 = require("@aws-sdk/client-sns");
const dynamoClient = new client_dynamodb_1.DynamoDBClient({});
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new client_sns_1.SNSClient({});
const handler = async () => {
    console.log('Starting delete handler for expired invalid JSON entries');
    try {
        const currentTime = Date.now();
        const cutoffTime = currentTime - (24 * 60 * 60 * 1000); // 24 hours ago
        console.log(`Current time: ${new Date(currentTime).toISOString()}`);
        console.log(`Cutoff time: ${new Date(cutoffTime).toISOString()}`);
        // Query for items that should be deleted (older than 24 hours)
        const queryParams = {
            TableName: process.env.TABLE_NAME,
            KeyConditionExpression: 'begins_with(PK, :pk)',
            FilterExpression: 'timestamp < :cutoffTime',
            ExpressionAttributeValues: {
                ':pk': 'INVALID_JSON#',
                ':cutoffTime': cutoffTime
            }
        };
        console.log('Querying for expired items...');
        const queryResult = await docClient.send(new lib_dynamodb_1.QueryCommand(queryParams));
        if (!queryResult.Items || queryResult.Items.length === 0) {
            console.log('No expired items found');
            return;
        }
        console.log(`Found ${queryResult.Items.length} expired items to delete`);
        // Process each expired item
        for (const item of queryResult.Items) {
            try {
                console.log(`Processing item: ${item.PK}, created at: ${item.createdAt}`);
                // Calculate how long the item stayed in the table
                const timeInTable = currentTime - item.timestamp;
                const hoursInTable = Math.floor(timeInTable / (1000 * 60 * 60));
                const minutesInTable = Math.floor((timeInTable % (1000 * 60 * 60)) / (1000 * 60));
                // Delete the item
                const deleteParams = {
                    TableName: process.env.TABLE_NAME,
                    Key: {
                        PK: item.PK,
                        SK: item.SK
                    }
                };
                await docClient.send(new lib_dynamodb_1.DeleteCommand(deleteParams));
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
                    TopicArn: process.env.TOPIC_ARN,
                    Subject: emailMessage.subject,
                    Message: emailMessage.body,
                    MessageAttributes: {
                        'email_type': {
                            DataType: 'String',
                            StringValue: 'deletion_notification'
                        }
                    }
                };
                await snsClient.send(new client_sns_1.PublishCommand(snsParams));
                console.log(`Email notification sent for deleted item: ${item.PK}`);
            }
            catch (error) {
                console.error(`Error processing item ${item.PK}:`, error);
                // Continue with other items even if one fails
            }
        }
        console.log('Delete handler completed successfully');
    }
    catch (error) {
        console.error('Error in delete handler:', error);
        throw error;
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlLWhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkZWxldGUtaGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBMEQ7QUFDMUQsd0RBQTRGO0FBQzVGLG9EQUFnRTtBQUVoRSxNQUFNLFlBQVksR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUMsTUFBTSxTQUFTLEdBQUcscUNBQXNCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzVELE1BQU0sU0FBUyxHQUFHLElBQUksc0JBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQVc3QixNQUFNLE9BQU8sR0FBRyxLQUFLLElBQW1CLEVBQUU7SUFDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQywwREFBMEQsQ0FBQyxDQUFDO0lBRXhFLElBQUksQ0FBQztRQUNILE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMvQixNQUFNLFVBQVUsR0FBRyxXQUFXLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLGVBQWU7UUFFdkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3BFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVsRSwrREFBK0Q7UUFDL0QsTUFBTSxXQUFXLEdBQUc7WUFDbEIsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVztZQUNsQyxzQkFBc0IsRUFBRSxzQkFBc0I7WUFDOUMsZ0JBQWdCLEVBQUUseUJBQXlCO1lBQzNDLHlCQUF5QixFQUFFO2dCQUN6QixLQUFLLEVBQUUsZUFBZTtnQkFDdEIsYUFBYSxF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SUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFdEUsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUMxRCw4Q0FBOEM7WUFDaEQsQ0FBQztRQUNILENBQUM7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7SUFFdkQsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pELE1BQU0sS0FBSyxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUMsQ0FBQztBQTNGVyxRQUFBLE9BQU8sV0EyRmxCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRHluYW1vREJDbGllbnQgfSBmcm9tICdAYXdzLXNkay9jbGllbnQtZHluYW1vZGInO1xyXG5pbXBvcnQgeyBEeW5hbW9EQkRvY3VtZW50Q2xpZW50LCBRdWVyeUNvbW1hbmQsIERlbGV0ZUNvbW1hbmQgfSBmcm9tICdAYXdzLXNkay9saWItZHluYW1vZGInO1xyXG5pbXBvcnQgeyBTTlNDbGllbnQsIFB1Ymxpc2hDb21tYW5kIH0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LXNucyc7XHJcblxyXG5jb25zdCBkeW5hbW9DbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe30pO1xyXG5jb25zdCBkb2NDbGllbnQgPSBEeW5hbW9EQkRvY3VtZW50Q2xpZW50LmZyb20oZHluYW1vQ2xpZW50KTtcclxuY29uc3Qgc25zQ2xpZW50ID0gbmV3IFNOU0NsaWVudCh7fSk7XHJcblxyXG5pbnRlcmZhY2UgRHluYW1vSXRlbSB7XHJcbiAgUEs6IHN0cmluZztcclxuICBTSzogc3RyaW5nO1xyXG4gIGRhdGE6IGFueTtcclxuICB0aW1lc3RhbXA6IG51bWJlcjtcclxuICBUVEw6IG51bWJlcjtcclxuICBjcmVhdGVkQXQ6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgY29uc29sZS5sb2coJ1N0YXJ0aW5nIGRlbGV0ZSBoYW5kbGVyIGZvciBleHBpcmVkIGludmFsaWQgSlNPTiBlbnRyaWVzJyk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBjdXJyZW50VGltZSA9IERhdGUubm93KCk7XHJcbiAgICBjb25zdCBjdXRvZmZUaW1lID0gY3VycmVudFRpbWUgLSAoMjQgKiA2MCAqIDYwICogMTAwMCk7IC8vIDI0IGhvdXJzIGFnb1xyXG5cclxuICAgIGNvbnNvbGUubG9nKGBDdXJyZW50IHRpbWU6ICR7bmV3IERhdGUoY3VycmVudFRpbWUpLnRvSVNPU3RyaW5nKCl9YCk7XHJcbiAgICBjb25zb2xlLmxvZyhgQ3V0b2ZmIHRpbWU6ICR7bmV3IERhdGUoY3V0b2ZmVGltZSkudG9JU09TdHJpbmcoKX1gKTtcclxuXHJcbiAgICAvLyBRdWVyeSBmb3IgaXRlbXMgdGhhdCBzaG91bGQgYmUgZGVsZXRlZCAob2xkZXIgdGhhbiAyNCBob3VycylcclxuICAgIGNvbnN0IHF1ZXJ5UGFyYW1zID0ge1xyXG4gICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlRBQkxFX05BTUUhLFxyXG4gICAgICBLZXlDb25kaXRpb25FeHByZXNzaW9uOiAnYmVnaW5zX3dpdGgoUEssIDpwayknLFxyXG4gICAgICBGaWx0ZXJFeHByZXNzaW9uOiAndGltZXN0YW1wIDwgOmN1dG9mZlRpbWUnLFxyXG4gICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XHJcbiAgICAgICAgJzpwayc6ICdJTlZBTElEX0pTT04jJyxcclxuICAgICAgICAnOmN1dG9mZlRpbWUnOiBjdXRvZmZUaW1lXHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgY29uc29sZS5sb2coJ1F1ZXJ5aW5nIGZvciBleHBpcmVkIGl0ZW1zLi4uJyk7XHJcbiAgICBjb25zdCBxdWVyeVJlc3VsdCA9IGF3YWl0IGRvY0NsaWVudC5zZW5kKG5ldyBRdWVyeUNvbW1hbmQocXVlcnlQYXJhbXMpKTtcclxuICAgIFxyXG4gICAgaWYgKCFxdWVyeVJlc3VsdC5JdGVtcyB8fCBxdWVyeVJlc3VsdC5JdGVtcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgY29uc29sZS5sb2coJ05vIGV4cGlyZWQgaXRlbXMgZm91bmQnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnNvbGUubG9nKGBGb3VuZCAke3F1ZXJ5UmVzdWx0Lkl0ZW1zLmxlbmd0aH0gZXhwaXJlZCBpdGVtcyB0byBkZWxldGVgKTtcclxuXHJcbiAgICAvLyBQcm9jZXNzIGVhY2ggZXhwaXJlZCBpdGVtXHJcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgcXVlcnlSZXN1bHQuSXRlbXMgYXMgRHluYW1vSXRlbVtdKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFByb2Nlc3NpbmcgaXRlbTogJHtpdGVtLlBLfSwgY3JlYXRlZCBhdDogJHtpdGVtLmNyZWF0ZWRBdH1gKTtcclxuXHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGhvdyBsb25nIHRoZSBpdGVtIHN0YXllZCBpbiB0aGUgdGFibGVcclxuICAgICAgICBjb25zdCB0aW1lSW5UYWJsZSA9IGN1cnJlbnRUaW1lIC0gaXRlbS50aW1lc3RhbXA7XHJcbiAgICAgICAgY29uc3QgaG91cnNJblRhYmxlID0gTWF0aC5mbG9vcih0aW1lSW5UYWJsZSAvICgxMDAwICogNjAgKiA2MCkpO1xyXG4gICAgICAgIGNvbnN0IG1pbnV0ZXNJblRhYmxlID0gTWF0aC5mbG9vcigodGltZUluVGFibGUgJSAoMTAwMCAqIDYwICogNjApKSAvICgxMDAwICogNjApKTtcclxuXHJcbiAgICAgICAgLy8gRGVsZXRlIHRoZSBpdGVtXHJcbiAgICAgICAgY29uc3QgZGVsZXRlUGFyYW1zID0ge1xyXG4gICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5UQUJMRV9OQU1FISxcclxuICAgICAgICAgIEtleToge1xyXG4gICAgICAgICAgICBQSzogaXRlbS5QSyxcclxuICAgICAgICAgICAgU0s6IGl0ZW0uU0tcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBhd2FpdCBkb2NDbGllbnQuc2VuZChuZXcgRGVsZXRlQ29tbWFuZChkZWxldGVQYXJhbXMpKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgRGVsZXRlZCBpdGVtOiAke2l0ZW0uUEt9YCk7XHJcblxyXG4gICAgICAgIC8vIFNlbmQgZW1haWwgbm90aWZpY2F0aW9uIGFib3V0IHRoZSBkZWxldGlvblxyXG4gICAgICAgIGNvbnN0IGVtYWlsTWVzc2FnZSA9IHtcclxuICAgICAgICAgIHN1YmplY3Q6ICdJbnZhbGlkIEpTT04gRW50cnkgRGVsZXRlZCcsXHJcbiAgICAgICAgICBib2R5OiBgQW4gaW52YWxpZCBKU09OIGVudHJ5IGhhcyBiZWVuIGF1dG9tYXRpY2FsbHkgZGVsZXRlZCBmcm9tIHRoZSBkYXRhYmFzZS5cXG5cXG5gICtcclxuICAgICAgICAgICAgICAgIGBJdGVtIElEOiAke2l0ZW0uUEt9XFxuYCArXHJcbiAgICAgICAgICAgICAgICBgQ3JlYXRlZDogJHtpdGVtLmNyZWF0ZWRBdH1cXG5gICtcclxuICAgICAgICAgICAgICAgIGBEZWxldGVkOiAke25ldyBEYXRlKGN1cnJlbnRUaW1lKS50b0lTT1N0cmluZygpfVxcbmAgK1xyXG4gICAgICAgICAgICAgICAgYFRpbWUgaW4gdGFibGU6ICR7aG91cnNJblRhYmxlfSBob3VycywgJHttaW51dGVzSW5UYWJsZX0gbWludXRlc1xcblxcbmAgK1xyXG4gICAgICAgICAgICAgICAgYE9yaWdpbmFsIGRhdGE6XFxuJHtKU09OLnN0cmluZ2lmeShpdGVtLmRhdGEsIG51bGwsIDIpfWBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCBzbnNQYXJhbXMgPSB7XHJcbiAgICAgICAgICBUb3BpY0FybjogcHJvY2Vzcy5lbnYuVE9QSUNfQVJOISxcclxuICAgICAgICAgIFN1YmplY3Q6IGVtYWlsTWVzc2FnZS5zdWJqZWN0LFxyXG4gICAgICAgICAgTWVzc2FnZTogZW1haWxNZXNzYWdlLmJvZHksXHJcbiAgICAgICAgICBNZXNzYWdlQXR0cmlidXRlczoge1xyXG4gICAgICAgICAgICAnZW1haWxfdHlwZSc6IHtcclxuICAgICAgICAgICAgICBEYXRhVHlwZTogJ1N0cmluZycsXHJcbiAgICAgICAgICAgICAgU3RyaW5nVmFsdWU6ICdkZWxldGlvbl9ub3RpZmljYXRpb24nXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBhd2FpdCBzbnNDbGllbnQuc2VuZChuZXcgUHVibGlzaENvbW1hbmQoc25zUGFyYW1zKSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYEVtYWlsIG5vdGlmaWNhdGlvbiBzZW50IGZvciBkZWxldGVkIGl0ZW06ICR7aXRlbS5QS31gKTtcclxuXHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgcHJvY2Vzc2luZyBpdGVtICR7aXRlbS5QS306YCwgZXJyb3IpO1xyXG4gICAgICAgIC8vIENvbnRpbnVlIHdpdGggb3RoZXIgaXRlbXMgZXZlbiBpZiBvbmUgZmFpbHNcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnNvbGUubG9nKCdEZWxldGUgaGFuZGxlciBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5Jyk7XHJcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBkZWxldGUgaGFuZGxlcjonLCBlcnJvcik7XHJcbiAgICB0aHJvdyBlcnJvcjtcclxuICB9XHJcbn07ICJdfQ==