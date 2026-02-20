const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const ENERGY_TABLE = process.env.ENERGY_TABLE;
const WATER_TABLE = process.env.WATER_TABLE;
const WASTE_TABLE = process.env.WASTE_TABLE;
const REPORTS_BUCKET = process.env.REPORTS_BUCKET;

// Emission Factors (from requirements)
const FACTORS = {
    energy_kwh: 0.82,     // 0.82 kg CO2e / kWh
    water_l: 0.0003,      // 0.0003 kg CO2e / Litre
    waste_food: 2.5,      // 2.5 kg CO2e / kg
    waste_plastic: 6.0,   // 6.0 kg CO2e / kg
    waste_paper: 1.3      // 1.3 kg CO2e / kg
};

exports.handler = async (event) => {
    try {
        if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };

        const schoolId = event.queryStringParameters?.schoolId || 'school-1';

        // NOTE: In production, we'd use Query with specific date ranges (Term start to end)
        // using SK (timestamp) range queries. For this prototype, we'll scan and aggregate
        // all available data to generate the report.

        // 1. Sum Energy
        const energyRes = await docClient.send(new ScanCommand({ TableName: ENERGY_TABLE }));
        let totalKwh = 0;
        (energyRes.Items || []).forEach(item => { totalKwh += (item.kWh || 0); });
        const energyCO2 = totalKwh * FACTORS.energy_kwh;

        // 2. Sum Water
        const waterRes = await docClient.send(new ScanCommand({ TableName: WATER_TABLE }));
        let totalLitres = 0;
        (waterRes.Items || []).forEach(item => { totalLitres += (item.litres || 0); });
        const waterCO2 = totalLitres * FACTORS.water_l;

        // 3. Sum Waste
        const wasteRes = await docClient.send(new ScanCommand({ TableName: WASTE_TABLE }));
        let wasteCO2 = 0;
        let foodWg = 0, plasticWg = 0, paperWg = 0;
        (wasteRes.Items || []).forEach(item => {
            foodWg += (item.foodWaste || 0);
            plasticWg += (item.plasticWaste || 0);
            paperWg += (item.paperWaste || 0);
        });
        wasteCO2 = (foodWg * FACTORS.waste_food) + (plasticWg * FACTORS.waste_plastic) + (paperWg * FACTORS.waste_paper);

        // Calculate Totals (in Tonnes)
        const totalKg = energyCO2 + waterCO2 + wasteCO2;
        const totalTonnes = +(totalKg / 1000).toFixed(2);

        const breakdown = {
            energy: +(energyCO2 / 1000).toFixed(2),
            water: +(waterCO2 / 1000).toFixed(2),
            waste: +(wasteCO2 / 1000).toFixed(2),
            total: totalTonnes,
            raw: { totalKwh, totalLitres, foodWg, plasticWg, paperWg }
        };

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(breakdown)
        };

    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
