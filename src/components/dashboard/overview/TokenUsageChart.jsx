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

function TokenUsageTooltip({ active, payload, tokenLimit }) {
  if (!active || !payload?.length) return null;

  const used = Number(payload[0]?.value || 0);
  const remaining = Math.max((tokenLimit || 0) - used, 0);

  return (
    <div className="min-w-44 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm shadow-lg">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
        <span className="font-medium text-stone-700">Used tokens</span>
        <span className="ml-auto font-semibold text-stone-950">
          {used.toLocaleString()}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
        <span className="font-medium text-stone-700">Tokens left</span>
        <span className="ml-auto font-semibold text-stone-950">
          {remaining.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function TokenUsageChart({ data = [], totalTokens = 0, tokenLimit = 0 }) {
  return (
    <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 bg-stone-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-stone-700">Token usage</h2>
      </div>

      <div className="p-4">
        <div className="mb-2 text-center">
          <span className="text-sm font-semibold text-stone-950">
            {totalTokens.toLocaleString()} tokens
          </span>
          <span className="ml-1 text-xs text-stone-500">/ total</span>
        </div>

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
              <Tooltip className="p-5"
                cursor={{ stroke: "#7dd3fc", strokeWidth: 1 }}
                content={
                  <TokenUsageTooltip tokenLimit={tokenLimit} />
                }
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
      </div>
    </section>
  );
}

export default TokenUsageChart;
