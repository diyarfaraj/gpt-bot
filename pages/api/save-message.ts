import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../cosmosDb';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const container = client.database('DiyarBotDb').container('messages');
    let ipAddress: string | string[] | undefined = '';
    if (process.env.NODE_ENV === 'development') {
      ipAddress = '80.79.81.23:21671';
    } else {
      ipAddress =
        req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    }

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

      const itemResponse = await container.item(ip, ip).read();

      if (itemResponse.statusCode === 200) {
        const document = itemResponse.resource;
        const uniqueMessages = filterUniqueMessages(
          document.message.concat(message),
        );

        document.message = uniqueMessages;

        console.log('diyar docu mess', document.message);

        await container.items.upsert(document);
        res.status(200).json({ success: true });
      } else {
        const newItem = {
          id: ip,
          message,
          ip,
          date,
          city,
          region,
          country,
          loc,
          postal,
          org,
        };

        await container.items.upsert(newItem);
        res.status(201).json({ success: true });
      }
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).json({ error: 'Failed to save message' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

function filterUniqueMessages(messages: any) {
  const seenMessages = new Set();

  return messages.filter((message: any) => {
    const isDuplicate = seenMessages.has(message.message);
    seenMessages.add(message.message);
    return !isDuplicate;
  });
}
