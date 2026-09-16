import { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

export default function LSTMBarChart() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/predict-all")
      .then((res) => {
        let low = 0;
        let medium = 0;
        let high = 0;

        res.data.forEach((item) => {
          if (item.risk_level === 0) low++;
          else if (item.risk_level === 1) medium++;
          else high++;
        });

        setChartData([
          {
            risk: "Low",
            count: low,
            color: "#22c55e",
          },
          {
            risk: "Medium",
            count: medium,
            color: "#f59e0b",
          },
          {
            risk: "High",
            count: high,
            color: "#ef4444",
          },
        ]);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div >


      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="risk" />

          <YAxis />

          <Tooltip />

          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

    </div>
  );
}