const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export async function generateSolarForecast({
  location,
  date,
  panelCapacity,
  panelCount,
  efficiency,
  tiltAngle,
  azimuth,
}) {
  const totalKwp = (panelCapacity * panelCount * efficiency) / 100;
  const dateObj = new Date(date);
  const month = dateObj.toLocaleString('en', { month: 'long' });
  const day = dateObj.getDate();

  const prompt = `You are a solar energy simulation engine. Generate a realistic solar power output forecast for the following system:

Location: ${location}
Date: ${month} ${day}, ${dateObj.getFullYear()}
Individual Panel Capacity: ${panelCapacity} Wp
Number of Panels: ${panelCount}
Panel Efficiency: ${efficiency}%
System Peak Power (kWp): ${totalKwp.toFixed(2)}
Tilt Angle: ${tiltAngle}°
Azimuth: ${azimuth}°

Consider local climate patterns, typical weather for ${month} in ${location}, sun path, shading losses (5%), inverter efficiency (96%), and temperature derating.

Return ONLY a valid JSON object with NO markdown, NO code blocks, NO explanation:
{
  "hourly": [24 floats, kWh output for hours 0-23, realistic solar curve peaking midday],
  "daily": [30 floats, kWh/day for next 30 days with weather variation],
  "monthly": [12 floats, kWh/month Jan-Dec],
  "peakOutputKw": float,
  "totalDailyKwh": float,
  "totalAnnualKwh": float,
  "peakHour": integer (0-23),
  "capacityFactor": float (0-0.3 typical),
  "co2OffsetKgPerYear": float,
  "savingsPerYearUSD": float (at $0.12/kWh),
  "performanceRatio": float (0.7-0.85),
  "summary": "3-4 sentence expert analysis of system performance and recommendations"
}`;

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://solarforecast.vercel.app',
      'X-Title': 'Solar Power Forecast App',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      max_tokens: 1200,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content:
            'You are a solar energy simulation engine. Return ONLY valid JSON with no markdown, no preamble, no explanation.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty response from AI model');

  // Strip any accidental markdown fences
  const cleaned = raw.replace(/```json|```/gi, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (e) {
    // Try to extract JSON from the response
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse AI response as JSON');
  }
}
