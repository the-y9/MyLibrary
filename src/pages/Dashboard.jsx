import { useContext, useState, useMemo, useCallback } from 'react';
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
import { getDateKey } from "../utils/times";

const changeForm = (final, initial) => {
  if (!initial || initial === 0) return "";
  const change = (((final - initial) / initial) * 100).toFixed(2);
  return change > 0 ? `+${change}%` : `${change}%`;
};

// Helper for consistent date key generation


export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sessions } = useContext(DataContext);
  const [interval, setInterval] = useState("daily");

  // 1. Process Raw Data Once
  const processedData = useMemo(() => {
    if (!sessions || sessions.length < 2) return [];
    return sessions.slice(1).map((row) => {
      const stime = Number(row[9]) || 0;
      const pagesRead = Number(row[8]) || 0;
      return {
        timestamp: row[0],
        book: row[1],
        pages: pagesRead,
        time: stime,
        speed: stime > 0 ? +(pagesRead / stime).toFixed(2) : 0,
        id: row[10],
        chapter: row[6],
        status: row[7]?.trim().toLowerCase() || "",
      };
    });
  }, [sessions]);

  // 2. Aggregate Data and Fill Gaps in one logic block
  const { chartData, pieData } = useMemo(() => {
    if (processedData.length === 0) return { chartData: [], pieData: [] };

    // Grouping
    const grouped = {};
    processedData.forEach((item) => {
      const key = getDateKey(new Date(item.timestamp), interval);
      if (!grouped[key]) {
        grouped[key] = { 
            pages: 0, time: 0, speedSum: 0, count: 0, 
            books: {}, uniqueBooks: new Set(), uniqueChps: new Set(), completedChps: new Set() 
        };
      }
      const g = grouped[key];
      g.pages += item.pages;
      g.time += item.time;
      g.speedSum += item.speed;
      g.count += 1;
      g.uniqueBooks.add(item.book);
      g.uniqueChps.add(item.chapter);
      if (item.status === 'completed') g.completedChps.add(item.chapter);
      
      // Track book distribution for Pie Chart (only for the very last interval)
      g.books[item.book] = (g.books[item.book] || 0) + item.pages;
    });

    // Sort existing keys to find range
    const sortedKeys = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
    const result = [];
    const startDate = new Date(sortedKeys[0]);
    const endDate = new Date();

    // Fill gaps and format result
    for (let d = new Date(startDate); d <= endDate; ) {
      const key = getDateKey(d, interval);
      const g = grouped[key];
      
      result.push({
        timestamp: key,
        pages: g?.pages || 0,
        time: g?.time || 0,
        bookCount: g?.uniqueBooks.size || 0,
        chpCount: g?.uniqueChps.size || 0,
        Chapters_Completed: g?.completedChps.size || 0,
        speed: g?.count ? +(g.speedSum / g.count).toFixed(2) : 0,
        _rawGroup: g // temp storage for pie chart
      });

      // Increment date based on interval
      if (interval === "daily") d.setDate(d.getDate() + 1);
      else if (interval === "weekly") d.setDate(d.getDate() + 7);
      else if (interval === "monthly") d.setMonth(d.getMonth() + 1);
      else d.setFullYear(d.getFullYear() + 1);
    }

    const lastTen = result.slice(-10);
    const lastIntervalGroup = lastTen[lastTen.length - 1]?._rawGroup?.books || {};
    
    return {
      chartData: lastTen,
      pieData: Object.entries(lastIntervalGroup).map(([label, value]) => ({ label, value }))
    };
  }, [processedData, interval]);

  // 3. Simple Stats derivation
  const statsData = useMemo(() => {
    if (chartData.length === 0) return [];
    
    const last = chartData[chartData.length - 1];
    const secondLast = chartData[chartData.length - 2] || null;
    
    const totalPages = chartData.reduce((sum, i) => sum + i.pages, 0);
    const totalTime = chartData.reduce((sum, i) => sum + i.time, 0);
    const avgSpeed = totalTime > 0 ? totalPages / totalTime : 0;

    const timeStr = last.time < 60 
      ? `${last.time.toFixed(0)} min` 
      : `${Math.floor(last.time / 60)}h ${(last.time % 60).toFixed(0)}m`;

    return [
      { label: "Total Pages Read", value: last.pages, change: changeForm(last.pages, secondLast?.pages) },
      { label: "Total Time", value: timeStr, change: changeForm(last.time, secondLast?.time) },
      { label: "Books Visited", value: last.bookCount, change: changeForm(last.bookCount, secondLast?.bookCount) },
      { label: "Chapters Visited", value: last.chpCount, change: changeForm(last.chpCount, secondLast?.chpCount) },
      { label: "Chapters Completed", value: last.Chapters_Completed, change: changeForm(last.Chapters_Completed, secondLast?.Chapters_Completed) },
      { label: "Average Speed", value: last.speed, change: changeForm(last.speed, secondLast?.speed), avgSpeed },
    ];
  }, [chartData]);

  const recentData = useMemo(() => {
    return [...processedData]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3)
      .map(item => ({
        id: item.timestamp,
        label: item.chapter || "Chapter",
        subtitle: `${item.book} · ${new Date(item.timestamp).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}`,
        value: `${item.pages} pages · ${item.time.toFixed(0)} min`,
        status: item.status || "Pending",
      }));
  }, [processedData]);

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} navComponent={NavSidebar} />
      <main className="flex-1 p-4 sm:p-6 space-y-6 w-full">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Dashboard</h2>
            <p className="text-muted-foreground-500 text-sm">
              {chartData.length > 0 && chartData[chartData.length - 1].timestamp}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="md:hidden p-2 rounded-lg border" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
            <Link to="/add-session" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">+ New Session</Link>
          </div>
        </div>

        <GenericStatsCards stats={statsData.slice(0, 4)} />
        
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

        <div className="flex gap-2 mb-4">
          {["daily", "weekly", "monthly", "yearly"].map((option) => (
            <button
              key={option}
              onClick={() => setInterval(option)}
              className={`px-3 py-1 rounded ${interval === option ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800"}`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GenericLineChart
            title="Pages vs Time"
            data={chartData}
            dataKeyX="timestamp"
            lines={[{ key: "pages", label: "Pages" }, { key: "time", label: "Time Spent (min)" }]}
            rightAxis={true}
            interval={interval}
          />
          <GenericPieChart title="Pages Read by Book" data={pieData} />
          <DataListCard book="Recent Sessions" items={recentData} keyField="id" label="label" subtitle="subtitle" value="value" status="status" />
        </div>
      </main>
    </div>
  );
}