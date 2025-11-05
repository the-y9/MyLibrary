import { useState, useEffect } from "react";

function SearchAndFilter({ data = [], onFilter }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [columnFilter, setColumnFilter] = useState("all");

  // Determine if data is array-of-arrays or array-of-objects
  const isArrayOfArrays =
    Array.isArray(data) &&
    data.length > 0 &&
    Array.isArray(data[0]);

  // Extract headers safely
  const headers = isArrayOfArrays
    ? data[0] || []
    : data.length > 0
    ? Object.keys(data[0])
    : [];

  // Reset filter whenever data changes
  useEffect(() => {
    if (data && data.length > 0) onFilter(data);
  }, [data, onFilter]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    filterData(query, columnFilter);
  };

  const handleColumnChange = (e) => {
    const col = e.target.value;
    setColumnFilter(col);
    filterData(searchQuery, col);
  };

  const filterData = (query, column) => {
    if (!data || data.length === 0) return;

    let filtered;

    if (isArrayOfArrays) {
      // Handle 2D array data
      const headerRow = data[0];
      const rows = data.slice(1);
      filtered = rows.filter((row) => {
        if (!query) return true;
        if (column === "all") {
          return row.some((cell) =>
            String(cell).toLowerCase().includes(query)
          );
        } else {
          const colIndex = headerRow.indexOf(column);
          if (colIndex === -1) return true;
          return String(row[colIndex])
            .toLowerCase()
            .includes(query);
        }
      });
      onFilter([headerRow, ...filtered]);
    } else {
      // Handle array of objects data
      filtered = data.filter((row) => {
        if (!query) return true;
        if (column === "all") {
          return Object.values(row).some((val) =>
            String(val).toLowerCase().includes(query)
          );
        } else {
          const cell = row[column];
          return String(cell).toLowerCase().includes(query);
        }
      });
      onFilter(filtered);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-lg shadow">
      <input
        type="text"
        placeholder="Search..."
        className="border p-2 rounded w-full md:w-1/2"
        value={searchQuery}
        onChange={handleSearch}
      />

      <select
        className="border p-2 rounded w-full md:w-1/4"
        value={columnFilter}
        onChange={handleColumnChange}
      >
        <option value="all">All Columns</option>
        {headers.map((header, i) => (
          <option key={i} value={header}>
            {header}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SearchAndFilter;
