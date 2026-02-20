const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const ENERGY_TABLE = process.env.ENERGY_TABLE;
const WATER_TABLE = process.env.WATER_TABLE;
const WASTE_TABLE = process.env.WASTE_TABLE;
const EVENTS_TABLE = process.env.EVENTS_TABLE;

exports.handler = async (event) => {
    try {
        if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };

        // 1. Fetch cross-module data to calculate EcoScore
        // Note: For prototype we scan. In prod we'd query last 30 days.
        const energyData = (await docClient.send(new ScanCommand({ TableName: ENERGY_TABLE }))).Items || [];
        const waterData = (await docClient.send(new ScanCommand({ TableName: WATER_TABLE }))).Items || [];
        const wasteData = (await docClient.send(new ScanCommand({ TableName: WASTE_TABLE }))).Items || [];
        const eventData = (await docClient.send(new ScanCommand({ TableName: EVENTS_TABLE }))).Items || [];

        // 2. Base EcoScore defaults to 100, deduct based on anomalies/spikes
        let energyScore = 100; // 30% weight
        let waterScore = 100;  // 20% weight
        let wasteScore = 100;  // 20% weight
        let eventScore = 100;  // 15% weight
        let pledgeScore = 0;  // Real integration via DB required for aggregation

        // Count un-contextualized anomalies
        let energyAnomalies = energyData.filter(d => d.isAnomaly && !d.eventDay).length;
        let waterAnomalies = waterData.filter(d => d.isAnomaly && !d.eventDay).length;
        let wasteSpikes = wasteData.filter(d => d.isSpike && !d.eventDay).length;

        energyScore -= (energyAnomalies * 10);
        waterScore -= (waterAnomalies * 10);
        wasteScore -= (wasteSpikes * 10);

        // Average event scores
        if (eventData.length > 0) {
            const sumScores = eventData.reduce((acc, e) => acc + (e.finalScore || e.preScore || 100), 0);
            eventScore = sumScores / eventData.length;
        }

        // Clamp 0-100
        energyScore = Math.max(0, energyScore);
        waterScore = Math.max(0, waterScore);
        wasteScore = Math.max(0, wasteScore);

        // Weighted Average
        const ecoScore = Math.round(
            (energyScore * 0.30) +
            (waterScore * 0.20) +
            (wasteScore * 0.20) +
            (eventScore * 0.15) +
            (pledgeScore * 0.15)
        );

        // Determine Grade
        let grade = 'F';
        if (ecoScore >= 80) grade = 'A';
        else if (ecoScore >= 60) grade = 'B';
        else if (ecoScore >= 40) grade = 'C';
        else if (ecoScore >= 20) grade = 'D';

        // 3. Generate Insights Server-Side
        const insights = [];

        // Find recent unexplained spikes
        const recentWaterAnomaly = waterData.find(d => d.isAnomaly && !d.eventDay);
        if (recentWaterAnomaly) {
            insights.push({
                type: 'warning',
                title: 'Unexplained Water Spike',
                message: `An unexplained water spike was detected recently. Check plumbing.`
            });
        }

        // Find event that caused energy spike
        const eventCausedSpike = energyData.find(d => d.isAnomaly && d.eventDay);
        if (eventCausedSpike) {
            insights.push({
                type: 'info',
                title: 'Event Energy Context',
                message: `Energy spike on ${eventCausedSpike.SK.split('T')[0]} was likely caused by a scheduled event.`
            });
        }

        // Gamification / Positive insight
        if (wasteSpikes === 0 && wasteData.length > 5) {
            insights.push({
                type: 'success',
                title: 'Waste Milestone 🎉',
                message: 'No unexplained waste spikes this month! Great job sorting.'
            });
        }


        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                ecoScore,
                grade,
                breakdown: { energyScore, waterScore, wasteScore, eventScore, pledgeScore },
                insights
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
