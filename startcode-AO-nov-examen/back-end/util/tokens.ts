import crypto from 'crypto';
import bcrypt from 'bcrypt';

const generateToken = (len = 48) => crypto.randomBytes(len).toString('hex');

const hashToken = async (token: string) => {
  const saltRounds = 12;
  return bcrypt.hash(token, saltRounds);
};

const generateMfaCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hash = async (s: string) => {
  const saltRounds = 12;
  return bcrypt.hash(s, saltRounds);
};

const compareHash = async (token: string, hash: string) => {
  return bcrypt.compare(token, hash);
};

export {
    generateToken,
    hashToken,
    generateMfaCode,
    hash,
    compareHash
};