import { useContext, useEffect, useState } from "react";
import { DataContext } from "../context/DataContext";
import "./summary.css";
import { Menu } from 'lucide-react';
import { Link } from "react-router-dom";
import NavSidebar from "./NavSidebar";
import SideBar from '../components/SideBar';
import SearchAndFilters from '../components/SearchAndFilters';

import { durationStrToSeconds, formatSeconds, formatDuration } from "../utils/times";

function Sessions() {
  const { sessions } = useContext(DataContext);
  const [filteredSessions, setFilteredSessions] = useState(sessions);
  const [summary, setSummary] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);


  useEffect(() => {
    if (sessions) {
      setFilteredSessions(sessions);

      const computeSummary = (adata) => {
        const data = adata.slice(1); // Exclude header row
        // console.log(data);
        
        const pagesIndex = 8;  // Pages read
        const sessionIndex = 9; // Session time
        const bookIndex = 10; // Book ID
    
        const totalPages = data.reduce((sum, row) => {
          const pages = parseInt(row[pagesIndex], 10);
          return sum + (isNaN(pages) ? 0 : pages);
        }, 0);
        
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

      computeSummary(sessions);
    }
  }, [sessions]);

  if (!sessions) return <p>Loading data...</p>;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SideBar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              navComponent={NavSidebar}
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
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
                {summary && (
                  <div className="p-4 bg-card rounded-lg shadow">
                    <p><strong>Total Pages Read:</strong> {summary.totalPages}</p>
                    <p><strong>Total Sessions:</strong> {summary.totalSessions}</p>
                    <p><strong>Books Read:</strong> {summary.totalBooks}</p>
                    <p><strong>Total Reading Time:</strong> {summary.totalTime}</p>
                  </div>
              )}
            </div>
            <div className="flex-1">
                <SearchAndFilters data={sessions} onFilter={setFilteredSessions} />
            </div>
          </div>
          <div className="table-container overflow-x-auto bg-card rounded-lg shadow">

                <table>
                  <thead>
                <tr>
                  {filteredSessions &&
                    filteredSessions[0].map((header, i) => <th key={i}>{header}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                {filteredSessions &&
                  filteredSessions.slice(1).map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => {
                          if (j === 0 || j === 4 || j === 5) {
                            const parsedDate = new Date(cell);
                          
                            if (isNaN(parsedDate)) {
                              return <td key={j}>{cell}</td>; // fallback if not a valid date
                            }
                          
                            // Show full date+time for j === 0, and time only for j === 4 or j === 5
                            const displayValue =
                              j === 0
                                ? parsedDate.toLocaleString("default", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) // e.g. "Jan 1, 2023
                                : parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // e.g. "3:45 PM"
                          
                            return <td key={j}>{displayValue}</td>;
                          }
                          if (j === 9) return <td key={j}>{formatDuration(cell)}</td>;
                          return <td key={j}>{cell}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
            </table>
          </div>
        </div>  
      </main >
    </div>
  );
}

export default Sessions;
