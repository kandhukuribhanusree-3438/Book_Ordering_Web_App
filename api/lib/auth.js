import jwt from 'jsonwebtoken';

export function signToken(user) {
  const payload = { sub: user._id.toString(), email: user.email, role: user.role };
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  
  if (!token) {
    return null;
  }
  
  try {
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const payload = jwt.verify(token, secret);
    return payload;
  } catch (e) {
    return null;
  }
}

export function requireAuth(requiredRole = null) {
  return (req) => {
    const user = verifyToken(req);
    if (!user) {
      throw { status: 401, message: 'Unauthorized' };
    }
    if (requiredRole && user.role !== requiredRole) {
      throw { status: 403, message: 'Forbidden' };
    }
    return user;
  };
}

