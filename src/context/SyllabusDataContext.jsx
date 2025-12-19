import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const SyllabusDataContext = createContext();

const SHEET_ID = process.env.REACT_APP_LOG_SHEET_ID;

const SYLLABUS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=1753217958`;

// Parse Google Sheets GViz response
const parseGviz = (text) => {
  const json = JSON.parse(text.substring(47, text.length - 2));
  return json.table;
};

export const SyllabusDataProvider = ({ children }) => {
  const [syllabus, setSyllabus] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const fetchSyllabus = async () => {
    try {
      const cached = localStorage.getItem("syllabus");
      if (cached && refresh === 0) {
        setSyllabus(JSON.parse(cached));
        return;
      }

      localStorage.removeItem("syllabus");

      const res = await axios.get(SYLLABUS_URL);
      const table = parseGviz(res.data);

      // const headers = table.cols.map((c) => c.label);
      const rows = table.rows;
      const headers = rows[0].c.map((c) => (c ? c.v : ""));

      // Columns that should be numbers
      const numericCols = ["Revision Count", "PYQs Done"];
      const numericIndices = numericCols
        .map((col) => headers.indexOf(col))
        .filter((i) => i >= 0);

      const syllabusData = rows.slice(1).map((r, idx) => {
        const cells = r.c.map((c, i) => {
          let value = c ? c.v : "";

          if (numericIndices.includes(i)) {
            const num = Number(value);
            return isNaN(num) ? 0 : num;
          }

          return value ?? "";
        });

        const key = `row-${idx}`;

        return { key, data: cells };
      });

      const finalData = {
        headers,
        rows: syllabusData,
      };

      setSyllabus(finalData);
      localStorage.setItem("syllabus", JSON.stringify(finalData));
    } catch (err) {
      console.error("Error fetching syllabus data:", err);
    }
  };

  useEffect(() => {
    fetchSyllabus();
    // eslint-disable-next-line
  }, [refresh]);

  return (
    <SyllabusDataContext.Provider value={{ syllabus, refresh, setRefresh }}>
      {children}
    </SyllabusDataContext.Provider>
  );
};
