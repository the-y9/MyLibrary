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
  dataKeyX = "name",
  lines = [
    { key: "value1", color: "#22c55e", label: "Line 1" },
    { key: "value2", color: "#3b82f6", label: "Line 2" },
  ],
  height = 250,
  rightAxis = false,
  interval = "daily",
}) => {
  // Compute dynamic angle based on container width and number of data points
  const getLabelAngle = (dataLength, containerWidth) => {
    if (dataLength <= 3) return 0;
    // Minimum width per label = 50px (adjustable)
    const angle = -Math.min(90, Math.max(0, ((dataLength * 50) / containerWidth) * 45));
    return angle;
  };
  

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        
        <LineChart data={data} style={style}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            angle={data.length > 3 ? -Math.min(90, (data.length - 3) * 3) : 0}
            textAnchor={data.length > 3 ? "end" : "middle"}
            tickFormatter={(value) => {
              const date = new Date(value);

              switch (interval) {
                case "daily":
                  return date.getDate(); // just day number, e.g., 20
                case "weekly": {
                  // Show week start day, e.g., "20"
                  const startOfWeek = new Date(date);
                  startOfWeek.setDate(date.getDate() - date.getDay() + 1);
                  return `${startOfWeek.getDate()} - ${startOfWeek.getDate() + 6}`; // e.g., "20 - 26"
                }
                case "monthly":
                  return date.toLocaleString("default", { month: "short" }); // e.g., "Oct"
                case "yearly":
                  return date.getFullYear(); // e.g., 2025
                default:
                  return date.toLocaleDateString(); // fallback
              }
            }}
            interval={0} // ensures every tick is shown, you can tweak this for spacing
          />
          

          <YAxis yAxisId="left" />
          {rightAxis && <YAxis yAxisId="right" orientation="right" />} {/* 👈 add right axis if needed */}
          
          <Tooltip
              formatter={(value, name, props) => {
              if (props.dataKey === "time" || props.dataKey === "totalTime") {
                const totalTime = Math.floor(value);
                if (totalTime < 60) {
                  return [`${totalTime} min`, name]; // [formattedValue, label]
                } else {
                  const hours = Math.floor(totalTime / 60);
                  const minutes = totalTime % 60;
                  return [`${hours} h ${minutes} min`, name]; // [formattedValue, label]
                }
}
                return [value, name]; // default for everything else
              }}
            />

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
