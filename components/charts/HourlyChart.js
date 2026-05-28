import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const h = parseInt(label);
    const time = `${h.toString().padStart(2, '0')}:00`;
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
          {time}
        </p>
        <p style={{ color: '#f59e0b', fontSize: '16px', fontWeight: '700', fontFamily: 'var(--font-display)' }}>
          {payload[0].value?.toFixed(3)} <span style={{ fontSize: '11px', color: '#888899' }}>kWh</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function HourlyChart({ data, peakHour }) {
  const chartData = (data || []).map((val, i) => ({
    hour: i,
    label: `${i}h`,
    output: Math.max(0, val),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
          vertical={false}
        />
        <XAxis
          dataKey="hour"
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#50505f', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          tickFormatter={(v) => `${v}h`}
          interval={3}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#50505f', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          tickFormatter={(v) => `${v.toFixed(1)}`}
          width={38}
        />
        <Tooltip content={<CustomTooltip />} />
        {peakHour !== undefined && (
          <ReferenceLine
            x={peakHour}
            stroke="rgba(245,158,11,0.4)"
            strokeDasharray="4 4"
            label={{ value: '⚡ Peak', fill: '#f59e0b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          />
        )}
        <Area
          type="monotone"
          dataKey="output"
          stroke="#f59e0b"
          strokeWidth={2}
          fill="url(#solarGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#f59e0b', stroke: '#070709', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
