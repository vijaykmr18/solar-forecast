import { getAuthUser, withAuth } from '../../../lib/auth';
import { getDb } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default withAuth(async function handler(req, res) {
  const db = await getDb();
  const forecasts = db.collection('forecasts');

  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;

      const filter = { userId: req.user.userId };

      const [docs, total] = await Promise.all([
        forecasts
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        forecasts.countDocuments(filter),
      ]);

      const formatted = docs.map((d) => ({
        id: d._id.toString(),
        title: d.title,
        location: d.location,
        date: d.date,
        panelCount: d.panelCount,
        totalKwp: d.totalKwp,
        results: {
          totalDailyKwh: d.results?.totalDailyKwh,
          totalAnnualKwh: d.results?.totalAnnualKwh,
          peakOutputKw: d.results?.peakOutputKw,
          co2OffsetKgPerYear: d.results?.co2OffsetKgPerYear,
          savingsPerYearUSD: d.results?.savingsPerYearUSD,
        },
        createdAt: d.createdAt,
      }));

      return res.status(200).json({
        forecasts: formatted,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error('List forecasts error:', error);
      return res.status(500).json({ error: 'Failed to fetch forecasts' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        title,
        location,
        date,
        panelCapacity,
        panelCount,
        efficiency,
        tiltAngle,
        azimuth,
        results,
      } = req.body;

      if (!location || !date || !panelCapacity || !panelCount) {
        return res.status(400).json({ error: 'Required fields missing' });
      }

      const totalKwp = (panelCapacity * panelCount * (efficiency || 100)) / 100;

      const doc = {
        userId: req.user.userId,
        title: title || `${location} – ${new Date(date).toLocaleDateString()}`,
        location,
        date: new Date(date),
        panelCapacity: Number(panelCapacity),
        panelCount: Number(panelCount),
        efficiency: Number(efficiency) || 100,
        tiltAngle: Number(tiltAngle) || 30,
        azimuth: Number(azimuth) || 180,
        totalKwp,
        results,
        createdAt: new Date(),
      };

      const result = await forecasts.insertOne(doc);

      // Increment user's forecast count
      await db
        .collection('users')
        .updateOne(
          { _id: new ObjectId(req.user.userId) },
          { $inc: { totalForecasts: 1 } }
        );

      return res.status(201).json({
        id: result.insertedId.toString(),
        message: 'Forecast saved',
      });
    } catch (error) {
      console.error('Create forecast error:', error);
      return res.status(500).json({ error: 'Failed to save forecast' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
