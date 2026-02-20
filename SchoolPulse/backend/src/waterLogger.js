const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const snsClient = new SNSClient({});

const TABLE_NAME = process.env.TABLE_NAME;
const EVENTS_TABLE = process.env.EVENTS_TABLE;
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

function calculateStandardDeviation(values) {
    if (values.length === 0) return { mean: 0, sd: 0 };
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    return { mean, sd: Math.sqrt(variance) };
}

exports.handler = async (event) => {
    try {
        const httpMethod = event.httpMethod;

        if (httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { schoolId, blockId, litres, date } = body;

            if (!schoolId || !blockId || typeof litres !== 'number') {
                return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
            }

            const timestamp = date || new Date().toISOString();
            const dateOnly = timestamp.split('T')[0];

            let isEventDay = false;
            const eventRes = await docClient.send(new QueryCommand({
                TableName: EVENTS_TABLE,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :datePrefix)',
                ExpressionAttributeValues: {
                    ':pk': schoolId,
                    ':datePrefix': dateOnly
                }
            }));
            if (eventRes.Items && eventRes.Items.length > 0) {
                isEventDay = true;
            }

            const historyRes = await docClient.send(new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: 'PK = :pk',
                ExpressionAttributeValues: {
                    ':pk': `${schoolId}#${blockId}`
                },
                ScanIndexForward: false,
                Limit: 28
            }));

            let isAnomaly = false;
            if (historyRes.Items && historyRes.Items.length >= 7) {
                const values = historyRes.Items.map(i => i.litres);
                const { mean, sd } = calculateStandardDeviation(values);
                if (litres > mean + (2 * sd)) {
                    isAnomaly = true;
                }
            }

            await docClient.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    PK: `${schoolId}#${blockId}`,
                    SK: timestamp,
                    litres: litres,
                    isAnomaly: isAnomaly,
                    eventDay: isEventDay,
                    enteredBy: 'FacilityManager'
                }
            }));

            let alertFired = false;
            if (isAnomaly && !isEventDay) {
                await snsClient.send(new PublishCommand({
                    TopicArn: SNS_TOPIC_ARN,
                    Subject: 'SchoolPulse Alert: Water Anomaly Detected',
                    Message: `A water usage spike of ${litres} litres was detected in ${blockId}. Possible burst pipe / tap left running.`
                }));
                alertFired = true;
            }

            return {
                statusCode: 201,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Reading saved', isAnomaly, isEventDay, alertFired })
            };
        }
        else if (httpMethod === 'GET') {
            const block = event.queryStringParameters?.block;
            const schoolId = event.queryStringParameters?.schoolId || 'school-1';
            let days = parseInt(event.queryStringParameters?.days || '30');

            if (!block) return { statusCode: 400, body: JSON.stringify({ error: 'block is required' }) };

            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - days);

            const res = await docClient.send(new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: 'PK = :pk AND SK >= :fromDate',
                ExpressionAttributeValues: {
                    ':pk': `${schoolId}#${block}`,
                    ':fromDate': fromDate.toISOString()
                }
            }));

            return {
                statusCode: 200,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify(res.Items || [])
            };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };

    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
