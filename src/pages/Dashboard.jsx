import { useContext, useState, useMemo } from 'react';
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

const dateForm = "default"; 
const changeForm = (final, initial) => {
  if (initial === 0) return "";
  const change = (((final - initial) / initial) * 100).toFixed(2);
  return change > 0 ? `+${change}%` : `${change}%`;
};

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sessions } = useContext(DataContext);
  const [interval, setInterval] = useState("daily"); // "daily" | "weekly" | "monthly" | "yearly"

  const processedData = useMemo(() => {
    if (!sessions || sessions.length < 2) return [];

    const headers = sessions[0];
    const rows = sessions.slice(1);

    return rows.map((row) => {
      const timestamp = row[0];
      
      const book = row[1];
      
      const startTime = row[4];
      const endTime = (row[5]);

      const pagesRead = row[8];
      const timeSpent =
        startTime && endTime
          ? (endTime - startTime) / (1000 * 60) // minutes
          : 0;
      const speed = timeSpent > 0 ? +(pagesRead / timeSpent).toFixed(2) : 0;

      const id = row[10];
      const chapter = row[6];
      const status = row[7]

      return {
        timestamp,
        book,
        pages: pagesRead,
        time: timeSpent,
        speed,
        id,
        chapter,
        status,
      };
    });
  }, [sessions]);

  const recentData = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];
    const sorted = [...processedData].sort((a, b) => b.timestamp - a.timestamp);
    const top3 =  sorted.slice(0, 3);

    return top3.map((item) => {
      const date = new Date(item.timestamp);
      const formattedDate = date.toLocaleDateString(dateForm, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
  
      
      return {
        id: item.timestamp, // fallback to timestamp if id missing
        label: item.chapter ?? "Chapter",
        subtitle: `${item.book} · ${formattedDate}`,
        value: `${item.pages} pages · ${item.time.toFixed(2)} min`,
        status: item.status || "Pending",
      };
    });
  }, [processedData]);
  
  const chartData = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];
  
    const grouped = {};
    processedData.forEach((item) => {
      const date = new Date(item.timestamp);
      let key;
  
      switch (interval) {
        case "daily":
          key = date.toLocaleDateString(dateForm, { month: "short", day: "numeric", year: "numeric" });
          break;
        case "weekly": {
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Monday
          key = startOfWeek.toLocaleDateString(dateForm, { month: "short", day: "numeric", year: "numeric" });
          break;
        }
        case "monthly":
          key = date.toLocaleDateString(dateForm, { month: "short", year: "numeric" });
          break;
        case "yearly":
          key = String(date.getFullYear());
          break;
        default:
          key = date.toLocaleDateString();
      }
  
      if (!grouped[key])
        grouped[key] = { timestamp: key, pages: 0, time: 0, speed: 0, count: 0, bookSessions: 0, uniqueBooks: new Set() };
  
      grouped[key].pages += Number(item.pages) || 0;
      grouped[key].time += Number(item.time) || 0;
      grouped[key].speed += item.speed || 0;
      grouped[key].count += 1;
      grouped[key].bookSessions += 1;
      grouped[key].uniqueBooks.add(item.book);
    });
  
    // Turn into array
    const result = Object.values(grouped).map((g) => ({
      timestamp: g.timestamp,
      bookSessions: g.bookSessions,
      pages: g.pages,
      time: g.time,
      bookCount: g.uniqueBooks.size,
      speed: g.count ? +(g.speed / g.count).toFixed(2) : 0,
    }));
  
    result.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
    // --- 🧩 Fill missing intervals with zero values ---
    const filled = [];
  
    if (result.length > 0) {
      const startDate = new Date(result[0].timestamp);
      const endDate = new Date(); // always up to today
  
      const addInterval = (d) => {
        switch (interval) {
          case "daily":
            d.setDate(d.getDate() + 1);
            break;
          case "weekly":
            d.setDate(d.getDate() + 7);
            break;
          case "monthly":
            d.setMonth(d.getMonth() + 1);
            break;
          case "yearly":
            d.setFullYear(d.getFullYear() + 1);
            break;
          default:
            d.setDate(d.getDate() + 1);
        }
      };
  
      for (let d = new Date(startDate); d <= endDate; addInterval(d)) {
        let key;
        switch (interval) {
          case "daily":
            key = d.toLocaleDateString(dateForm, { month: "short", day: "numeric", year: "numeric" });
            break;
          case "weekly": {
            const startOfWeek = new Date(d);
            startOfWeek.setDate(d.getDate() - d.getDay() + 1);
            key = startOfWeek.toLocaleDateString(dateForm, { month: "short", day: "numeric", year: "numeric" });
            break;
          }
          case "monthly":
            key = d.toLocaleDateString(dateForm, { month: "short", year: "numeric" });
            break;
          case "yearly":
            key = String(d.getFullYear());
            break;
          default:
            key = d.toLocaleDateString();
        }
  
        const found = result.find((r) => r.timestamp === key);
        filled.push(
          found || {
            timestamp: key,
            bookSessions: 0,
            pages: 0,
            time: 0,
            bookCount: 0,
            speed: 0,
          }
        );
      }
    }
  
    return filled.slice(-10);
  }, [processedData, interval]);
  
  const statsData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
  // console.log(chartData);
  
    // Take the last aggregate
    const secondLast = chartData.length > 1 ? chartData[chartData.length - 2] : null;
    const last = chartData[chartData.length - 1];
    
    const totalPages = last.pages;
    const totalTime = last.time; // in minutes
    const avgSpeed = totalTime > 0 ? +(totalPages / totalTime).toFixed(2) : 0;
    const secLastAvgSpeed = secondLast && secondLast.time > 0 ? +(secondLast.pages / secondLast.time).toFixed(2) : 0;
  
    const timeChange = secondLast ? changeForm(last.time, secondLast.time) : "";
    const speedChange = secondLast ? changeForm(avgSpeed, secLastAvgSpeed) : "";
    return [
      {label: "Sessions" , value: last.bookSessions, change: changeForm(last.bookSessions, secondLast ? secondLast.bookSessions : 0)},
      { label: "Total Pages Read", value: totalPages, change: changeForm(last.pages, secondLast ? secondLast.pages : 0) },
      totalTime < 60
        ? { label: "Total Time", value: totalTime.toFixed(2) + "min", change: timeChange }
        : { label: "Total Time", value: (totalTime / 60).toFixed(0) + " h " + (totalTime % 60) + " min", change: timeChange },
      {label: "Books Read", value: last.bookCount, change: changeForm(last.bookCount, secondLast ? secondLast.bookCount : 0)},
      { label: "Average Speed (pages/min)", value: avgSpeed, change: speedChange },
    ];
  }, [chartData]);
  
  const pieData = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];
  
    // For the last interval
    const lastInterval = chartData[chartData.length - 1];
  
    // Aggregate by book using only items contributing to this interval
    const books = {};
    processedData.forEach(item => {
      let key;
      const date = new Date(item.timestamp);
  
      switch(interval) {
        case "daily":
          key = date.toLocaleDateString(dateForm, { month: "short", day: "numeric", year: "numeric" });
          break;
        case "weekly": {
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay() + 1); // get Monday as start of week
          key = startOfWeek.toLocaleDateString(dateForm, { month: "short", day: "numeric", year: "numeric" });
          break;
        }
        case "monthly":
          key = date.toLocaleDateString(dateForm, { month: "short", year: "numeric" });
          break;
        case "yearly":
          key = date.getFullYear();
          break;
        default:
          key = date.toLocaleDateString();
      }
  
      if(key === lastInterval.timestamp){
        if(!books[item.book]) books[item.book] = 0;
        books[item.book] += item.pages;
      }
    });
    const result = Object.entries(books).map(([book, pages]) => ({ label: book, value: pages }));
    // console.log(result);
    return result;
  }, [processedData, chartData, interval]);
  
    
  return (
    <div className="flex min-h-screen bg-gray-50">
     <SideBar sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              title="Library"
              navComponent={NavSidebar}
              footerContent="👤 Profile Settings"
              width="w-72"
              bgColor="bg-gray-50"
              borderColor="border-gray-200"
              textColor="text-blue-700"
              footerTextColor="text-gray-600" />

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 space-y-6 w-full">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Dashboard</h2>
            <p className="text-gray-500 text-sm">
              {chartData.length > 0 && (
                <>
                  {interval === "weekly"
                    ? (() => {
                        const lastDate = new Date(chartData[chartData.length - 1].timestamp);
                        lastDate.setDate(lastDate.getDate() + 7);

                        // format both start and end
                        const startLabel = new Date(chartData[chartData.length - 1].timestamp).toLocaleDateString(dateForm, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });

                        const endLabel = lastDate.toLocaleDateString(dateForm, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });

                        return `${startLabel} - ${endLabel}`;
                      })()
                    : chartData[chartData.length - 1].timestamp}
                </>
              )}
            </p>

          </div>
          <div className="flex items-center gap-2">
            <button
              className="md:hidden p-2 rounded-lg border text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              <Link to="https://forms.gle/AUyCFVASWgtFVJg69" target="blank"> + New Session</Link>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {/* <div className="flex flex-wrap gap-4"> */}
          <GenericStatsCards stats={statsData.slice(0, statsData.length -1)} />
          <GenericStatsCardWithChart statd={statsData.slice(-1)} graphData={chartData} lineDatakey="speed"/>
        {/* </div> */}

        {/* Alerts */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-800 p-3 rounded-md">
            ⚠️ <span>Low Stock Alert: 5 products are running low on stock.</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-300 text-blue-800 p-3 rounded-md">
            ⏰ <span>3 memberships expire in 3 days. Send payment reminders.</span>
          </div>
        </div> */}

        {/* Graphs & recent */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphs */}
          <GenericLineChart
            title="Pages vs Time"
            data={chartData}
            dataKeyX="timestamp"
            lines={[{ key: "pages", label: "Pages" },
              { key: "time", label: "Time Spent (min)" },
              // { key: "speed", label: "Speed (pages/min)" },
            ]}
            rightAxis={true}
            interval={interval}
          />
          
          <GenericPieChart title="Pages Read by Book" data={pieData} />

          {/* Recents */}
          
          <DataListCard book="Recent Sessions" items={recentData} keyField="id"
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
