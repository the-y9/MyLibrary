import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const TestDataContext = createContext();

const SHEET_ID = "1wS-hj8ABggdFNvs3BuyKBu8T1d6uVBuu8408l_DooQ8";
const TESTS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&tq=${encodeURIComponent(
  "select * order by A desc limit 10000"
)}`;

// Parse Excel-style date
// eslint-disable-next-line
const parseExcelDate = (dateStr) => {
    console.log(1, dateStr);
    
  if (!dateStr || !dateStr.startsWith("Date(")) return dateStr;
  try {
    const parts = dateStr.match(/Date\(([^)]+)\)/)[1].split(",").map(Number);
    const [y, m, d, h, min, s] = parts;
    return new Date(y, m, d, h, min, s);
  } catch {
    return null;
  }
};

// Parse Google Sheets GViz response
const parseGviz = (text) => {
  const json = JSON.parse(text.substring(47, text.length - 2));
  return json.table.rows;
};

export const TestDataProvider = ({ children }) => {
    const [tests, setTests] = useState(null);
    const [refresh, setRefresh] = useState(0);
    
  const fetchTests = async () => {
    try {
      const cached = localStorage.getItem("tests");
      if (cached && refresh === 0) {
        setTests(JSON.parse(cached));
        return;
      }
      if (typeof window !== "undefined" && localStorage.getItem("tests")) {
        localStorage.removeItem("tests");
      }
      
      const res = await axios.get(TESTS_URL);
      const rows = parseGviz(res.data);
// console.log(rows);

      // Get header labels
      const headersJson = JSON.parse(res.data.substring(47, res.data.length - 2));
      const headerRow = headersJson.table.cols.map((c) => c.label);

      // Indices of columns that should be treated as numbers
      const numericCols = [
        "Total Qs", "Reward", "Penalty", "Attempted", "Correct", "Wrong", "Unattempted",
        "Score", "Score %", "Accuracy %", "Time (min)", "Readiness", "Quickness",
        "PRIndex", "PREIndex",
        "Polity", "History", "Geography", "Economy", "Environment & Ecology",
        "Science & Tech", "Current Affairs", "Miscellaneous", 
      ];
      const numericIndices = numericCols.map((col) => headerRow.indexOf(col)).filter(i => i >= 0);

      // Transform rows
      const testData = rows.map((r) => {
        const cells = r.c.map((c, i) => {
            let value = c ? c.v : "";
            let fvalue = c ? c.f : "";
          
          // Convert date
          if (i === 0) return fvalue;
          
          // Convert numeric columns
          if (numericIndices.includes(i)) {
            const num = parseFloat(value).toFixed(2);
            return isNaN(num) ? null : num;
          }

          return value;
        });

        // Add a key using the date
          const key = cells[0] + cells[1];

        return { key, data: cells };
      });

      // Sort descending by date
      testData.sort((a, b) => (b.data[0] || 0) - (a.data[0] || 0));

      setTests({ headers: headerRow, rows: testData });
      localStorage.setItem("tests", JSON.stringify({ headers: headerRow, rows: testData }));
    } catch (err) {
      console.error("Error fetching test data:", err);
    }
  };

  useEffect(() => {
    fetchTests();
    // eslint-disable-next-line
  }, [refresh]);

  return (
    <TestDataContext.Provider value={{ tests, refresh, setRefresh }}>
      {children}
    </TestDataContext.Provider>
  );
};
