module.exports = async (req, res) => {
    // Make sure the request method is POST
    if (req.method !== 'POST') {
        // Vercel automatically provides .json() and other helpers on the res object.
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const endpoint = process.env.API_ENDPOINT_POST;
        if (!endpoint) {
            console.error('API_ENDPOINT_POST environment variable is not set.');
            return res.status(500).json({ error: 'Server configuration error.' });
        }

        // 'fetch' is globally available in Vercel's Node.js 18+ runtime.
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        // Get the response body as text to forward it directly.
        const data = await response.text();

        // Forward the status code and the response body from the target API.
        return res.status(response.status).send(data);

    } catch (error) {
        console.error('Error forwarding request:', error);
        return res.status(500).json({ error: 'Failed to forward request' });
    }
};