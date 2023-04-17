import { NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import multer from 'multer';
import container from '@azure/cosmos';
import { NextApiRequestWithFile } from '@/declarations/nextApiRequestWithFile';

const upload = multer({ storage: multer.memoryStorage() });

const apiRoute = nextConnect<NextApiRequestWithFile, NextApiResponse>({
  onError(error, _, res) {
    console.error('Error during file upload:', error);
    res
      .status(501)
      .json({ error: `Sorry, something went wrong: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  },
});

apiRoute.use(upload.single('file'));

apiRoute.post(async (req: NextApiRequestWithFile, res: NextApiResponse) => {
  const base64Pdf = req.file.buffer.toString('base64');

  const pdfItem = {
    id: Date.now().toString(),
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    data: base64Pdf,
  };

  try {
    await container.items.create(pdfItem);
    res.status(200).json({
      success: true,
      message: 'File uploaded and stored in Cosmos DB',
    });
  } catch (error) {
    console.error('Error storing the file in Cosmos DB:', error);
    res
      .status(500)
      .json({ error: `Error storing the file in Cosmos DB: ${error.message}` });
  }
});

export default apiRoute;
