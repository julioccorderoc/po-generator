const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const endpoint = process.env.API_ENDPOINT_POST;
        if (!endpoint) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'API endpoint not configured' }),
            };
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: event.body
        });

        const data = await response.text();

        return {
            statusCode: response.status,
            body: data
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to forward request' }),
        };
    }
};