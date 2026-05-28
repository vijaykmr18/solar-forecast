import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#0e0e12',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: '10px',
          padding: '10px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <p style={{ color: '#888899', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
          Day {label}
        </p>
        <p style={{ color: '#f59e0b', fontSize: '16px', fontWeight: '700', fontFamily: 'var(--font-display)' }}>
          {payload[0].value?.toFixed(2)} <span style={{ fontSize: '11px', color: '#888899' }}>kWh</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function DailyChart({ data }) {
  const chartData = (data || []).map((val, i) => ({
    day: i + 1,
    output: Math.max(0, val),
  }));

  const avg = chartData.reduce((s, d) => s + d.output, 0) / (chartData.length || 1);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#50505f', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          interval={4}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#50505f', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          tickFormatter={(v) => `${v.toFixed(0)}`}
          width={35}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245,158,11,0.05)' }} />
        <Bar dataKey="output" radius={[3, 3, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={
                entry.output >= avg * 1.1
                  ? '#f59e0b'
                  : entry.output >= avg * 0.9
                  ? 'rgba(245,158,11,0.6)'
                  : 'rgba(245,158,11,0.3)'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
