import { withAuth } from '../../../lib/auth';
import { generateSolarForecast } from '../../../lib/openrouter';

export default withAuth(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { location, date, panelCapacity, panelCount, efficiency, tiltAngle, azimuth } =
      req.body;

    if (!location || !date || !panelCapacity || !panelCount) {
      return res.status(400).json({ error: 'location, date, panelCapacity, panelCount are required' });
    }

    const results = await generateSolarForecast({
      location,
      date,
      panelCapacity: Number(panelCapacity),
      panelCount: Number(panelCount),
      efficiency: Number(efficiency) || 100,
      tiltAngle: Number(tiltAngle) || 30,
      azimuth: Number(azimuth) || 180,
    });

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Generate forecast error:', error);
    return res.status(500).json({
      error: error.message || 'AI forecast generation failed',
    });
  }
});
