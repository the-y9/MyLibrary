import { useContext, useEffect, useState, useMemo } from "react";
import { DataContext } from "../context/DataContext";
import { Menu } from "lucide-react";

import NavSidebar from "./NavSidebar";
import SideBar from "../components/SideBar";
import SearchAndFilters from "../components/SearchAndFilters";

import { durationStrToSeconds, formatMinutes } from "../utils/times";

const BookSummary = () => {
  const { books, sessions } = useContext(DataContext);
  const [bookSummary, setBookSummary] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      const sessionTime = durationStrToSeconds(row[9]);
      const chapter = row[6];

      book.totalPagesRead += pagesRead;
      book.totalTimeMinutes += sessionTime / 60;
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
        totalTimeMinutes: Math.round(book.totalTimeMinutes),
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

        <div className="table-container overflow-x-auto bg-card rounded-lg shadow">
          <table className="text-center">
            <thead>
              <tr>
                <th>Book ID</th>
                <th>Book Title</th>
                <th>Total Chapters</th>
                <th>Chapters Completed</th>
                <th>Last Read Date</th>
                <th>Total Time (min)</th>
                <th>% Completed</th>
              </tr>
            </thead>
            <tbody>
              {filteredData?.slice() // avoid mutating original array
                .sort(
                  (a, b) =>
                    new Date(b.lastReadDate) - new Date(a.lastReadDate)
                ).map((book) => (
                <tr key={book.bookId}>
                  <td>{book.bookId}</td>
                  <td>{book.bookTitle}</td>
                  <td>{book.totalChps ? book.totalChps : "-"}</td>
                  <td>{book.chaptersCompleted}</td>
                  <td>{book.lastReadDate}</td>
                  <td>{formatMinutes(book.totalTimeMinutes)}</td>
                  <td>{book.percentCompleted}%</td>
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
