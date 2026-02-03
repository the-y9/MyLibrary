import { useContext, useMemo } from "react";
import { TestDataContext } from "../context/TestDataContext";
import {fNum, pNum} from "../utils/misc"


function TestTable({ visibleHeaders = [] }) {
  
  const { tests } = useContext(TestDataContext);
console.log(tests);

  const FNUM_COLS = useMemo(() => new Set([2, 5, 6, 7, 9]), []);
  const PNUM_COLS = useMemo(() => new Set([11,12]), []);
  

  const formatCell = (value, index) => {
  if (value instanceof Date) return value.toLocaleDateString();
  if (FNUM_COLS.has(index)) return fNum(value);
  if (PNUM_COLS.has(index)) return pNum(value).display;
  return value;
};
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
                  {formatCell(row.data[i], i)}
                  {/* if (i==9) fnum(row.data[i])} */}
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
