import { useContext, useEffect, useState, useMemo } from "react";
import { DataContext } from "../context/DataContext";
import { Menu } from "lucide-react";

import NavSidebar from "./NavSidebar";
import SideBar from "../components/SideBar";
import SearchAndFilters from "../components/SearchAndFilters";

import { formatMinutes, formatMin } from "../utils/times";

const BookSummary = () => {
  const { books, sessions } = useContext(DataContext);
  const [bookSummary, setBookSummary] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);

  // -------------------------------
  // 🧠 Compute Book Summary
  // -------------------------------
  useEffect(() => {
    if (!sessions || !books) return;

    const dataRows = sessions.slice(1); // skip header
    const bookMap = {};

    dataRows.forEach((row) => {
      const bookId = row[10]; // adjust column index if needed
      if (!bookId) return;

      if (!bookMap[bookId]) {
        bookMap[bookId] = {
          bookId,
          bookTitle: row[1],
          totalPagesRead: 0,
          totalTimeMinutes: 0,
          lastRead: null,
          chapters: new Set(),
        };
      }

      const book = bookMap[bookId];
      const pagesRead = Number(row[8] || 0);
      const timestamp = row[0];
      
      const getSessionMinutes = (value) => {
        // Google Sheets Date object
        if (value instanceof Date) {
          return value.getHours() * 60 + value.getMinutes();
        }
      
        // Google Sheets date string
        if (typeof value === 'string' && !isNaN(Date.parse(value))) {
          const date = new Date(value);
          return date.getHours() * 60 + date.getMinutes();
        }
      
        // Minutes (number or numeric string)
        const minutes = Number(value);
        return Number.isFinite(minutes) ? minutes : 0;
      };
      const sessionTime = getSessionMinutes(row[9]);
      
      const chapter = row[6];

      book.totalPagesRead += pagesRead;
      book.totalTimeMinutes += sessionTime ;
      if (chapter) book.chapters.add(chapter.trim());

// console.log(book.chapters);

      if (timestamp) {
        const ts = new Date(timestamp);
        if (!book.lastRead || ts > book.lastRead) book.lastRead = ts;
      }
    });

    const summary = Object.values(bookMap).map((book) => {
      const master = books[book.bookId];
      const totalPages = master ? master.totalPages : 0;
      const totalChps = master ? master.totalChps : 0;


      return {
        bookId: book.bookId,
        bookTitle: book.bookTitle,
        totalPages,
        totalChps,
        totalPagesRead: book.totalPagesRead,
        totalTimeMinutes: book.totalTimeMinutes,
        lastReadDate: book.lastRead ? book.lastRead.toLocaleDateString("default", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }) : "",
        percentCompleted: totalChps && totalChps > 0
                        ? Math.round((book.chapters.size / totalChps) * 100)
                        : totalPages && totalPages > 0
                          ? Math.round((book.totalPagesRead / totalPages) * 100)
                          : 0,

        chaptersCompleted: book.chapters.size,
        chapters: Array.from(book.chapters).sort(),
      };
    });

    setBookSummary(summary);
    setFilteredData(summary);
  }, [sessions, books]);

  // -------------------------------
  // 📊 Compute Totals (memoized)
  // -------------------------------
  const totals = useMemo(() => {
    if (!bookSummary?.length)
      return { totalPages: 0, totalSessions: 0, totalBooks: 0, totalTime: 0 };

    const acc = bookSummary.reduce(
      (acc, curr) => {
        acc.totalPages += curr.totalPagesRead || 0;
        acc.totalTime += curr.totalTimeMinutes || 0;
        return acc;
      },
      { totalPages: 0, totalSessions: 0, totalBooks: 0, totalTime: 0 }
    );

    acc.totalBooks = bookSummary.length;
    return acc;
  }, [bookSummary]);

  // -------------------------------
  // 🖼️ Render
  // -------------------------------
  return (
    <div className="flex min-h-screen bg-background">
      <SideBar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navComponent={NavSidebar}
      />

      <main className="flex-1 p-4 sm:p-6 space-y-6 w-full">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Book Status</h1>
            <p className="text-gray-500 text-sm">
              Overview library and reading progress.
            </p>
          </div>
          <button
            className="md:hidden p-2 rounded-lg border text-gray-700 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            {totals && (
              <div className="p-4 bg-card rounded-lg shadow">
                <p>
                  <strong>Total Pages Read:</strong> {totals.totalPages}
                </p>
                <p>
                  <strong>Books Read:</strong> {totals.totalBooks}
                </p>
                <p>
                  <strong>Total Reading Time:</strong> {formatMinutes(totals.totalTime)}
                </p>

              </div>
            )}
          </div>

          <div className="flex-1">
            <SearchAndFilters data={bookSummary} onFilter={setFilteredData} />
          </div>
        </div>

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
              {filteredData?.slice() // avoid mutating original array
                .sort(
                  (a, b) =>
                    new Date(b.lastReadDate) - new Date(a.lastReadDate)
                ).map((book) => (
                  <tr key={book.bookId}
                    onClick={() =>
                      setSelectedBookId(
                        selectedBookId === book.bookId ? null : book.bookId
                      )}
                  className={`
                    cursor-pointer
                    border-t border-gray-200 dark:border-gray-700
                    odd:bg-gray-50 dark:odd:bg-gray-800
                    even:bg-white dark:even:bg-gray-900
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    transition
                  `}>
                    <td className="px-4 py-1 text-foreground">{book.bookTitle}</td>
                    <td className="px-4 py-1 text-foreground">{book.percentCompleted}%</td>
                  <td className="px-4 py-1 text-foreground">{book.chaptersCompleted} / {book.totalChps ? book.totalChps : "-"}</td>
                  <td className="px-4 py-1 text-foreground">{book.lastReadDate}</td>
                  <td className="px-4 py-1 text-foreground">{formatMin(book.totalTimeMinutes)}</td>
                  {/* <td>{book.bookId}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default BookSummary;
