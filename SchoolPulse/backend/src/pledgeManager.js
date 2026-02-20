const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const PLEDGES_TABLE = process.env.PLEDGES_TABLE;

// Impact Equivalencies
const IMPACT_MAPPING = {
    'cycle': { type: 'CO2', value: 0.5 }, // 0.5 kg CO2e saved
    'bottle': { type: 'Plastic', value: 0.05 }, // 50g plastic saved
    'meat': { type: 'CO2', value: 2.0 }, // 2.0 kg CO2e saved
    'lights': { type: 'Energy', value: 0.2 }, // 0.2 kWh saved
    'plastic': { type: 'Plastic', value: 0.1 } // 100g plastic saved
};

exports.handler = async (event) => {
    try {
        const httpMethod = event.httpMethod;
        const resource = event.resource;

        if (resource === '/pledges' && httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { studentId, studentClass, pledgeType, date } = body;

            if (!studentId || !studentClass || !pledgeType) {
                return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
            }

            const timestamp = date || new Date().toISOString();
            const dateOnly = timestamp.split('T')[0];

            // Check for existing pledge of the same type by user today
            const checkRes = await docClient.send(new QueryCommand({
                TableName: PLEDGES_TABLE,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :datePrefix)',
                ExpressionAttributeValues: {
                    ':pk': studentId,
                    ':datePrefix': dateOnly
                }
            }));

            if (checkRes.Items && checkRes.Items.length > 0) {
                const todayTypes = checkRes.Items.map(i => i.pledgeType);
                if (todayTypes.includes(pledgeType)) {
                    return { statusCode: 400, body: JSON.stringify({ error: 'Pledge already completed today' }) };
                }
            }

            // Calculate streak (Query past 30 days)
            const historyRes = await docClient.send(new QueryCommand({
                TableName: PLEDGES_TABLE,
                KeyConditionExpression: 'PK = :pk',
                ExpressionAttributeValues: {
                    ':pk': studentId
                },
                ScanIndexForward: false
            }));

            let streak = 1;
            let lastDate = new Date(dateOnly);

            if (historyRes.Items && historyRes.Items.length > 0) {
                // Simplified Streak calculation
                const dates = [...new Set(historyRes.Items.map(i => i.SK.split('T')[0]))].sort().reverse();

                for (let i = 0; i < dates.length; i++) {
                    const checkDate = new Date(lastDate);
                    checkDate.setDate(checkDate.getDate() - 1);
                    if (dates[i] === checkDate.toISOString().split('T')[0]) {
                        streak++;
                        lastDate = checkDate;
                    } else {
                        break;
                    }
                }
            }

            const impact = IMPACT_MAPPING[pledgeType] || { type: 'Points', value: 1 };

            await docClient.send(new PutCommand({
                TableName: PLEDGES_TABLE,
                Item: {
                    PK: studentId,
                    SK: timestamp,
                    studentClass,
                    pledgeType,
                    impactType: impact.type,
                    impactValue: impact.value,
                    streak
                }
            }));

            return {
                statusCode: 201,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Pledge saved!', streak, impact })
            };
        }
        else if (resource === '/pledges/leaderboard' && httpMethod === 'GET') {
            // NOTE: In production, using Scan on DynamoDB for Leaderboards is an anti-pattern. 
            // Better to use GSI or aggregate during write to a separate leaderboard table. 
            // Doing a Scan here for prototype simplicity since data is small.

            const scanRes = await docClient.send(new ScanCommand({
                TableName: PLEDGES_TABLE,
            }));

            const classScores = {};
            const itemCounts = scanRes.Items || [];

            itemCounts.forEach(item => {
                const sClass = item.studentClass || 'Unknown';
                if (!classScores[sClass]) classScores[sClass] = 0;
                classScores[sClass] += 10; // 10 points per pledge
            });

            // Return top 5
            const leaderboard = Object.keys(classScores)
                .map(key => ({ class: key, score: classScores[key] }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);

            return {
                statusCode: 200,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ leaderboard })
            };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };

    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
