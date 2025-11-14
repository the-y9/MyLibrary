import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import COLORS from "./Colors.jsx";

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload || payload.length === 0) return null;
// console.log(payload);


  return (
    <div className="p-2 rounded-lg shadow-lg bg-card border">
      <p className="text-xs">{label}</p>

      {payload.map((entry, index) => {
        
        return (
          <div key={index} className="flex items-center gap-2 mb-1">
            {/* label + value */}
            <p className="text-sm font-semibold text-foreground" style={{ color: entry.payload.fill }} >
              {entry.name}: {entry.payload.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

const GenericPieChart = ({
  title = "Pie Chart",
  data = [],          // [{ label: "Book 1", value: 30 }, ...]
  dataKey = "value",  // key for numeric value
  nameKey = "label",  // key for category label
  height = 250,
}) => {

  // console.log(data);
  
  return (
    <div className={`bg-card dark:bg-gray-800 p-4 rounded-xl shadow`}>
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
            className="mt-4 mb-4"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip content={<CustomTooltip />} formatter={(value) => `${value}`} />
          
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{
              maxHeight: 300,
              overflowY: "auto",
              maxWidth: 100
            }}
/>

        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GenericPieChart;
