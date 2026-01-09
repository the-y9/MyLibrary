import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";
import COLORS from "./Colors.jsx";

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="p-3 rounded-lg shadow-lg bg-card border border-border">
      <p className="text-xs mb-1">{label}</p>

      {payload.map((entry, index) => {
        const [formattedValue] = formatter
          ? formatter(entry.value, entry.name, entry)
          : [entry.value];

        return (
          <div key={index} className="flex items-center gap-2 mb-1">
            {/* label + value */}
            <p
              className="text-sm font-semibold text-foreground"
              style={{ color: entry.color }} // dynamically color text to line color
            >
              {entry.name}: {formattedValue}
            </p>
          </div>
        );
      })}
    </div>
  );
};


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

  const averages = lines.map((line) => {
    const values = data
      .map(d => d[line.key])
      .filter(v => typeof v === "number");
  
    if (values.length === 0) return null;
  
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
  
    return {
      key: line.key,
      avg,
      yAxisId: rightAxis && line === lines[lines.length - 1] ? "right" : "left",
      label: avg.toFixed(2)
    };
  });
  
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
        
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(endOfWeek.getDate() + 6);
        
          return `${startOfWeek.getDate()} - ${endOfWeek.getDate()}`;
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

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 text-foreground rounded-xl shadow`}>
      <h3 className={`font-semibold mb-4 text-foreground`}>
        {title}
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} style={style}>
          <CartesianGrid strokeDasharray="3 3"  />

          <XAxis
            dataKey={dataKeyX}
            angle={getLabelAngle(data.length)}
            textAnchor={data.length > 4 ? "end" : "middle"}
            tickFormatter={formatXAxis}
            interval={0}
          />

          <YAxis yAxisId="left"  />
          {rightAxis && <YAxis yAxisId="right" orientation="right"  />}

          <Tooltip
            content={ <CustomTooltip formatter={tooltipFormatter} /> }
          />

          <Legend  verticalAlign="top" />

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

          {/* average line */}
          
            {averages.map(
              (avgLine, index) =>
                avgLine && (
                  <ReferenceLine
                    key={`avg-${avgLine.key}`}
                    y={avgLine.avg}
                    yAxisId={avgLine.yAxisId}
                    stroke={avgLine.color || COLORS[index % COLORS.length]}
                    strokeDasharray={index % 2 === 0 ? "5 5" : "3 3"}
                    strokeWidth={1.5}
                    label={({ viewBox }) => (
                      <text
                        x={viewBox.x + (index % 2 === 0 ? (viewBox.width/2) - 16 : (viewBox.width/2) + 16)} // offset left/right
                        y={viewBox.y + (index % 2 === 0 ? (viewBox.height/2) - 4 : (viewBox.height/2) + 12)}
                        fill={avgLine.color || COLORS[index % COLORS.length]}
                        fontSize={12}
                      >
                        {avgLine.label}
                      </text>
                    )}
                  />
                )
            )}

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GenericLineChart;
