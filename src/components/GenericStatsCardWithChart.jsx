import { useState } from "react";
import { LineChart, Line, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import COLORS from "./Colors"
import { fNum } from "../utils/misc";

const CustomTooltip = ({ active, payload, label, CI }) => {
    if (!active || !payload || payload.length === 0) return null;
  
    return (
      <div className="p-2 rounded-lg shadow bg-card border border-border">
        <p className="text-xs mb-1">{label}</p>
            <p className="text-s font-semibold" style={{ color: COLORS[CI] }}>{fNum(payload[0].value)}</p>
      </div>
    );
  };

  
const GenericStatsCardWithChart = ({ statd = [], graphData = [], xaxisKey = "timestamp",
    lineDatakey, target, avg,
    info = null, exclude_zero=false,
    CI = 9,
    chartStyle = { width: "100%", maxWidth: "200px", maxHeight: "100px", aspectRatio: 1.618 } }) => {
    
    const stat = statd[0]; // could be undefined if array is empty
    const [showInfo, setShowInfo] = useState(false);
    let sum = 0;
let count = 0;

graphData.forEach(d => {
  const value = d[lineDatakey];
  if (!exclude_zero || value !== 0) {
    sum += value;
    count++;
  }
});
  
if (avg === undefined) {
  avg = count > 0 ? sum / count : 0;
}

 
  
  return (

        <div className="bg-card p-4 rounded-xl shadow flex justify-between max-w-sm">
            
<div id="stattext">
{stat ? (
  <>
    {/* LABEL + INFO ICON */}
    {stat.label && (
      <div className="flex items-center gap-1 relative">
        <p className="text-sm text-gray-500">{stat.label}</p>

        {info && (
          <span
            className="text-xs cursor-pointer text-blue-500 hover:text-blue-700"
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
          >
            ⓘ
          </span>
        )}

        {/* INFO POPOVER */}
        {showInfo && info && (
          <div className="absolute left-0 top-6 w-52 p-2 rounded-md bg-popover border shadow z-20 text-xs">
            {info}
          </div>
        )}
      </div>
    )}
                
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
         {/* Y-axis that includes target and avg */}
          <YAxis hide
            domain={[
              (dataMin) => Math.min(0, target ?? dataMin, avg ?? dataMin),
              (dataMax) => Math.max(dataMax, target ?? dataMax, avg ?? dataMax) * 1.1
            ]}
          />
                <XAxis dataKey={xaxisKey} hide />
                {/* <Tooltip /> */}
                <Tooltip content={<CustomTooltip CI={CI} />} />
                <Line type="monotone" dataKey={lineDatakey} stroke={COLORS[CI]} strokeWidth={2} />
                {/* Target line */}
                <ReferenceLine
                  y={target}
                  stroke="#6e6b80ff"
                  strokeDasharray="8 8"
                  label={({ viewBox }) => (
                    <text
                      x={viewBox.x} // offset left/right
                      y={viewBox.y +  (viewBox.height/2)}
                      fill="rgb(107, 111, 128)"
                      fontSize={12}
                    >
                      {Number.isFinite(target) ? target.toFixed(2) : ""}
                    </text>
                  )}
                />
                {/* Average line */}
                <ReferenceLine
                  y={avg}
                  stroke={COLORS[CI]}
                  strokeDasharray="4 4"
                  label={({ viewBox }) => (
                    <text
                      x={viewBox.x +  (viewBox.width/2) + 16 } // offset left/right
                      y={viewBox.y }
                      fill={COLORS[CI]}
                      fontSize={12}
                    >
                      {Number.isFinite(avg) ? avg.toFixed(2) : ""}
                    </text>
                  )}
                />

                
            </LineChart>

           
        </div>
    );
};


export default GenericStatsCardWithChart;
