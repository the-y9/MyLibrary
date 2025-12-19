import React, { useState } from "react";

const SyllabusTable = ({ headers, rows }) => {
  const [sectionFilter, setSectionFilter] = useState("");

  // Compute filtered rows based on section filter
  const filteredRows = sectionFilter
    ? rows.filter((r) => r.data[2] === sectionFilter)
    : rows;

  // Extract unique sections for the dropdown
  const sections = [...new Set(rows.map((r) => r.data[2]))];

  return (
    <div>
      {/* Controls */}
      <div style={{ marginBottom: "15px" }}>
        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
        >
          <option value="">All Sections</option>
          {sections.map((sec) => (
            <option key={sec} value={sec}>
              {sec}
            </option>
          ))}
        </select>
      </div>

      <p style={{ marginTop: "10px" }}>
        Showing {filteredRows.length} / {rows.length} topics
      </p>

          {/* Table */}
    <div className="bg-card rounded-lg shadow overflow-x-auto">
          
      <table className="min-w-full text-sm text-left border border-border">
        <thead className="bg-gray-100 text-gray-700 border border-border">
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
    </div>
  );
};

export default SyllabusTable;
