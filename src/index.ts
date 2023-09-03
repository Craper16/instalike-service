import * as dotenv from 'dotenv';
dotenv.config();

import express, {
  json,
  urlencoded,
  Request,
  Response,
  NextFunction,
} from 'express';

import cors from 'cors';
import { connectToDb } from './helpers/db';
import multer from 'multer';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import searchRoutes from './routes/search';
import followRoutes from './routes/user';
import postRoutes from './routes/post';
import commentRoutes from './routes/comment';
import likeRoutes from './routes/like';
import { createTransport } from 'nodemailer';
import * as jose from 'jose';
import { GridFsStorage } from 'multer-gridfs-storage';

export interface ErrorResponse extends Error {
  status: number;
  data?: { message: string; statusCode: number; reason?: string; data?: any[] };
}

export const secret = jose.base64url.decode(process.env.SECRET!);

connectToDb()
  .then(() => console.log('Connected'))
  .catch((error) => console.log(error));

export let bucket: mongoose.mongo.GridFSBucket;

mongoose.connection.on('connected', () => {
  const db = mongoose.connections[0].db;

  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'profileImages',
  });
});

const storage = new GridFsStorage({
  url: process.env.DB_URI!,
});

export const upload = multer({ storage });

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());

app.get('/file/:id', (req, res, next) => {
  try {
    const fileId = req.params.id;
    const downloadStream = bucket.openDownloadStream(
      new mongoose.Types.ObjectId(fileId)
    );
    downloadStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/user', followRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/like', likeRoutes);

app.use('*', (req: Request, res: Response) => {
  return res.status(404).json({ message: 'Endpoint does not exist' });
});

export const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODE_MAILER_GMAIL!,
    pass: process.env.NODE_MAILER_PASSWORD!,
  },
});

app.use(
  (error: ErrorResponse, req: Request, res: Response, next: NextFunction) => {
    const { message, status, data } = error;
    res
      .status(status)
      .json({ message: message || 'Internal server error', data: data });
  }
);

app.listen(process.env.PORT || 8060);
