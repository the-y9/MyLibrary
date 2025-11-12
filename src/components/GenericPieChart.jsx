import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import COLORS from "./Colors.jsx";

const GenericPieChart = ({
  title = "Pie Chart",
  data = [],          // [{ label: "Book 1", value: 30 }, ...]
  dataKey = "value",  // key for numeric value
  nameKey = "label",  // key for category label
  height = 250,
}) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detect system dark mode
    const mode = localStorage.getItem("theme")
    const darkMode = mode==='dark';
    setIsDark(darkMode);

    // // Optional: listen for changes
    // const listener = (e) => setIsDark(e.matches);
    // window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", listener);
    // return () => window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", listener);
  }, []);

  const tooltipStyle = {
    backgroundColor: isDark ? "#1f2937" : "#fff",
    borderColor: isDark ? "#4b5563" : "#e5e7eb",
    color: isDark ? "#e5e7eb" : "#111827",
  };

  const legendStyle = { color: isDark ? "#e5e7eb" : "#111827" };

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow`}>
      <h3 className={`font-semibold mb-4 text-foreground`}>
        {title}
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value}`} />
          <Legend wrapperStyle={legendStyle} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GenericPieChart;
