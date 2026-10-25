import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'reporadar_dev_jwt_secret_key_change_in_production';
const JWT_EXPIRES_IN = '7d';

/**
 * Signs a JWT token with user ID
 */
export function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
