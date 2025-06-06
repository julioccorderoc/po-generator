import type { VercelRequest, VercelResponse } from '@vercel/node';

const TARGET_URL = 'https://juliotest.requestcatcher.com/test';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Only allow POST requests, reject everything else.
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    console.log('--- /api/test_post function triggered by a POST request ---');

    try {
        // 2. Get the data sent from your frontend test page.
        const frontendData = req.body;
        console.log('Data received from frontend:', frontendData);

        // 3. Forward the exact same data to the request catcher.
        console.log(`Forwarding data to: ${TARGET_URL}`);
        const response = await fetch(TARGET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // We are forwarding JSON
            },
            body: JSON.stringify(frontendData), // Stringify the object to send it
        });

        console.log(`Request catcher responded with status: ${response.status}`);

        // 4. Send a success response back to your frontend test page.
        res.status(200).json({
            success: true,
            message: 'Data successfully forwarded to request catcher.',
            dataSent: frontendData,
            forwardingStatus: response.status,
        });

    } catch (error) {
        console.error('--- ERROR in /api/test_post ---', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: errorMessage });
    }
}