"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DailyChart({ data, empty }: { data: { label: string; count: number }[]; empty: string }) {
  const hasData = data.some((item) => item.count > 0);
  if (!hasData) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={4} />
          <YAxis allowDecimals={false} width={28} tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
          <Area type="monotone" dataKey="count" stroke="#4f46e5" fill="#c7d2fe" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeeklyChart({ data, empty }: { data: { label: string; count: number }[]; empty: string }) {
  const hasData = data.some((item) => item.count > 0);
  if (!hasData) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} width={28} tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
          <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
