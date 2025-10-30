// src/App.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./summary.css";

const YOUR_SHEET_ID_HERE = "1HzHupzGxFMqQjtz0ZsVEHZgD87MiEk-VJcg0OrIfUio"
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/" +YOUR_SHEET_ID_HERE+"/gviz/tq?tqx=out:json";

function App() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(SHEET_URL);
        const jsonString = res.data.substring(47).slice(0, -2); // clean response
        const parsed = JSON.parse(jsonString);
        const headers = parsed.table.cols.map((c) => c.label);
        const data = parsed.table.rows.map((r) =>
          r.c.map((c) => (c ? c.v : ""))
        );
        setRows([headers, ...data]);
        computeSummary(data);
      } catch (err) {
        console.error("Error loading sheet:", err);
      }
    };
    fetchData();
  }, []);

  // Convert Google Sheets duration Date to HH:MM:SS
  const formatDuration = (dateStr) => {
    if (!dateStr) return "0:00:00";
  
    // Match the numbers inside Date(...)
    const match = dateStr.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
    if (!match) return "0:00:00";
  
    // Destructure the matched numbers and convert to integers
    const [, , , , hours, minutes, seconds] = match.map(Number);
  
    // Use only hours, minutes, seconds (ignore year/month/day)
    const hh = hours.toString().padStart(2, "0");
    const mm = minutes.toString().padStart(2, "0");
    const ss = seconds.toString().padStart(2, "0");
  
    return `${hh}:${mm}:${ss}`;
  };
  
  const durationStrToSeconds = (dateStr) => {
    if (!dateStr) return 0;
  
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
  

  
  
  
  const computeSummary = (data) => {
    const pagesIndex = 8; // "Pages Read"
    const sessionIndex = 9; // "Session Time"
    const bookIndex = 10; // "Book Id"

    const totalPages = data.reduce(
      (sum, row) => sum + Number(row[pagesIndex] || 0),
      0
      );

      const totalSeconds = data.reduce(
        (sum, row) => sum + durationStrToSeconds(row[9]), // 9 = Session Time column
        0
      );

    const totalTime = data.reduce(
      (sum, row) => sum + Number(row[sessionIndex] || 0),
      0
    );
    const totalSessions = data.filter((r) => r[bookIndex]).length;
    const books = [...new Set(data.map((r) => r[bookIndex]).filter(Boolean))];

    setSummary({
      totalPages,
      totalSessions,
      totalBooks: books.length,
      totalTime: formatSeconds(totalSeconds),
    });
  };

  return (
    <div className="App">
      <h1>📚 Reading Summary</h1>

      {summary && (
        <div className="summary">
          <p><strong>Total Pages Read:</strong> {summary.totalPages}</p>
          <p><strong>Total Sessions:</strong> {summary.totalSessions}</p>
          <p><strong>Books Read:</strong> {summary.totalBooks}</p>
          <p><strong>Total Reading Time:</strong> {summary.totalTime}</p>

        </div>
      )}

      {rows.length > 0 ? (
        <table>
          <thead>
            <tr>
              {rows[0].map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(1).map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => {
                    // session time column index 9
                    if (j === 9 || j === 4 || j === 5) {
                    return <td key={j}>{formatDuration(cell)}</td>;
                    }
                    return <td key={j}>{cell}</td>;
                })}
                </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
}

export default App;
