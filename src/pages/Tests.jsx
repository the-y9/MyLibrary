import { useState, useMemo, useContext } from "react";
import { TestDataProvider, TestDataContext } from "../context/TestDataContext";
import TestTable from "./TestTable";
import { Menu } from "lucide-react";
import NavSidebar from "./NavSidebar";
import SideBar from '../components/SideBar';
import GenericStatsCardWithChart from "../components/GenericStatsCardWithChart.jsx";

function Tests() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [interval, setInterval] = useState("daily");

  const dateForm = undefined; // optional locale

  return (
    <TestDataProvider>
      <TestContent
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        interval={interval}
              dateForm={dateForm}
              setInterval={setInterval}
      />
    </TestDataProvider>
  );
}

function useChartData(tests, lineDatakey, interval = "daily") {
    return useMemo(() => {
      if (!tests || !tests.rows || tests.rows.length === 0) return [];
  
      // Map your rows to a consistent object with a timestamp and value
      // Assuming headers contain "Date" and lineDatakey is one of the headers
        const dateIdx = tests.headers.indexOf("Date");
        const nameIdx = tests.headers.indexOf("Test Name");
      const valueIdx = tests.headers.indexOf(lineDatakey);
  
      if (dateIdx === -1 || valueIdx === -1) return [];
  
      const grouped = {};
  
      tests.rows.forEach((row) => {
          const date = row.data[dateIdx];
          const name = row.data[nameIdx];
        const value = Number(row.data[valueIdx]) || 0;
  
        // format date depending on interval
        let key = name;
        const d = new Date(date);
        switch (interval) {
          case "daily":
            key = d.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" });
            break;
          case "weekly": {
            const startOfWeek = new Date(d);
            startOfWeek.setDate(d.getDate() - d.getDay() + 1); // Monday
            key = startOfWeek.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" });
            break;
          }
          case "monthly":
            key = d.toLocaleDateString("default", { month: "short", year: "numeric" });
            break;
          case "yearly":
            key = String(d.getFullYear());
            break;
          default:
            key = d.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" });
        }
  
        if (!grouped[key]) grouped[key] = { sum: 0, count: 0 };
            grouped[key].sum += value;
            grouped[key].count += 1;
      });
        
  
      // Convert grouped object to array
      const chartData = Object.entries(grouped).map(([timestamp, { sum, count }]) => ({
        timestamp,
        [lineDatakey]: (sum / count), // average
      }));
  
      // sort by date
      chartData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
      return chartData;
    }, [tests, lineDatakey, interval]);
}

// Helper to calculate percentage or absolute change
function changeForm(current, previous) {
  if (previous === 0) return ""; // avoid divide by zero
  const diff = current - previous;
  const sign = diff > 0 ? "+" : diff < 0 ? "-" : "";
  const percent = previous !== 0 ? Math.abs((diff / previous) * 100).toFixed(1) + "%" : "";
  return `${sign}${percent}`;
}

// Hook to compute stats data for GenericStatsCardWithChart
 function useStatsData(chartData, lineDatakey, reverse) {
  return useMemo(() => {
    if (!chartData || chartData.length === 0 || !lineDatakey) return [];
    
    const last = chartData[chartData.length - 1];
    const secondLast = chartData.length > 1 ? chartData[chartData.length - 2] : null;

    return [
        {
            label: lineDatakey.toString(),
            value: last[lineDatakey].toFixed(2) || 0,
            change: reverse
                        ? changeForm(
                            secondLast ? secondLast[lineDatakey] || 0 : 0,
                            last[lineDatakey] || 0
                            )
                        : changeForm(
                            last[lineDatakey] || 0,
                            secondLast ? secondLast[lineDatakey] || 0 : 0
                            )

          },
    ];
  }, [chartData, lineDatakey]);
}

  
function TestContent({ sidebarOpen, setSidebarOpen, interval, dateForm, setInterval }) {
    const { tests } = useContext(TestDataContext);
    const { refresh, setRefresh } = useContext(TestDataContext);

  const accuracyData = useChartData(tests, "Accuracy %", interval);
    const readinessData = useChartData(tests, "Readiness", interval);
    const scoreData = useChartData(tests, "Score %", interval);
const  quicknessData = useChartData(tests, "Quickness", interval);

  const accuracyStats = useStatsData(accuracyData, "Accuracy %");
    const readinessStats = useStatsData(readinessData, "Readiness");
    const scoreStats = useStatsData(scoreData, "Score %");
    const quicknessStats = useStatsData( quicknessData, "Quickness", "reverse");
    
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        title="Library"
        navComponent={NavSidebar}
        footerContent="👤 Profile Settings"
        width="w-72"
        bgColor="bg-gray-50"
        borderColor="border-gray-200"
        textColor="text-blue-700"
        footerTextColor="text-gray-600"
      />
      <main className="flex-1 p-4 sm:p-6 space-y-6 w-full">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Tests Summary</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="md:hidden p-2 rounded-lg border text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
                      </button>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                      <button onClick={() => setRefresh(c => c + 1)}>
                        {refresh === 0 ? "Refresh Data" : `Refreshed ${refresh} time${refresh === 1 ? '' : 's'}`}
                       </button>
                          
            </button>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <GenericStatsCardWithChart statd={accuracyStats}  graphData={accuracyData} lineDatakey="Accuracy %" // xaxisKey="" 
        />
        <GenericStatsCardWithChart statd={readinessStats}  graphData={readinessData} lineDatakey="Readiness" //   xaxisKey=""  
                      />
        <GenericStatsCardWithChart statd={scoreStats}  graphData={scoreData} lineDatakey="Score %" //   xaxisKey=""  
                      />
                      <GenericStatsCardWithChart statd={quicknessStats}  graphData={quicknessData} lineDatakey="Quickness" //   xaxisKey=""  
        />
                  </div>
                  <div className="flex gap-2 mb-4">
                    {["daily", "weekly", "monthly", "yearly"].map((option) => (
                        <button
                        key={option}
                        onClick={() => setInterval(option)}
                        className={`px-3 py-1 rounded ${
                            interval === option ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                        }`}
                        >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                    ))}
                    </div>  

          <h1>Tests</h1>
          <TestTable
            visibleHeaders={["Date", "Test Name", "Total Qs", "Attempted", "Correct", "Wrong", "Unattempted", "Score", "Accuracy %", "Time (min)", "Readiness"]}
          />
        </div>
      </main>
    </div>
  );
}

export default Tests;
