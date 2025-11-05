import { useContext, useEffect, useState } from "react";
import { DataContext } from "../context/DataContext";
import { Menu } from 'lucide-react';

import NavSidebar from "./NavSidebar";
import SideBar from '../components/SideBar';
import SearchAndFilters from '../components/SearchAndFilters';

// Helper: convert Google Sheets duration string to seconds
const durationStrToSeconds = (dateStr) => {
  if (!dateStr) return 0;
  const match = dateStr.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
  if (!match) return 0;
  const [, , , , hours, minutes, seconds] = match.map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

const BookSummary = () => {
  const { books, sessions } = useContext(DataContext); // get data from context
  const [bookSummary, setBookSummary] = useState();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filteredData, setFilteredData] = useState();

  useEffect(() => {
    if (!sessions || !books) return; // wait for data to be loaded

    const data = computeBookSummary();
    setBookSummary(data);
    setFilteredData(data);

  }, [sessions, books]);

  const computeBookSummary = () => {
    const bookMap = {};

    // sessions is [headerRow, ...dataRows] if you used your DataContext
    const dataRows = sessions.slice(1); // skip header row

    dataRows.forEach((row) => {
      const bookId = row[10]; // assuming 10th column is bookId
      if (!bookId) return;

      if (!bookMap[bookId]) {
        bookMap[bookId] = {
          bookId,
          bookTitle: row[1],
          totalPagesRead: 0,
          lastRead: null,
          totalTimeMinutes: 0,
          chapters: new Set(),
        };
      }

      const book = bookMap[bookId];

      const pagesRead = Number(row[8] || 0);
      const chapter = row[6];
      const timestamp = row[0];
      const sessionTime = durationStrToSeconds(row[9]);

      book.totalPagesRead += pagesRead;
      book.totalTimeMinutes += sessionTime / 60;

      if (timestamp) {
        const ts = new Date(timestamp);
        if (!book.lastRead || ts > book.lastRead) book.lastRead = ts;
      }

      if (chapter) book.chapters.add(chapter);
    });

    return Object.values(bookMap).map((book) => {
      const master = books[book.bookId];
      const totalPages = master ? master.totalPages : 0;

      return {
        bookId: book.bookId,
        bookTitle: book.bookTitle,
        totalPages,
        totalPagesRead: book.totalPagesRead,
        lastReadDate: book.lastRead ? book.lastRead.toLocaleDateString() : "",
        totalTimeMinutes: Math.round(book.totalTimeMinutes),
        percentCompleted: totalPages
          ? Math.round((book.totalPagesRead / totalPages) * 100)
          : 0,
        chaptersCompleted: book.chapters.size,
      };
    });
  };

  return (
      <div className="flex min-h-screen bg-gray-50">
        <SideBar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                title="Library"
                navComponent={NavSidebar}
                footerContent="👤 Profile Settings"
                width="w-72"
                bgColor="bg-gray-50"
                borderColor="border-gray-200"
                textColor="text-blue-700"
                footerTextColor="text-gray-600"
      />
      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 space-y-6 w-full">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Book Status</h1>
            <p className="text-gray-500 text-sm">Overview library and reading progress.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="md:hidden p-2 rounded-lg border text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            {/* <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              <Link to="https://forms.gle/AUyCFVASWgtFVJg69" target="blank"> + New Session</Link>
            </button> */}
          </div>
        </div>

    <div>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
                {bookSummary && (
                  <div className="p-4 bg-white rounded-lg shadow">
                    <p><strong>Total Pages Read:</strong> {bookSummary.totalPages}</p>
                    <p><strong>Total Sessions:</strong> {bookSummary.totalSessions}</p>
                    <p><strong>Books Read:</strong> {bookSummary.totalBooks}</p>
                    <p><strong>Total Reading Time:</strong> {bookSummary.totalTime}</p>
                  </div>
              )}
            </div>
            <div className="flex-1">
                <SearchAndFilters data={bookSummary} onFilter={setFilteredData} />
            </div>
          </div>
          <div className="table-container overflow-x-auto bg-white rounded-lg shadow">

      <table>
        <thead>
          <tr>
            <th>Book ID</th>
            <th>Book Title</th>
            <th>Total Pages</th>
            <th>Total Pages Read</th>
            <th>Last Read Date</th>
            <th>Total Time (min)</th>
            <th>% Completed</th>
            <th>Chapters Completed</th>
          </tr>
        </thead>
        <tbody>
                {filteredData &&
          filteredData.map((book) => (
            <tr key={book.bookId}>
              <td>{book.bookId}</td>
              <td>{book.bookTitle}</td>
              <td>{book.totalPages}</td>
              <td>{book.totalPagesRead}</td>
              <td>{book.lastReadDate}</td>
              <td>{book.totalTimeMinutes}</td>
              <td>{book.percentCompleted}%</td>
              <td>{book.chaptersCompleted}</td>
            </tr>
          ))}
        </tbody>
            </table>
            </div>
        </div>
        </main >
    </div>
  );
};

export default BookSummary;
