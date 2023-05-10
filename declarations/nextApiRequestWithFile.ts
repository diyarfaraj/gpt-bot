import { NextApiRequest } from 'next';
import { Express } from 'express';

export interface NextApiRequestWithFile extends NextApiRequest {
  file: Express.Multer.File;
}
