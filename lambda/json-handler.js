"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_sns_1 = require("@aws-sdk/client-sns");
const uuid_1 = require("uuid");
const dynamoClient = new client_dynamodb_1.DynamoDBClient({});
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new client_sns_1.SNSClient({});
const handler = async (event) => {
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
        let jsonObject;
        try {
            jsonObject = JSON.parse(body);
        }
        catch (error) {
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
        const itemId = (0, uuid_1.v4)();
        if (jsonObject.valid) {
            console.log('Processing valid JSON:', jsonObject);
            const emailMessage = {
                subject: 'Valid JSON Object Received',
                body: `A valid JSON object was received:\n\n${JSON.stringify(jsonObject, null, 2)}\n\nTimestamp: ${new Date(timestamp).toISOString()}`
            };
            const snsParams = {
                TopicArn: process.env.TOPIC_ARN,
                Subject: emailMessage.subject,
                Message: emailMessage.body,
                MessageAttributes: {
                    'email_type': {
                        DataType: 'String',
                        StringValue: 'valid_json_notification'
                    }
                }
            };
            await snsClient.send(new client_sns_1.PublishCommand(snsParams));
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
        }
        else {
            console.log('Processing invalid JSON:', jsonObject);
            const ttl = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
            const dynamoParams = {
                TableName: process.env.TABLE_NAME,
                Item: {
                    PK: `INVALID_JSON#${itemId}`,
                    SK: `TIMESTAMP#${timestamp}`,
                    data: jsonObject,
                    timestamp: timestamp,
                    TTL: ttl,
                    createdAt: new Date(timestamp).toISOString()
                }
            };
            await docClient.send(new lib_dynamodb_1.PutCommand(dynamoParams));
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
    }
    catch (error) {
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
exports.handler = handler;
function isValidJsonStructure(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        typeof obj.valid === 'boolean' &&
        typeof obj.value === 'number' &&
        typeof obj.description === 'string' &&
        typeof obj.buyer === 'string');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1oYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsianNvbi1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDhEQUEwRDtBQUMxRCx3REFBMkU7QUFDM0Usb0RBQWdFO0FBQ2hFLCtCQUFvQztBQUVwQyxNQUFNLFlBQVksR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUMsTUFBTSxTQUFTLEdBQUcscUNBQXNCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzVELE1BQU0sU0FBUyxHQUFHLElBQUksc0JBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQVM3QixNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBMkIsRUFBa0MsRUFBRTtJQUMzRixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRS9ELElBQUksQ0FBQztRQUNILE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1lBQzdDLE9BQU87Z0JBQ0wsVUFBVSxFQUFFLEdBQUc7Z0JBQ2YsT0FBTyxFQUFFO29CQUNQLGNBQWMsRUFBRSxrQkFBa0I7b0JBQ2xDLDZCQUE2QixFQUFFLEdBQUc7b0JBQ2xDLDhCQUE4QixFQUFFLGNBQWM7b0JBQzlDLDhCQUE4QixFQUFFLE1BQU07aUJBQ3ZDO2dCQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUNuQixLQUFLLEVBQUUsMEJBQTBCO2lCQUNsQyxDQUFDO2FBQ0gsQ0FBQztRQUNKLENBQUM7UUFFRCxJQUFJLFVBQXNCLENBQUM7UUFDM0IsSUFBSSxDQUFDO1lBQ0gsVUFBVSxHQUFHLElBQUksQ0FB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QUUsa0JBQWtCO2dCQUNsQyw2QkFBNkIsRUFBRSxHQUFHO2dCQUNsQyw4QkFBOEIsRUFBRSxjQUFjO2dCQUM5Qyw4QkFBOEIsRUFBRSxNQUFNO2FBQ3ZDO1lBQ0QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ25CLEtBQUssRUFBRSx1QkFBdUI7YUFDL0IsQ0FBQztTQUNILENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBbkpXLFFBQUEsT0FBTyxXQW1KbEI7QUFFRixTQUFTLG9CQUFvQixDQUFDLEdBQVE7SUFDcEMsT0FBTyxDQUNMLE9BQU8sR0FBRyxLQUFLLFFBQVE7UUFDdkIsR0FBRyxLQUFLLElBQUk7UUFDWixPQUFPLEdBQUcsQ0FBQyxLQUFLLEtBQUssU0FBUztRQUM5QixPQUFPLEdBQUcsQ0FBQyxLQUFLLEtBQUssUUFBUTtRQUM3QixPQUFPLEdBQUcsQ0FBQyxXQUFXLEtBQUssUUFBUTtRQUNuQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLEtBQUssUUFBUSxDQUM5QixDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFQSUdhdGV3YXlQcm94eUV2ZW50LCBBUElHYXRld2F5UHJveHlSZXN1bHQgfSBmcm9tICdhd3MtbGFtYmRhJztcclxuaW1wb3J0IHsgRHluYW1vREJDbGllbnQgfSBmcm9tICdAYXdzLXNkay9jbGllbnQtZHluYW1vZGInO1xyXG5pbXBvcnQgeyBEeW5hbW9EQkRvY3VtZW50Q2xpZW50LCBQdXRDb21tYW5kIH0gZnJvbSAnQGF3cy1zZGsvbGliLWR5bmFtb2RiJztcclxuaW1wb3J0IHsgU05TQ2xpZW50LCBQdWJsaXNoQ29tbWFuZCB9IGZyb20gJ0Bhd3Mtc2RrL2NsaWVudC1zbnMnO1xyXG5pbXBvcnQgeyB2NCBhcyB1dWlkdjQgfSBmcm9tICd1dWlkJztcclxuXHJcbmNvbnN0IGR5bmFtb0NsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7fSk7XHJcbmNvbnN0IGRvY0NsaWVudCA9IER5bmFtb0RCRG9jdW1lbnRDbGllbnQuZnJvbShkeW5hbW9DbGllbnQpO1xyXG5jb25zdCBzbnNDbGllbnQgPSBuZXcgU05TQ2xpZW50KHt9KTtcclxuXHJcbmludGVyZmFjZSBKc29uT2JqZWN0IHtcclxuICB2YWxpZDogYm9vbGVhbjtcclxuICB2YWx1ZTogbnVtYmVyO1xyXG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XHJcbiAgYnV5ZXI6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50KTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcclxuICBjb25zb2xlLmxvZygnUmVjZWl2ZWQgZXZlbnQ6JywgSlNPTi5zdHJpbmdpZnkoZXZlbnQsIG51bGwsIDIpKTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJvZHkgPSBldmVudC5ib2R5O1xyXG4gICAgaWYgKCFib2R5KSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIGJvZHkgcHJvdmlkZWQgaW4gcmVxdWVzdCcpO1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcclxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZScsXHJcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdQT1NUJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgZXJyb3I6ICdObyByZXF1ZXN0IGJvZHkgcHJvdmlkZWQnXHJcbiAgICAgICAgfSlcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQganNvbk9iamVjdDogSnNvbk9iamVjdDtcclxuICAgIHRyeSB7XHJcbiAgICAgIGpzb25PYmplY3QgPSBKU09OLnBhcnNlKGJvZHkpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignSW52YWxpZCBKU09OIGZvcm1hdDonLCBlcnJvcik7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3RhdHVzQ29kZTogNDAwLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxyXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlJyxcclxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ1BPU1QnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICBlcnJvcjogJ0ludmFsaWQgSlNPTiBmb3JtYXQnXHJcbiAgICAgICAgfSlcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlzVmFsaWRKc29uU3RydWN0dXJlKGpzb25PYmplY3QpKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ludmFsaWQgSlNPTiBzdHJ1Y3R1cmUnKTtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdGF0dXNDb2RlOiA0MDAsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXHJcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUnLFxyXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnUE9TVCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgIGVycm9yOiAnSW52YWxpZCBKU09OIHN0cnVjdHVyZS4gUmVxdWlyZWQgZmllbGRzOiB2YWxpZCwgdmFsdWUsIGRlc2NyaXB0aW9uLCBidXllcidcclxuICAgICAgICB9KVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRpbWVzdGFtcCA9IERhdGUubm93KCk7XHJcbiAgICBjb25zdCBpdGVtSWQgPSB1dWlkdjQoKTtcclxuXHJcbiAgICBpZiAoanNvbk9iamVjdC52YWxpZCkge1xyXG4gICAgICBjb25zb2xlLmxvZygnUHJvY2Vzc2luZyB2YWxpZCBKU09OOicsIGpzb25PYmplY3QpO1xyXG4gICAgICBcclxuICAgICAgY29uc3QgZW1haWxNZXNzYWdlID0ge1xyXG4gICAgICAgIHN1YmplY3Q6ICdWYWxpZCBKU09OIE9iamVjdCBSZWNlaXZlZCcsXHJcbiAgICAgICAgYm9keTogYEEgdmFsaWQgSlNPTiBvYmplY3Qgd2FzIHJlY2VpdmVkOlxcblxcbiR7SlNPTi5zdHJpbmdpZnkoanNvbk9iamVjdCwgbnVsbCwgMil9XFxuXFxuVGltZXN0YW1wOiAke25ldyBEYXRlKHRpbWVzdGFtcCkudG9JU09TdHJpbmcoKX1gXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBjb25zdCBzbnNQYXJhbXMgPSB7XHJcbiAgICAgICAgVG9waWNBcm46IHByb2Nlc3MuZW52LlRPUElDX0FSTiEsXHJcbiAgICAgICAgU3ViamVjdDogZW1haWxNZXNzYWdlLnN1YmplY3QsXHJcbiAgICAgICAgTWVzc2FnZTogZW1haWxNZXNzYWdlLmJvZHksXHJcbiAgICAgICAgTWVzc2FnZUF0dHJpYnV0ZXM6IHtcclxuICAgICAgICAgICdlbWFpbF90eXBlJzoge1xyXG4gICAgICAgICAgICBEYXRhVHlwZTogJ1N0cmluZycsXHJcbiAgICAgICAgICAgIFN0cmluZ1ZhbHVlOiAndmFsaWRfanNvbl9ub3RpZmljYXRpb24nXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgYXdhaXQgc25zQ2xpZW50LnNlbmQobmV3IFB1Ymxpc2hDb21tYW5kKHNuc1BhcmFtcykpO1xyXG4gICAgICBjb25zb2xlLmxvZygnRW1haWwgc2VudCBmb3IgdmFsaWQgSlNPTicpO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdGF0dXNDb2RlOiAyMDAsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXHJcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUnLFxyXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnUE9TVCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgIG1lc3NhZ2U6ICdWYWxpZCBKU09OIHByb2Nlc3NlZCBzdWNjZXNzZnVsbHkuIEVtYWlsIG5vdGlmaWNhdGlvbiBzZW50LicsXHJcbiAgICAgICAgICBkYXRhOiBqc29uT2JqZWN0LFxyXG4gICAgICAgICAgdGltZXN0YW1wOiB0aW1lc3RhbXBcclxuICAgICAgICB9KVxyXG4gICAgICB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc29sZS5sb2coJ1Byb2Nlc3NpbmcgaW52YWxpZCBKU09OOicsIGpzb25PYmplY3QpO1xyXG4gICAgICBcclxuICAgICAgY29uc3QgdHRsID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCkgKyAoMjQgKiA2MCAqIDYwKTsgXHJcbiAgICAgIFxyXG4gICAgICBjb25zdCBkeW5hbW9QYXJhbXMgPSB7XHJcbiAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5UQUJMRV9OQU1FISxcclxuICAgICAgICBJdGVtOiB7XHJcbiAgICAgICAgICBQSzogYElOVkFMSURfSlNPTiMke2l0ZW1JZH1gLFxyXG4gICAgICAgICAgU0s6IGBUSU1FU1RBTVAjJHt0aW1lc3RhbXB9YCxcclxuICAgICAgICAgIGRhdGE6IGpzb25PYmplY3QsXHJcbiAgICAgICAgICB0aW1lc3RhbXA6IHRpbWVzdGFtcCxcclxuICAgICAgICAgIFRUTDogdHRsLFxyXG4gICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSh0aW1lc3RhbXApLnRvSVNPU3RyaW5nKClcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBhd2FpdCBkb2NDbGllbnQuc2VuZChuZXcgUHV0Q29tbWFuZChkeW5hbW9QYXJhbXMpKTtcclxuICAgICAgY29uc29sZS5sb2coJ0ludmFsaWQgSlNPTiBzdG9yZWQgaW4gRHluYW1vREInKTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3RhdHVzQ29kZTogMjAwLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxyXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlJyxcclxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ1BPU1QnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBKU09OIHN0b3JlZCBpbiBkYXRhYmFzZS4gV2lsbCBiZSBhdXRvbWF0aWNhbGx5IGRlbGV0ZWQgYWZ0ZXIgMjQgaG91cnMuJyxcclxuICAgICAgICAgIGRhdGE6IGpzb25PYmplY3QsXHJcbiAgICAgICAgICB0aW1lc3RhbXA6IHRpbWVzdGFtcCxcclxuICAgICAgICAgIGl0ZW1JZDogaXRlbUlkXHJcbiAgICAgICAgfSlcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgcHJvY2Vzc2luZyByZXF1ZXN0OicsIGVycm9yKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXR1c0NvZGU6IDUwMCxcclxuICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcclxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUnLFxyXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ1BPU1QnXHJcbiAgICAgIH0sXHJcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcidcclxuICAgICAgfSlcclxuICAgIH07XHJcbiAgfVxyXG59O1xyXG5cclxuZnVuY3Rpb24gaXNWYWxpZEpzb25TdHJ1Y3R1cmUob2JqOiBhbnkpOiBvYmogaXMgSnNvbk9iamVjdCB7XHJcbiAgcmV0dXJuIChcclxuICAgIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmXHJcbiAgICBvYmogIT09IG51bGwgJiZcclxuICAgIHR5cGVvZiBvYmoudmFsaWQgPT09ICdib29sZWFuJyAmJlxyXG4gICAgdHlwZW9mIG9iai52YWx1ZSA9PT0gJ251bWJlcicgJiZcclxuICAgIHR5cGVvZiBvYmouZGVzY3JpcHRpb24gPT09ICdzdHJpbmcnICYmXHJcbiAgICB0eXBlb2Ygb2JqLmJ1eWVyID09PSAnc3RyaW5nJ1xyXG4gICk7XHJcbn0gIl19