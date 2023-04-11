import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../cosmosDb';
import axios from 'axios';

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
    // const ipAddress: string | string[] | undefined =
    // req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ipAddress = '80.79.80.23:21671';

    const regex: RegExp = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
    const matches: RegExpMatchArray | null | undefined = Array.isArray(
      ipAddress,
    )
      ? ipAddress[0].match(regex)
      : ipAddress?.match(regex);
    const ip: string = matches ? matches[1] : '';
    const date = new Date().toISOString();

    try {
      const response = await axios.get(
        `https://ipinfo.io/${ip}?token=${process.env.APIINFO_KEY}`,
      );
      const { city, region, country, loc, postal, org } = response.data;

      await container.items.create({
        message,
        ip,
        date,
        city,
        region,
        country,
        loc,
        postal,
        org,
      });
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).json({ error: 'Failed to save message' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
