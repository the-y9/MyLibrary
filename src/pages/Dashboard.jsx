import { useContext, useState, useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import { Link } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import NavSidebar from "./NavSidebar";
import SideBar from '../components/SideBar';
import DataListCard from '../components/RecentTiles';
import GenericLineChart from '../components/GenericLineChart';
import GenericStatsCards from '../components/GenericStatsCard';
import GenericPieChart from '../components/GenericPieChart';
import GenericStatsCardWithChart from '../components/GenericStatsCardWithChart';
import { make_targets } from "../utils/misc";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sessions } = useContext(DataContext);
  const [interval, setInterval] = useState("daily");
  // 1. We use a Ref to store cached results (it survives re-renders)
  const cache = useRef({});

  // State for worker results
  const [data, setData] = useState({
    chartData: [],
    pieData: [],
    statsData: [],
    recentData: [],
    isCalculating: false
});

useEffect(() => {
  if (!sessions) return;

  // Create a unique key based on sessions and interval
  // If sessions is a large array, we use its length or a version tag
  const cacheKey = `${sessions.length}-${interval}`;

  // 2. CHECK CACHE: If we already have this data, don't use the worker
  if (cache.current[cacheKey]) {
    setData({ ...cache.current[cacheKey], isCalculating: false });
    return;
  }

  setData(prev => ({ ...prev, isCalculating: true }));

  const worker = new Worker(new URL('../utils/dataWorker.js', import.meta.url));
  worker.postMessage({ sessions, interval });

  worker.onmessage = (e) => {
    // 3. SAVE TO CACHE: Remember this result for later
    cache.current[cacheKey] = e.data;
    
    setData({ ...e.data, isCalculating: false });
    worker.terminate();
  };

  return () => worker.terminate();
}, [sessions, interval]);

  const { chartData, pieData, statsData, recentData, isCalculating } = data;

  if (chartData.length === 0 && !isCalculating) {
    return (<div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} navComponent={NavSidebar} />

      <main className={`flex-1 p-4 sm:p-6 space-y-6 w-full transition-opacity ${isCalculating ? 'opacity-50' : 'opacity-100'}`}>
        <div className="flex justify-between items-center">Loading ...</div>
      </main>
      </div>)
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} navComponent={NavSidebar} />

      <main className={`flex-1 p-4 sm:p-6 space-y-6 w-full transition-opacity ${isCalculating ? 'opacity-50' : 'opacity-100'}`}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Dashboard</h2>
            <p className="text-muted-foreground-500 text-sm">
              {chartData.length > 0 && chartData[chartData.length - 1].timestamp}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="md:hidden p-2 rounded-lg border" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <Link to="/add-session" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              + New Session
            </Link>
          </div>
        </div>

        {/* Top 4 Stats */}
        <GenericStatsCards stats={statsData.slice(0, 4)} />

        {/* Chart Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GenericStatsCardWithChart 
            statd={statsData.slice(4, 5)} 
            graphData={chartData} 
            lineDatakey="Chapters_Completed" 
            target={make_targets(0.5, interval)} 
          />
          <GenericStatsCardWithChart 
            statd={statsData.slice(5, 6)} 
            graphData={chartData} 
            lineDatakey="speed" 
            CI={16} 
            avg={statsData[5]?.avgSpeed} 
          />
        </div>

        {/* Interval Selector */}
        <div className="flex gap-2 mb-4">
          {["daily", "weekly", "monthly", "yearly"].map((opt) => (
            <button
              key={opt}
              onClick={() => setInterval(opt)}
              className={`px-3 py-1 rounded capitalize ${interval === opt ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800"}`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GenericLineChart
            title="Pages vs Time"
            data={chartData}
            dataKeyX="timestamp"
            lines={[{ key: "pages", label: "Pages" }, { key: "time", label: "Time (min)" }]}
            rightAxis={true}
            interval={interval}
          />
          
          <GenericPieChart title="Pages Read by Book" data={pieData} />

          <DataListCard 
            book="Recent Sessions" 
            items={recentData} 
            keyField="id" 
            label="label" 
            subtitle="subtitle" 
            value="value" 
            status="status" 
          />
        </div>
      </main>
    </div>
  );
}