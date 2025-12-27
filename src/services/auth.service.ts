import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

if (process.env.JWT_SECRET && process.env.JWT_REFRESH_SECRET) {
  console.log('JWT secrets loaded from .env');
} else {
  console.warn('Using fallback JWT secrets (for development only)');
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashed: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashed);
};

export const generateAccessToken = (userId: string): string => {
  console.log('Generating access token with secret length:', JWT_SECRET.length); // Debug line
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1m' });
};

export const generateRefreshToken = (userId: string): string => {
  console.log(
    'Generating refresh token with secret length:',
    JWT_REFRESH_SECRET.length
  ); // Debug line
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyRefreshToken = (
  token: string
): { userId: string } | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
  } catch (err) {
    return null;
  }
};
