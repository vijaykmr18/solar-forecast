import bcrypt from 'bcryptjs';
import { getDb } from '../../../lib/mongodb';
import { signToken, setAuthCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const db = await getDb();
    const users = db.collection('users');

    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await users.insertOne({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      createdAt: new Date(),
      totalForecasts: 0,
    });

    const token = await signToken({
      userId: result.insertedId.toString(),
      email: email.toLowerCase(),
      name: name.trim(),
    });

    setAuthCookie(res, token);

    return res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: result.insertedId.toString(),
        name: name.trim(),
        email: email.toLowerCase(),
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
