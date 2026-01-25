import { useContext, useMemo, useState } from "react";
import { DataContext } from "../context/DataContext";
import { Menu } from "lucide-react";

import NavSidebar from "./NavSidebar";
import SideBar from "../components/SideBar";
import SearchAndFilters from "../components/SearchAndFilters";
import { formatMinutes, formatMin } from "../utils/times";
import { useBookSummary } from "../hooks/useBookSummary";

const BookSummary = () => {
  const { books, sessions } = useContext(DataContext);
  const { summary, totals } = useBookSummary(sessions, books);

  const [filteredData, setFilteredData] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);

  // 🔥 Memoized sorting (no Date parsing)
  const sortedData = useMemo(() => {
    const data = filteredData.length ? filteredData : summary;
    return [...data].sort((a, b) => b.lastReadTs - a.lastReadTs);
  }, [filteredData, summary]);

  return (
    <div className="flex min-h-screen bg-background">
      <SideBar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navComponent={NavSidebar}
      />

      <main className="flex-1 p-4 sm:p-6 space-y-6 w-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Book Status</h1>
            <p className="text-gray-500 text-sm">
              Overview library and reading progress.
            </p>
          </div>
          <button
            className="md:hidden p-2 rounded-lg border"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Totals + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 p-4 bg-card rounded-lg shadow">
            {totals && (
              <>
                <p><strong>Total Pages Read:</strong> {totals.totalPages}</p>
                <p><strong>Books Read:</strong> {totals.totalBooks}</p>
                <p>
                  <strong>Total Reading Time:</strong>{" "}
                  {formatMinutes(totals.totalTime)}
                </p>
              </>
            )}
          </div>

          <div className="flex-1">
            <SearchAndFilters data={summary} onFilter={setFilteredData} />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-border text-center">
            <thead className="bg-gray-300 text-gray-700 border border-border">
              <tr >
                <th className="px-4 py-1 cursor-pointer select-none">Book Title</th>
                <th className="px-4 py-1 cursor-pointer select-none">% Completed</th>
                <th className="px-4 py-1 cursor-pointer select-none">Chapters Completed</th>
                <th className="px-4 py-1 cursor-pointer select-none">Last Read Date</th>
                <th  className="px-4 py-1 cursor-pointer select-none">Total Time (min)</th>
                {/* <th>Book ID</th> */}
              </tr>
            </thead>
            <tbody className="border border-border">
              {sortedData.map((book) => {
                const isOpen = selectedBookId === book.bookId;

                return (
                  <>
                    {/* Main row */}
                    <tr
                      key={book.bookId}
                      onClick={() =>
                        setSelectedBookId(isOpen ? null : book.bookId)
                      }
                      className={`
                        cursor-pointer
                        border-t border-gray-200 dark:border-gray-700
                        odd:bg-gray-50 dark:odd:bg-gray-800
                        even:bg-white dark:even:bg-gray-900
                        hover:bg-gray-100 dark:hover:bg-gray-700
                        transition
                      `}
                    >
                      <td className="px-4 py-1 text-foreground">
                        <span>{book.bookTitle}</span>
                        <span className="text-xs ms-2">
                          {isOpen ? "▾" : "▸"}
                        </span>
                      </td>

                      <td className="px-4 py-1 text-foreground">
                        {book.percentCompleted}%
                      </td>
                      <td className="px-4 py-1 text-foreground">
                        {book.chaptersCompleted} / {book.totalChps || "-"}
                      </td>
                      <td className="px-4 py-1 text-foreground">
                        {book.lastReadDate}
                      </td>
                      <td className="px-4 py-1 text-foreground">
                        {formatMin(book.totalTimeMinutes)}
                      </td>
                    </tr>

                    {/* Expanded chapters row */}
                    {isOpen && (
                      <tr className="bg-gray-100 dark:bg-gray-800">
                        <td colSpan={5} className="px-6 py-3 text-left">
                          <div className="flex flex-wrap gap-2">
                            {book.chapters.length ? (
                              book.chapters.map((ch) => (
                                <span
                                  key={ch}
                                  className="px-2 py-1 text-xs rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                >
                                  {ch}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">
                                No chapters recorded
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>

          </table>
        </div>
      </main>
    </div>
  );
};

export default BookSummary;
