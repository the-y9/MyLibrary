import { LineChart, Line, Tooltip, XAxis } from "recharts";
import COLORS from "./Colors"

const CustomTooltip = ({ active, payload, label, CI }) => {
    if (!active || !payload || payload.length === 0) return null;
  
    return (
      <div className="p-2 rounded-lg shadow bg-card border border-border">
        <p className="text-xs mb-1">{label}</p>
            <p className="text-s font-semibold" style={{ color: COLORS[CI] }}>{payload[0].value}</p>
      </div>
    );
  };

  
const GenericStatsCardWithChart = ({ statd = [], graphData = [], xaxisKey = "timestamp",
    lineDatakey, CI = 9,
    chartStyle = { width: "100%", maxWidth: "200px", maxHeight: "100px", aspectRatio: 1.618 } }) => {
    
    const stat = statd[0]; // could be undefined if array is empty

    return (

        <div className="bg-card p-4 rounded-xl shadow flex justify-between max-w-sm">
            <div id="stattext">
                {stat ? (
                    <>
                        {stat.label && <p className="text-sm text-gray-500">{stat.label}</p>}
                        {stat.value && <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>}
                        {stat.change && (
                            <p className={`text-sm ${stat.change.startsWith("-") ? "text-red-500" : "text-green-500"}`}>
                                {stat.change}
                            </p>
                        )}
                    </>
                ) : (
                    <p className="text-sm text-gray-400">No stats available</p>
                )}
            </div>

            {/* Line Chart */}
            <LineChart
                style={chartStyle}
                data={graphData}
            >
                <XAxis dataKey={xaxisKey} hide />
                {/* <Tooltip /> */}
                <Tooltip content={<CustomTooltip CI={CI} />} />
                <Line type="monotone" dataKey={lineDatakey} stroke={COLORS[CI]} strokeWidth={2} />
            </LineChart>

           
        </div>
    );
};


export default GenericStatsCardWithChart;
