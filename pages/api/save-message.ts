import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../cosmosDb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const { message } = req.body;
    console.log('diyar message', message);
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const container = client.database('DiyarBotDb').container('messages');

    try {
      await container.items.create({ message });
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).json({ error: 'Failed to save message' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
