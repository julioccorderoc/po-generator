

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Forward the request to the external API
        const response = await fetch('https://juliotest.requestcatcher.com/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.text(); // requestcatcher may not return JSON

        return res.status(response.status).send(data);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to forward request' });
    }
}