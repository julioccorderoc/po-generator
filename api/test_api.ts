// File: /api/test_post.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';

// The URL is hardcoded to eliminate any environment variable issues.
const TARGET_URL = 'https://juliotest.requestcatcher.com/test';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // You can trigger this by simply visiting the URL in your browser (it's a GET request).
    console.log('--- test_post function initiated ---');

    try {
        console.log(`Sending POST request to: ${TARGET_URL}`);

        const response = await fetch(TARGET_URL, {
            method: 'POST', // We are explicitly testing the POST method.
            headers: {
                'Content-Type': 'text/plain',
            },
            // The body is hardcoded to eliminate any issues with your frontend's req.body.
            body: 'Hello World from the Vercel test endpoint!',
        });

        console.log(`Fetch completed. Target responded with status: ${response.status}`);

        // Send a success response back to you in the browser.
        res.status(200).json({
            success: true,
            message: 'Test POST request sent successfully.',
            target_url: TARGET_URL,
            target_response_status: response.status,
        });

    } catch (error) {
        console.error('--- ERROR in test_post function ---', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: errorMessage });
    }
}