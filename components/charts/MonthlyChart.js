import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
          {label}
        </p>
        <p style={{ color: '#10b981', fontSize: '16px', fontWeight: '700', fontFamily: 'var(--font-display)' }}>
          {payload[0].value?.toFixed(1)} <span style={{ fontSize: '11px', color: '#888899' }}>kWh</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function MonthlyChart({ data }) {
  const chartData = (data || []).map((val, i) => ({
    month: MONTHS[i],
    output: Math.max(0, val),
  }));

  const avg = chartData.reduce((s, d) => s + d.output, 0) / (chartData.length || 1);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#50505f', fontSize: 10, fontFamily: 'JetBrains Mono' }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#50505f', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          tickFormatter={(v) => `${v.toFixed(0)}`}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={avg}
          stroke="rgba(255,255,255,0.1)"
          strokeDasharray="4 4"
          label={{ value: 'avg', fill: '#50505f', fontSize: 9, fontFamily: 'JetBrains Mono' }}
        />
        <Line
          type="monotone"
          dataKey="output"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={{ fill: '#10b981', r: 3, stroke: '#070709', strokeWidth: 2 }}
          activeDot={{ r: 5, fill: '#10b981', stroke: '#070709', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
