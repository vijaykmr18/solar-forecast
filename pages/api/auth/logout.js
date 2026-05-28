import { clearAuthCookie, getAuthUser } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    clearAuthCookie(res);
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  if (req.method === 'GET') {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    return res.status(200).json({ user });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
