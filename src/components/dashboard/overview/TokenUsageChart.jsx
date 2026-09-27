import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatToken(value) {
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(value);
}

function TokenUsageTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const used = Number(payload[0]?.value || 0);
  const label = payload[0]?.payload?.label || "Selected day";

  return (
    <div className="min-w-44 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm shadow-lg">
      <p className="mb-2 text-xs font-medium text-stone-500">{label}</p>
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
        <span className="font-medium text-stone-700">Daily tokens</span>
        <span className="ml-auto font-semibold text-stone-950">
          {used.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function TokenUsageChart({ data = [], unavailable = false }) {
  return (
    <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 bg-stone-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-stone-700">Daily token usage</h2>
      </div>

      <div className="p-4">
        <div className="mb-2 text-center">
          <span className="text-sm font-semibold text-stone-950">
            Last 30 days
          </span>
          <span className="ml-1 text-xs text-stone-500">by calendar day</span>
        </div>

        {unavailable ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-stone-200 bg-stone-50 px-6 text-center">
            <p className="max-w-sm text-sm leading-6 text-stone-500">
              Daily token breakdown is not available yet. Your quota total is
              still shown above.
            </p>
          </div>
        ) : (
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 14, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="tokenUsageFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e7e5e4" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#a8a29e", fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#a8a29e", fontSize: 12 }}
                  tickFormatter={formatToken}
                  width={42}
                />
                <Tooltip
                  className="p-5"
                  cursor={{ stroke: "#7dd3fc", strokeWidth: 1 }}
                  content={<TokenUsageTooltip />}
                />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fill="url(#tokenUsageFill)"
                  activeDot={{ r: 5, strokeWidth: 2, fill: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}

export default TokenUsageChart;
