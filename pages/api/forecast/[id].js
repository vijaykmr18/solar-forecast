import { withAuth } from '../../../lib/auth';
import { getDb } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default withAuth(async function handler(req, res) {
  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid forecast ID' });
  }

  const db = await getDb();
  const forecasts = db.collection('forecasts');

  if (req.method === 'GET') {
    try {
      const doc = await forecasts.findOne({
        _id: new ObjectId(id),
        userId: req.user.userId,
      });

      if (!doc) {
        return res.status(404).json({ error: 'Forecast not found' });
      }

      return res.status(200).json({
        forecast: {
          id: doc._id.toString(),
          title: doc.title,
          location: doc.location,
          date: doc.date,
          panelCapacity: doc.panelCapacity,
          panelCount: doc.panelCount,
          efficiency: doc.efficiency,
          tiltAngle: doc.tiltAngle,
          azimuth: doc.azimuth,
          totalKwp: doc.totalKwp,
          results: doc.results,
          createdAt: doc.createdAt,
        },
      });
    } catch (error) {
      console.error('Get forecast error:', error);
      return res.status(500).json({ error: 'Failed to fetch forecast' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const result = await forecasts.deleteOne({
        _id: new ObjectId(id),
        userId: req.user.userId,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Forecast not found' });
      }

      await db
        .collection('users')
        .updateOne(
          { _id: new ObjectId(req.user.userId) },
          { $inc: { totalForecasts: -1 } }
        );

      return res.status(200).json({ message: 'Forecast deleted' });
    } catch (error) {
      console.error('Delete forecast error:', error);
      return res.status(500).json({ error: 'Failed to delete forecast' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
