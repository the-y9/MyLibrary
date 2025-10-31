import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
  } from "recharts";
  
  const GenericBarChart = ({
    title = "Data Overview",
    data = [],
    dataKeyX = "name",
    dataKeyY = "value",
    color = "#22c55e",
    height = 250,
  }) => {
    return (
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKeyX} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={dataKeyY} fill={color} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  export default GenericBarChart;
  