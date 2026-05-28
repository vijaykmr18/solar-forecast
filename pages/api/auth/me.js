import { getAuthUser } from '../../../lib/auth';
import { getDb } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const db = await getDb();
    const dbUser = await db
      .collection('users')
      .findOne({ _id: new ObjectId(user.userId) }, { projection: { passwordHash: 0 } });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: dbUser._id.toString(),
        name: dbUser.name,
        email: dbUser.email,
        totalForecasts: dbUser.totalForecasts || 0,
        createdAt: dbUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Me error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
