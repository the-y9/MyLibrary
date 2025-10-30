// src/BookSummary.js
import React, { useEffect, useState } from "react";
import axios from "axios";

// Helper: convert Google Sheets duration string to seconds
const durationStrToSeconds = (dateStr) => {
  if (!dateStr) return 0;
  const match = dateStr.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
  if (!match) return 0;
  const [, , , , hours, minutes, seconds] = match.map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

// Replace with your actual Google Sheet ID
const SHEET_ID = "1HzHupzGxFMqQjtz0ZsVEHZgD87MiEk-VJcg0OrIfUio";

// Replace with actual GIDs of sheets
const SESSIONS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
const BOOKS_MASTER_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=0`;

const BookSummary = () => {
  const [bookSummary, setBookSummary] = useState([]);

  useEffect(() => {
    const fetchBooksMaster = async () => {
        const res = await axios.get(BOOKS_MASTER_URL);
        const jsonString = res.data.substring(47).slice(0, -2);
        const parsed = JSON.parse(jsonString);
        
        const data = parsed.table.rows.map((r) => {
          const cells = r.c.map((c) => (c ? c.v : ""));
          return {
            bookId: cells[0],                // column 'id'
            bookTitle: cells[1],             // column 'Title'
            totalPages: Number(cells[8] || 0), // column 'Total Pages'
          };
        });
      
        const bookLookup = {};
        data.forEach((b) => (bookLookup[b.bookId] = b));
        return bookLookup;
      };
      

    const fetchSessionsAndCompute = async () => {
      try {
        const booksMaster = await fetchBooksMaster();

        const res = await axios.get(SESSIONS_URL);
        const jsonString = res.data.substring(47).slice(0, -2);
        const parsed = JSON.parse(jsonString);
        const data = parsed.table.rows.map((r) =>
          r.c.map((c) => (c ? c.v : ""))
        );

        setBookSummary(computeBookSummary(data, booksMaster));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchSessionsAndCompute();
  }, []);

  const computeBookSummary = (data, booksMaster) => {
    const bookMap = {};

    data.forEach((row) => {
      const bookId = row[10];
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

    // Combine with books_master
    return Object.values(bookMap).map((book) => {
      const master = booksMaster[book.bookId];
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
    <div>
      <h1>📚 Book Summary</h1>
      <table border="1" cellPadding="5">
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
          {bookSummary.map((book) => (
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
  );
};

export default BookSummary;
