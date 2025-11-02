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
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            {visibleIndexes.map((i) => (
              <th key={i} className="border px-2 py-1 text-left">
                {tests.headers[i]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tests.rows.map((row) => (
            <tr key={row.key}>
              {visibleIndexes.map((i) => (
                <td key={i} className="border px-2 py-1">
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
