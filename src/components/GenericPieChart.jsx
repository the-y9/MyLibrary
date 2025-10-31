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
    return (
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
                fill={COLORS[-1]}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  export default GenericPieChart;
  