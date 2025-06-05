import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // You can forward the request, save to a DB, or just echo back for now
    // Example: Forward to external API (if needed)
    // const response = await fetch('https://external-api.com/endpoint', { ... });

    // For now, just return the received data
    return res.status(200).json({ received: req.body });
}