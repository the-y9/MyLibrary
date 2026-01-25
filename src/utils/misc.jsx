// Helper to convert daily target to other intervals
export const make_targets = (
    daily_target,
    interval,
    referenceDate = new Date()
) => {
    const target = Number(daily_target);
    if (Number.isNaN(target)) {
        throw new Error('daily_target must be a number');
    }

    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth(); // 0-based

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInYear =
        (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
            ? 366
            : 365;

    switch (interval) {
        case 'weekly':
            return target * 7;
        case 'monthly':
            return target * daysInMonth;
        case 'yearly':
            return target * daysInYear;
        default:
            return target; // daily
    }
};

// Helper to calculate percentage or absolute change
export function changeForm(current, previous) {
  if (previous === 0) return ""; // avoid divide by zero
  const diff = current - previous;
  const sign = diff > 0 ? "+" : diff < 0 ? "-" : "";
  const percent = previous !== 0 ? Math.abs((diff / previous) * 100).toFixed(1) + "%" : "";
  return `${sign}${percent}`;
}

//formats number whole numbe decimal tot 2
export const fNum = (v) =>
    Number.isInteger(+v) ? +v : (+v).toFixed(2);

// extracts unique chapters
export const getChaptersVisited = (rows) => {
    const chapters = new Set();
  
    rows.forEach((row) => {
      const chapter = row[6]; // chapter column index
      if (chapter) {
        chapters.add(chapter.trim());
      }
    });
  
    return Array.from(chapters).sort();
  };
  
//   compute chapters per book
export  const getBookChapters = (sessions, bookId) => {
    const dataRows = sessions.slice(1);
  
    return getChaptersVisited(
      dataRows.filter(row => row[10] === bookId)
    );
  };
  