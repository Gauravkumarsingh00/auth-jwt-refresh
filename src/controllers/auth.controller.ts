import express from 'express';
import User, { IUser } from '../models/user.model';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../services/auth.service';

const router = express.Router();

router.post(
  '/register',
  async (req: express.Request, res: express.Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Username and password are required' });
    }
    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      const hashedPassword = await hashPassword(password);
      const user = new User({ username, password: hashedPassword });
      await user.save();
      res
        .status(201)
        .json({ message: 'User registered successfully', userId: user._id });
    } catch (err) {
      res.status(500).json({ message: 'error registering user' });
    }
  }
);

router.post('/login', async (req: express.Request, res: express.Response) => {
  const { username, password } = req.body;
  console.log('login attempt for user:', username);
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' });
  }
  try {
    const user = await User.findOne({ username });
    console.log('searching for user:', username);

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.password);
    console.log('password match:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const userId = user._id.toString();
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'error logging in' });
  }
});

router.post(
  '/refresh-token',
  async (req: express.Request, res: express.Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    const { userId } = payload;
    const newAccessToken = generateAccessToken(userId);
    const newRefreshToken = generateRefreshToken(userId);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  }
);

export default router;
