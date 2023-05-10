import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    // const { pdfId } = req.query;

    // if (!pdfId) {
    //   res.status(400).json({ error: 'Missing pdfId parameter' });
    //   return;
    // }

    const ip: string = getUserIpAdress(req);

    try {
      const response = await fetch(
        `http://localhost:5000/api/getPdf/pdf-${ip}`,
      );

      if (!response.ok) {
        throw new Error('Failed to get PDF');
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error: any) {
      console.error('Error getting PDF:', error);
      res.status(500).json({ error: `Error getting PDF: ${error.message}` });
    }
  } else {
    res.setHeader('Allow', 'GET');
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function getUserIpAdress(req: NextApiRequest) {
  let ipAddress: string | string[] | undefined = '';
  if (process.env.NODE_ENV === 'development') {
    ipAddress = '127.0.0.1:21671';
  } else {
    ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  }

  const regex: RegExp = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
  const matches: RegExpMatchArray | null | undefined = Array.isArray(ipAddress)
    ? ipAddress[0].match(regex)
    : ipAddress?.match(regex);
  const ip: string = matches ? matches[1] : '';
  return ip;
}
