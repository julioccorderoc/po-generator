const TARGET_URL = 'https://juliotest.requestcatcher.com/test';

export default async function handler(req: any, res: any) {
    try {
        console.log('TS (ESM) function triggered. Sending POST to target...');

        // Use fetch to send the POST request
        const response = await fetch(TARGET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain', // Sending plain text
            },
            body: 'Hello World!',
        });

        console.log(`TS (ESM) function: Target responded with status ${response.status}`);

        // Respond to the original caller indicating success
        res.status(200).json({
            success: true,
            message: 'Request sent from test_ts.ts',
            remote_status: response.status,
            remote_status_text: response.statusText
        });

    } catch (error) {
        console.error('Error in test_ts.ts:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: errorMessage });
    }
}