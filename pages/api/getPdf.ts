import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import container from '@azure/cosmos';

const apiRoute = nextConnect<NextApiRequest, NextApiResponse>({
  onError(error, _, res) {
    console.error('Error during file retrieval:', error);
    res
      .status(501)
      .json({ error: `Sorry, something went wrong: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  },
});

apiRoute.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  try {
    const { resource: pdfItem } = await container.item(id as string).read();
    const pdfBuffer = Buffer.from(pdfItem.data, 'base64');

    res.setHeader('Content-Type', pdfItem.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${pdfItem.fileName}`,
    );
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error retrieving the file from Cosmos DB:', error);
    res.status(500).json({
      error: `Error retrieving the file from Cosmos DB: ${error.message}`,
    });
  }
});

export default apiRoute;
