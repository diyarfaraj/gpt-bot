// import type { NextApiRequest } from 'next';
// import { NextApiResponse } from 'next';
// import nextConnect from 'next-connect';
// import { NextApiRequestWithFile } from '@/declarations/nextApiRequestWithFile';
// import container from '../../cosmosDb';
// import FormData from 'form-data';

// const apiRoute = nextConnect<NextApiRequestWithFile, NextApiResponse>({
//   onError(error, _, res) {
//     console.error('Error during file upload:', error);
//     res
//       .status(501)
//       .json({ error: `Sorry, something went wrong: ${error.message}` });
//   },
//   onNoMatch(req, res) {
//     res.status(405).json({ error: `Method ${req.method} not allowed` });
//   },
// });

// apiRoute.use(async (req: NextApiRequestWithFile, res, next) => {
//   if (req.method !== 'POST') {
//     return next();
//   }

//   const form = new FormData();
//   const result = await new Promise((resolve, reject) => {
//     form.parse(req, async (err, fields, files) => {
//       if (err) {
//         reject(err);
//       } else {
//         const file = files.file[0] as multer.File;
//         req.file = file;
//         resolve(file);
//       }
//     });
//   });

//   if (!result) {
//     return res.status(400).json({ error: 'No file was provided' });
//   }

//   next();
// });

// apiRoute.post(async (req: NextApiRequestWithFile, res: NextApiResponse) => {
//   const base64Pdf = req.file.buffer.toString('base64');

//   const pdfItem = {
//     id: Date.now().toString(),
//     fileName: req.file.originalname,
//     mimeType: req.file.mimetype,
//     data: base64Pdf,
//   };

//   try {
//     await container.items.create(pdfItem);
//     res.status(200).json({
//       success: true,
//       message: 'File uploaded and stored in Cosmos DB',
//     });
//   } catch (error: any) {
//     console.error('Error storing the file in Cosmos DB:', error);
//     res
//       .status(500)
//       .json({ error: `Error storing the file in Cosmos DB: ${error.message}` });
//   }
// });

// export default apiRoute;
