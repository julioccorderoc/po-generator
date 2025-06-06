const TARGET_URL = 'https://juliotest.requestcatcher.com/test';

module.exports = async (req, res) => {
    try {
        console.log('CJS function triggered. Sending POST to target...');

        // Use fetch to send the POST request
        const response = await fetch(TARGET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: 'Hello World!',
        });

        console.log(`CJS function: Target responded with status ${response.status}`);

        // Respond to the original caller indicating success
        res.status(200).json({
            success: true,
            message: 'Request sent from test_cjs.cjs',
            remote_status: response.status,
            remote_status_text: response.statusText
        });

    } catch (error) {
        console.error('Error in test_cjs.cjs:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: errorMessage });
    }
};