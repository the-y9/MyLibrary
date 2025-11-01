import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import COLORS from "./Colors.jsx";


const GenericLineChart = ({
  title = "Data Comparison",
  data = [],
  dataKeyX = "name",
  lines = [
    { key: "value1", color: "#22c55e", label: "Line 1" },
    { key: "value2", color: "#3b82f6", label: "Line 2" },
  ],
  height = 250,
  rightAxis = false, // 👈 new optional prop
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={dataKeyX}
            angle={data.length > 3 ? -Math.min(90, (data.length - 3) * 3) : 0}
            textAnchor="middle"
            interval={0}
          />
          <YAxis yAxisId="left" />
          {rightAxis && <YAxis yAxisId="right" orientation="right" />} {/* 👈 add right axis if needed */}
          <Tooltip />
          <Legend verticalAlign={ "top" }/>

          {lines.map((line, index) => {
            const yAxisId =
              rightAxis && index === lines.length - 1 ? "right" : "left";
            return (
              <Line
                key={line.key || index}
                type="monotone"
                dataKey={line.key}
                stroke={line.color || COLORS[index % COLORS.length]}
                name={line.label || `Line ${index + 1}`}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                yAxisId={yAxisId}
                strokeDasharray={yAxisId === "right" ? "5 1" : "none"} // optional styling
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GenericLineChart;
