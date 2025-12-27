import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { connectDB } from './config/db';
import authController from './controllers/auth.controller';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

connectDB();

app.use('/auth', authController);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: 'server error' });
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
