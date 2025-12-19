
  
import { useContext, useState } from "react";
import {
    SyllabusDataProvider,
    SyllabusDataContext
  } from "../context/SyllabusDataContext";
  

function Syllabus() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [interval, setInterval] = useState("daily");

  const dateForm = undefined; // optional locale

  return (
    <SyllabusDataProvider>
      <SyllabusPage
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        interval={interval}
              dateForm={dateForm}
              setInterval={setInterval}
      />
    </SyllabusDataProvider>
  );
}

const SyllabusPage = () => {
  const { syllabus, setRefresh } = useContext(SyllabusDataContext);
  const [subjectFilter, setSubjectFilter] = useState("");
//   console.log(syllabus);

  if (!syllabus) return <h2>Loading syllabus...</h2>;

  const { headers, rows } = syllabus;

  const filteredRows = subjectFilter
    ? rows.filter((r) => r.data[3] === subjectFilter)
    : rows;

  const subjects = [...new Set(rows.map((r) => r.data[3]))];

  return (
    <div style={{ padding: "20px" }}>
      <h1>📘 UPSC Syllabus Tracker</h1>

      {/* Controls */}
      <div style={{ marginBottom: "15px" }}>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          <option value="">All Subjects</option>
          {subjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>

        <button
          style={{ marginLeft: "10px" }}
          onClick={() => setRefresh((r) => r + 1)}
        >
          🔄 Refresh
        </button>
      </div>
      <p style={{ marginTop: "10px" }}>
        Showing {filteredRows.length} / {rows.length} topics
      </p>
      {/* Table */}
      <table
        border="1"
        cellPadding="8"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead style={{ background: "#f0f0f0" }}>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredRows.map((row) => (
            <tr key={row.key}>
              {row.data.map((cell, i) => (
                <td key={i}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      
    </div>
  );
};

export default Syllabus;