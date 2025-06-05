const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const endpoint = process.env.API_ENDPOINT_POST;
        if (!endpoint) {
            return res.status(500).json({ error: 'API endpoint not configured' });
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.text();

        return res.status(response.status).send(data);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to forward request' });
    }
};

module.exports = handler;