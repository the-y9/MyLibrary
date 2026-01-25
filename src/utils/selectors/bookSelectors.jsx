import { getSessionMinutes } from "../times";

export const buildBookMap = (sessions) => {
  const map = new Map();
  const dataRows = sessions.slice(1);

  for (const row of dataRows) {
    const bookId = row[10];
    if (!bookId) continue;

    if (!map.has(bookId)) {
      map.set(bookId, {
        bookId,
        bookTitle: row[1],
        totalPagesRead: 0,
        totalTimeMinutes: 0,
        lastRead: null,
        chapters: new Set(),
      });
    }

    const book = map.get(bookId);

    book.totalPagesRead += Number(row[8] || 0);
    book.totalTimeMinutes += getSessionMinutes(row[9]);

    if (row[6]) book.chapters.add(row[6].trim());

    if (row[0]) {
      const ts = new Date(row[0]);
      if (!book.lastRead || ts > book.lastRead) {
        book.lastRead = ts;
      }
    }
  }

  return map;
};

export const buildBookSummary = (bookMap, books) => {
  return Array.from(bookMap.values()).map((book) => {
    const master = books?.[book.bookId];
    const totalPages = master?.totalPages ?? 0;
    const totalChps = master?.totalChps ?? 0;

    const chapters = [...book.chapters].sort();
    const percentCompleted =
      totalChps > 0
        ? Math.round((chapters.length / totalChps) * 100)
        : totalPages > 0
        ? Math.round((book.totalPagesRead / totalPages) * 100)
        : 0;

    return {
      ...book,
      totalPages,
      totalChps,
      chapters,
      chaptersCompleted: chapters.length,
      percentCompleted,
      lastReadTs: book.lastRead?.getTime() ?? 0, // 🔥 key optimization
      lastReadDate: book.lastRead
        ? book.lastRead.toLocaleDateString("default", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "",
    };
  });
};

export const computeTotals = (summary) =>
  summary.reduce(
    (acc, b) => {
      acc.totalPages += b.totalPagesRead || 0;
      acc.totalTime += b.totalTimeMinutes || 0;
      return acc;
    },
    { totalPages: 0, totalBooks: summary.length, totalTime: 0 }
  );

  export const findChapterName = (chapters, chNo) => {
    if (!chNo || !chapters?.length) return "";
  
    const match = chapters.find((ch) => {
      const [num] = ch.split("-").map(s => s.trim());
      return num === String(chNo);
    });
  
    if (!match) return "";
  
    const [, name] = match.split("-");
    return name?.trim() || "";
  };
  