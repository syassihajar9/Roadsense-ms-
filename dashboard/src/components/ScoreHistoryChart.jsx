import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function ScoreHistoryChart({ history }) {
  if (!history || history.length === 0) {
    return (
      <p className="text-slate-400 text-sm">
        Aucun historique disponible
      </p>
    );
  }

  const data = history.map((h) => ({
    date: new Date(h.timestamp).toLocaleDateString(),
    score: h.score,
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mt-6">
      <h3 className="text-sm text-slate-400 mb-3">
        Évolution temporelle du score
      </h3>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#38bdf8"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
