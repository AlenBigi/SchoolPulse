const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;
const EVENTS_TABLE = process.env.EVENTS_TABLE;

exports.handler = async (event) => {
    try {
        const httpMethod = event.httpMethod;

        if (httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { schoolId, foodWaste, plasticWaste, paperWaste, eWaste, date } = body;

            if (!schoolId || typeof foodWaste !== 'number') {
                return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
            }

            const timestamp = date || new Date().toISOString();
            const dateOnly = timestamp.split('T')[0];
            const totalWaste = foodWaste + plasticWaste + paperWaste + eWaste;

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

            // Fetch last 28 days for average
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 28);

            const historyRes = await docClient.send(new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: 'PK = :pk AND SK >= :fromDate',
                ExpressionAttributeValues: {
                    ':pk': schoolId,
                    ':fromDate': fromDate.toISOString()
                }
            }));

            let isSpike = false;
            if (historyRes.Items && historyRes.Items.length >= 7) {
                const values = historyRes.Items.map(i => i.totalWaste);
                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                if (totalWaste > avg * 1.5) { // 50% spike
                    isSpike = true;
                }
            }

            await docClient.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    PK: schoolId,
                    SK: timestamp,
                    foodWaste,
                    plasticWaste,
                    paperWaste,
                    eWaste,
                    totalWaste,
                    isSpike,
                    eventDay: isEventDay,
                    enteredBy: 'WasteStaff'
                }
            }));

            return {
                statusCode: 201,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Waste logged', isSpike, isEventDay })
            };
        }
        else if (httpMethod === 'GET') {
            const schoolId = event.queryStringParameters?.schoolId || 'school-1';
            let days = parseInt(event.queryStringParameters?.days || '7');

            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - days);

            const res = await docClient.send(new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: 'PK = :pk AND SK >= :fromDate',
                ExpressionAttributeValues: {
                    ':pk': schoolId,
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
