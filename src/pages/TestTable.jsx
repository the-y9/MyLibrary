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
    <div className="bg-card rounded-lg shadow overflow-x-auto">
      <table className="min-w-full text-sm text-left border border-border">
        <thead className="bg-gray-300 text-gray-700 border border-border">
          <tr>
            {visibleIndexes.map((i) => (
              <th
                key={i}
                className="px-4 py-1 cursor-pointer select-none"
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
        <tbody className="border border-border">
          {tests.rows.map((row) => (
            <tr
              key={row.key}
              className={`
                border-t border-gray-200 dark:border-gray-700
                odd:bg-gray-50 dark:odd:bg-gray-800
                even:bg-white dark:even:bg-gray-900
                hover:bg-gray-100 dark:hover:bg-gray-700
                transition
              `}
            >
              {visibleIndexes.map((i) => (
                <td key={i} className="px-4 py-1 text-foreground">
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
