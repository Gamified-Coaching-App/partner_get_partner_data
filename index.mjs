import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchGetCommand } from '@aws-sdk/lib-dynamodb';

const region = "eu-west-2"; // Specify the AWS Region
const dynamo_db_client = DynamoDBDocumentClient.from(new DynamoDB({ region }));

export const handler = async (event) => {
    try {
        const { userIds } = event.queryStringParameters;
        const userIdsArray = userIds.split(',');
        const params = {
            RequestItems: {
                partner_connections: {
                    Keys: userIdsArray.map(userId => ({ userId })),
                },
            },
        };

        // Execute the batch get operation
        const data = await dynamo_db_client.send(new BatchGetCommand(params));

        // Extract the items
        const items = data.Responses.partner_connections;

        // Construct the response
        const result = items.map(item => ({
            partner: item.partner,
            partner_oauth_token: item.partner_oauth_token,
            partner_token_secret: item.partner_token_secret,
            partner_user_id: item.partner_user_id,
        }));

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result),
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};
