import { useContext } from "react";
import { TestDataContext } from "../context/TestDataContext";

function TestTable({ visibleHeaders = []}) {
  const { tests } = useContext(TestDataContext);
// console.log(tests);

 
  if (!tests) return <p>Loading...</p>;

  // Find indexes of headers to display
  const visibleIndexes = tests.headers
    .map((h, i) => (visibleHeaders.includes(h) ? i : -1))
    .filter((i) => i !== -1);

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {visibleIndexes.map((i) => (
              <th
                key={i}
                className="px-4 py-2 cursor-pointer select-none"
                onClick={() => { }}
              >
                <div className="flex items-center">
                  {tests.headers[i]}
                  {/* {sortBy === key && (
                    <span className="ml-1 text-gray-400 text-xs">
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )} */}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tests.rows.map((row) => (
            <tr
              key={row.key}
              className="border-t hover:bg-gray-50 transition"
            >
              {visibleIndexes.map((i) => (
                <td key={i} className="px-4 py-2">
                  {row.data[i] instanceof Date
                    ? row.data[i].toLocaleDateString()
                    : row.data[i]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TestTable;
