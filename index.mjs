import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const region = "eu-west-2"; // Specify the AWS Region
const dynamo_db_client = DynamoDBDocumentClient.from(new DynamoDB({ region }));

export const handler = async (event) => {
    try {
        const { userIds } = event.queryStringParameters;
        const userIdsArray = userIds.split(',');

        const results = {};

        for (const userId of userIdsArray) {
            const params = {
                TableName: "partner_connections",
                KeyConditionExpression: "user_id = :userId",
                ExpressionAttributeValues: {
                    ":userId": userId,
                },
            };

            // Execute the query
            const data = await dynamo_db_client.send(new QueryCommand(params));

            // Extract the items
            const items = data.Items;

            // Initialize the userId entry if it doesn't exist
            if (!results[userId]) {
                results[userId] = {};
            }

            // Populate the results dictionary
            items.forEach(item => {
                results[userId][item.partner] = {
                    partner_oauth_token: item.partner_oauth_token,
                    partner_token_secret: item.partner_token_secret,
                    partner_user_id: item.partner_user_id,
                };
            });
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(results),
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
