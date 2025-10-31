import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const DataContext = createContext();

const SHEET_ID = "1HzHupzGxFMqQjtz0ZsVEHZgD87MiEk-VJcg0OrIfUio";
const SESSIONS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
const BOOKS_MASTER_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=0`;

const parseExcelDate = (dateStr) => {
  if (!dateStr || !dateStr.startsWith("Date(")) return null;
  try {
    const parts = dateStr.match(/Date\(([^)]+)\)/)[1].split(",").map(Number);
    const [y, m, d, h, min, s] = parts;
    return new Date(y, m, d, h, min, s);
  } catch {
    return null;
  }
};


export const DataProvider = ({ children }) => {
  const [sessions, setSessions] = useState(null);
  const [books, setBooks] = useState(null);
  const [bookSummary, setBookSummary] = useState(null);

  const parseGviz = (text) => {
    const json = JSON.parse(text.substring(47, text.length - 2));
    return json.table.rows;
  };

  const fetchBooksMaster = async () => {
    const cached = localStorage.getItem("books");
    if (cached) {
        const parsed = JSON.parse(cached);
        setBooks(parsed); // <-- set state here too
        return parsed;
      }

    const res = await axios.get(BOOKS_MASTER_URL);
    const rows = parseGviz(res.data);

    const data = rows.map((r) => {
      const cells = r.c.map((c) => (c ? c.v : ""));
      return {
        bookId: cells[0],
        bookTitle: cells[1],
        totalPages: Number(cells[8] || 0),
      };
    });

    const lookup = {};
    data.forEach((b) => (lookup[b.bookId] = b));

    localStorage.setItem("books", JSON.stringify(lookup));
    setBooks(lookup);

    return lookup;
  };

  const fetchSessionsAndCompute = async () => {
    try {
      const booksMaster = await fetchBooksMaster();
  
      const cachedSessions = localStorage.getItem("sessions");
      if (cachedSessions) {
        setSessions(JSON.parse(cachedSessions));
      }
  
      const res = await axios.get(SESSIONS_URL);
      const rows = parseGviz(res.data);
  
      // Get header labels
      const headers = res.data.substring(47).slice(0, -2); 
      const parsed = JSON.parse(headers);
      const headerRow = parsed.table.cols.map((c) => c.label);
  
      // Transform rows
      const sessionData = rows.map((r) =>
        r.c.map((c, i) => {
          const value = c ? c.v : "";
          // Convert date columns (e.g., first column) to Date objects
          if (i === 0||i === 4||i === 5) return parseExcelDate(value);
          return value;
        })
      );

      // Sort descending by timestamp column (index 0)
      sessionData.sort((a, b) => b[0] - a[0]);
      
      // Combine header + data
      const allData = [headerRow, ...sessionData];
  // console.log(allData);
      setSessions(allData);
      localStorage.setItem("sessions", JSON.stringify(allData));
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };
  

  useEffect(() => {
    fetchSessionsAndCompute();
  }, []);

  return (
    <DataContext.Provider value={{ sessions, books, bookSummary }}>
      {children}
    </DataContext.Provider>
  );
};
