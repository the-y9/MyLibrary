import { useEffect, useState } from "react";
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
  style = {},
  title = "Data Comparison",
  data = [],
  dataKeyX = "timestamp",
  lines = [
    { key: "value1", color: "#22c55e", label: "Line 1" },
    { key: "value2", color: "#3b82f6", label: "Line 2" },
  ],
  height = 250,
  rightAxis = false,
  interval = "daily",
}) => {
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode using Tailwind's dark class on html/body
  useEffect(() => {
    const mode = localStorage.getItem("theme")
    const darkMode = mode === 'dark';
    // console.log(darkMode);
    
    setIsDark(darkMode);
  },[]);

  const getLabelAngle = (dataLength) => {
    if (dataLength <= 3) return 0;
    return -Math.min(90, (dataLength - 3) * 3);
  };

  const formatXAxis = (value) => {
    const date = new Date(value);
    switch (interval) {
      case "daily":
        return date.getDate();
      case "weekly": {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay() + 1);
        return `${startOfWeek.getDate()} - ${startOfWeek.getDate() + 6}`;
      }
      case "monthly":
        return date.toLocaleString("default", { month: "short" });
      case "yearly":
        return date.getFullYear();
      default:
        return date.toLocaleDateString();
    }
  };

  const tooltipFormatter = (value, name, props) => {
    if (props.dataKey === "time" || props.dataKey === "totalTime") {
      const totalTime = Math.floor(value);
      if (totalTime < 60) return [`${totalTime} min`, name];
      const hours = Math.floor(totalTime / 60);
      const minutes = totalTime % 60;
      return [`${hours} h ${minutes} min`, name];
    }
    return [value, name];
  };

  const axisColor = isDark ? "#e5e7eb" : "#374151"; // light for dark bg, dark for light bg
  const gridColor = isDark ? "#4b5563" : "#e5e7eb";

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow`}>
      <h3 className={`font-semibold mb-4 text-foreground`}>
        {title}
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} style={style}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />

          <XAxis
            dataKey={dataKeyX}
            angle={getLabelAngle(data.length)}
            textAnchor={data.length > 3 ? "end" : "middle"}
            tickFormatter={formatXAxis}
            interval={0}
            stroke={axisColor}
          />

          <YAxis yAxisId="left" stroke={axisColor} />
          {rightAxis && <YAxis yAxisId="right" orientation="right" stroke={axisColor} />}

          <Tooltip
            formatter={tooltipFormatter}
            contentStyle={{
              backgroundColor: isDark ? "#1f2937" : "#fff",
              borderColor: isDark ? "#4b5563" : "#e5e7eb",
              color: isDark ? "#e5e7eb" : "#111827",
            }}
          />

          <Legend
            verticalAlign="top"
            wrapperStyle={{ color: isDark ? "#e5e7eb" : "#111827" }}
          />

          {lines.map((line, index) => {
            const yAxisId = rightAxis && index === lines.length - 1 ? "right" : "left";
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
                strokeDasharray={yAxisId === "right" ? "5 1" : "none"}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GenericLineChart;
