// src/utils/dataWorker.js

// We move the logic out of the component and into this worker
self.onmessage = (e) => {
  const { sessions, interval, dateForm } = e.data;

  if (!sessions || sessions.length < 2) {
    self.postMessage({ chartData: [], pieData: [], processedData: [] });
    return;
  }

  // --- 1. Process Raw Data ---
  const processedData = sessions.slice(1).map((row) => {
    const stime = Number(row[9]) || 0;
    const pagesRead = Number(row[8]) || 0;
    return {
      timestamp: row[0],
      book: row[1],
      pages: pagesRead,
      time: stime,
      speed: stime > 0 ? +(pagesRead / stime).toFixed(2) : 0,
      id: row[10],
      chapter: row[6],
      status: row[7]?.trim().toLowerCase() || "",
    };
  });

  // --- 2. Aggregate & Fill Gaps ---
  const grouped = {};
  processedData.forEach((item) => {
    // Helper logic here (must be inside worker)
    const date = new Date(item.timestamp);
    let key;
    if (interval === "daily") key = date.toLocaleDateString(dateForm, { month: "short", day: "numeric", year: "numeric" });
    else if (interval === "weekly") {
      const d = new Date(date); d.setDate(d.getDate() - d.getDay() + 1);
      key = d.toLocaleDateString(dateForm, { month: "short", day: "numeric", year: "numeric" });
    } else if (interval === "monthly") key = date.toLocaleDateString(dateForm, { month: "short", year: "numeric" });
    else key = String(date.getFullYear());

    if (!grouped[key]) {
      grouped[key] = { pages: 0, time: 0, speedSum: 0, count: 0, books: {}, uniqueBooks: new Set(), uniqueChps: new Set(), completedChps: new Set() };
    }
    const g = grouped[key];
    g.pages += item.pages;
    g.time += item.time;
    g.speedSum += item.speed;
    g.count += 1;
    g.uniqueBooks.add(item.book);
    g.uniqueChps.add(item.chapter);
    if (item.status === 'completed') g.completedChps.add(item.chapter);
    g.books[item.book] = (g.books[item.book] || 0) + item.pages;
  });

  // ... (Add the gap-filling loop logic we wrote earlier here) ...

  // Send the final result back to the main thread
  self.postMessage({ 
    chartData: result.slice(-10), 
    pieData: Object.entries(lastBooks).map(([label, value]) => ({ label, value })),
    processedData 
  });
};