import { useEffect, useState } from "react";
import { getAnalytics } from "../services/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { day: "Mon", predictions: 40 },
    { day: "Tue", predictions: 65 },
    { day: "Wed", predictions: 85 },
    { day: "Thu", predictions: 55 },
    { day: "Fri", predictions: 95 },
    { day: "Sat", predictions: 75 },
    { day: "Sun", predictions: 50 },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-16">
        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>

        <p className="mt-4 text-slate-500">
          Loading analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">

      {/* Header */}

      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900">
          Analytics Dashboard
        </h1>

        <p className="text-slate-500 mt-2">
          AI DOC Platform Statistics
        </p>
      </div>

      {/* Stats Cards */}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 text-sm">
            Total Predictions
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {analytics?.total_predictions || 0}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 text-sm">
            Accuracy
          </p>

          <h2 className="text-4xl font-bold mt-3">
            96.8%
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 text-sm">
            Diseases Covered
          </p>

          <h2 className="text-4xl font-bold mt-3">
            500+
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 text-sm">
            AI Models
          </p>

          <h2 className="text-4xl font-bold mt-3">
            12+
          </h2>
        </div>

      </div>

      {/* Chart Section */}

      <div className="mt-10 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">

        <h2 className="text-2xl font-semibold mb-6">
          Weekly Prediction Trends
        </h2>

        <ResponsiveContainer
          width="100%"
          height={350}
        >
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="day" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="predictions"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

      </div>

      {/* Status Section */}

      <div className="mt-10 grid lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">

          <h3 className="text-xl font-semibold">
            Platform Status
          </h3>

          <div className="mt-6 space-y-4">

            <div className="flex justify-between">
              <span>Backend API</span>

              <span className="text-green-600 font-medium">
                Online
              </span>
            </div>

            <div className="flex justify-between">
              <span>Prediction Engine</span>

              <span className="text-green-600 font-medium">
                Active
              </span>
            </div>

            <div className="flex justify-between">
              <span>Image Analysis</span>

              <span className="text-green-600 font-medium">
                Ready
              </span>
            </div>

          </div>

        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">

          <h3 className="text-xl font-semibold mb-6">
            System Overview
          </h3>

          <div className="space-y-5">

            <div>
              <div className="flex justify-between">
                <span>Prediction Accuracy</span>
                <span>96.8%</span>
              </div>

              <div className="h-2 bg-slate-200 rounded-full mt-2">
                <div className="h-2 bg-blue-600 rounded-full w-[96%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between">
                <span>Image Analysis</span>
                <span>92%</span>
              </div>

              <div className="h-2 bg-slate-200 rounded-full mt-2">
                <div className="h-2 bg-green-600 rounded-full w-[92%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between">
                <span>System Reliability</span>
                <span>99%</span>
              </div>

              <div className="h-2 bg-slate-200 rounded-full mt-2">
                <div className="h-2 bg-purple-600 rounded-full w-[99%]" />
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;