const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const snsClient = new SNSClient({});

const EVENTS_TABLE = process.env.EVENTS_TABLE;
const ZONE_DENSITY_TABLE = process.env.ZONE_DENSITY_TABLE;
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

// Helper: Sustainability Scorer
function calculateSustainabilityScore(data) {
    let score = 100;

    // Deduct for non-eco choices:
    if (data.foodType === 'non-veg') score -= 15;
    if (data.foodType === 'mixed') score -= 5;

    if (data.resources?.generators > 0) score -= 20;

    let greenTransport = (data.transport?.walking || 0) + (data.transport?.cycling || 0) + (data.transport?.bus || 0);
    if (greenTransport < 50) score -= 15;

    // Final score minimum 0
    return Math.max(0, score);
}

exports.handler = async (event) => {
    try {
        const httpMethod = event.httpMethod;
        const resource = event.resource; // e.g. /events or /events/{id}/zones

        if (resource === '/events' && httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { schoolId, name, venue, expectedAttendees, duration, resources, foodType, transport, status, actuals } = body;

            const eventId = body.eventId || `evt-${Date.now()}`;
            const timestamp = new Date().toISOString();

            const scoreData = actuals || { resources, foodType, transport };
            const computedScore = calculateSustainabilityScore(scoreData);

            await docClient.send(new PutCommand({
                TableName: EVENTS_TABLE,
                Item: {
                    PK: schoolId || 'school-1',
                    SK: `${eventId}#${timestamp}`,
                    name, venue, expectedAttendees, duration,
                    resources, foodType, transport,
                    preScore: !actuals ? computedScore : null,
                    finalScore: actuals ? computedScore : null,
                    status: status || 'PLANNED',
                    actuals
                }
            }));

            return { statusCode: 201, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ message: 'Event saved', eventId, score: computedScore }) };
        }
        else if (resource === '/events/{id}/zones' && httpMethod === 'POST') {
            const eventId = event.pathParameters.id;
            const body = JSON.parse(event.body || '{}');
            const { zoneId, headcount, areaSqM } = body;
            const timestamp = new Date().toISOString();

            const density = headcount / areaSqM;
            let alertFired = false;

            if (density > 2.0) {
                await snsClient.send(new PublishCommand({
                    TopicArn: SNS_TOPIC_ARN,
                    Subject: 'CRITICAL: Venue Overcrowding Alert',
                    Message: `Zone ${zoneId} at event ${eventId} has reached a dangerous density of ${density.toFixed(2)} people per sq m. Evacuate immediately.`
                }));
                alertFired = true;
            }

            await docClient.send(new PutCommand({
                TableName: ZONE_DENSITY_TABLE,
                Item: {
                    PK: `${eventId}#${zoneId}`,
                    SK: timestamp,
                    headcount,
                    areaSqM,
                    density,
                    alertFired
                }
            }));

            return { statusCode: 201, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ message: 'Density logged', density, alertFired }) };
        }
        else if (resource === '/events/{id}/zones' && httpMethod === 'GET') {
            const eventId = event.pathParameters.id;
            // Given PK: eventId#zoneId, we'd normally just scan or query for this event
            const res = await docClient.send(new ScanCommand({ TableName: ZONE_DENSITY_TABLE }));
            const zones = res.Items ? res.Items.filter(i => i.PK.startsWith(eventId)) : [];

            return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(zones) };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };

    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
