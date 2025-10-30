import { useContext, useEffect, useState } from "react";
import { DataContext } from "../context/DataContext";
import "./summary.css";
import { Menu } from 'lucide-react';
import { Link } from "react-router-dom";
import NavSidebar from "./NavSidebar";
import SideBar from '../components/SideBar';

function Sessions() {
  const { sessions } = useContext(DataContext);
  const [summary, setSummary] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sessions) {
      computeSummary(sessions);
    }
  }, [sessions]);

  const durationStrToSeconds = (dateStr) => {
    if (!dateStr) return -1
    const match = dateStr.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
    if (!match) return 0;
    const [, , , , hours, minutes, seconds] = match.map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const formatSeconds = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const mm = minutes.toString().padStart(2, "0");
    const ss = seconds.toString().padStart(2, "0");
    return `${hours}:${mm}:${ss}`;
  };

  const formatDuration = (dateStr) => {
    const totalSeconds = durationStrToSeconds(dateStr);
    return formatSeconds(totalSeconds);
  };

  const computeSummary = (data) => {
    const pagesIndex = 8;  // Pages read
    const sessionIndex = 9; // Session time
    const bookIndex = 10; // Book ID

    const totalPages = data.reduce((sum, row) => sum + Number(row[pagesIndex] || 0), 0);
    const totalSeconds = data.reduce((sum, row) => sum + durationStrToSeconds(row[sessionIndex]), 0);
    const totalSessions = data.filter((r) => r[bookIndex]).length;
    const books = [...new Set(data.map((r) => r[bookIndex]).filter(Boolean))];

    setSummary({
      totalPages,
      totalSessions,
      totalBooks: books.length,
      totalTime: formatSeconds(totalSeconds),
    });
  };

  if (!sessions) return <p>Loading data...</p>;

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
      
      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 space-y-6 w-full">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Sessions</h1>
            <p className="text-gray-500 text-sm">Reading sessions overview</p>
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
        <div className="app">
                {summary && (
                  <div className="summary">
                    <p><strong>Total Pages Read:</strong> {summary.totalPages}</p>
                    <p><strong>Total Sessions:</strong> {summary.totalSessions}</p>
                    <p><strong>Books Read:</strong> {summary.totalBooks}</p>
                    <p><strong>Total Reading Time:</strong> {summary.totalTime}</p>
                  </div>
                )}

                <table>
                  <thead>
                    <tr>
                      {sessions[0].map((header, i) => <th key={i}>{header}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.slice(1).map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => {
                          if (j === 9 || j === 4 || j === 5) return <td key={j}>{formatDuration(cell)}</td>;
                          return <td key={j}>{cell}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>  
      </main >
    </div>
  );
}

export default Sessions;
