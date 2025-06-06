import type { VercelRequest, VercelResponse } from '@vercel/node';

const TARGET_URL = 'https://juliotest.requestcatcher.com/test';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        // Prepare hello world payload with current timestamp
        const payload = {
            message: 'hello world',
            now: new Date().toISOString()
        };

        // Forward the payload to the request catcher
        const response = await fetch(TARGET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // Respond to frontend
        res.status(200).json({
            success: true,
            message: 'Hello world and timestamp sent to request catcher.',
            dataSent: payload,
            forwardingStatus: response.status,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: errorMessage });
    }
}