// src/utils/dataWorker.js
/* eslint-disable no-restricted-globals */
import { formatMin } from "./times";

const DATE_FORM = "default";

const changeForm = (final, initial) => {
  if (!initial || initial === 0) return "";
  const change = (((final - initial) / initial) * 100).toFixed(2);
  return change > 0 ? `+${change}%` : `${change}%`;
};

const getDateKey = (date, interval) => {
  switch (interval) {
    case "daily":
      return date.toLocaleDateString(DATE_FORM, { month: "short", day: "numeric", year: "numeric" });
    case "weekly": {
      const d = new Date(date);
      d.setDate(d.getDate() - d.getDay() + 1);
      return d.toLocaleDateString(DATE_FORM, { month: "short", day: "numeric", year: "numeric" });
    }
    case "monthly":
      return date.toLocaleDateString(DATE_FORM, { month: "short", year: "numeric" });
    case "yearly":
      return String(date.getFullYear());
    default:
      return date.toLocaleDateString();
  }
};

self.onmessage = (e) => {
  const { sessions, interval } = e.data;

  if (!sessions || sessions.length < 2) {
    self.postMessage({ chartData: [], pieData: [], statsData: [], recentData: [] });
    return;
  }

  // 1. Process Raw Data
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

  // 2. Aggregate
  const grouped = {};
  processedData.forEach((item) => {
    const key = getDateKey(new Date(item.timestamp), interval);
    if (!grouped[key]) {
      grouped[key] = { 
        pages: 0, time: 0, speedSum: 0, count: 0, 
        books: {}, uniqueBooks: new Set(), uniqueChps: new Set(), completedChps: new Set() 
      };
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

  // 3. Fill Gaps
  const sortedKeys = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
  const filledResult = [];
  let d = new Date(sortedKeys[0]);
  const endDate = new Date();

  while (d <= endDate) {
    const key = getDateKey(d, interval);
    const g = grouped[key];
    filledResult.push({
      timestamp: key,
      pages: g?.pages || 0,
      time: g?.time || 0,
      bookCount: g?.uniqueBooks.size || 0,
      chpCount: g?.uniqueChps.size || 0,
      Chapters_Completed: g?.completedChps.size || 0,
      speed: g?.count ? +(g.speedSum / g.count).toFixed(2) : 0,
      _books: g?.books || {}
    });
 
    if (interval === "daily") d.setDate(d.getDate() + 1);
    else if (interval === "weekly") d.setDate(d.getDate() + 7);
    else if (interval === "monthly") d.setMonth(d.getMonth() + 1);
    else d.setFullYear(d.getFullYear() + 1);
  }

  const chartData = filledResult.slice(-10);

  // 4. Stats Calculation
  const last = chartData[chartData.length - 1];
  const secondLast = chartData[chartData.length - 2] || null;
  const totalPages = chartData.reduce((sum, i) => sum + i.pages, 0);
  const totalTime = chartData.reduce((sum, i) => sum + i.time, 0);
  const avgSpeedTotal = totalTime > 0 ? totalPages / totalTime : 0;

  const statsData = [
    { label: "Total Pages Read", value: last.pages, change: changeForm(last.pages, secondLast?.pages) },
    { 
        label: "Total Time", 
        value: formatMin(last.time), 
        change: changeForm(last.time, secondLast?.time) 
    },
    { label: "Books Visited", value: last.bookCount, change: changeForm(last.bookCount, secondLast?.bookCount) },
    { label: "Chapters Visited", value: last.chpCount, change: changeForm(last.chpCount, secondLast?.chpCount) },
    { label: "Chapters Completed", value: last.Chapters_Completed, change: changeForm(last.Chapters_Completed, secondLast?.Chapters_Completed) },
    { label: "Average Speed", value: last.speed, change: changeForm(last.speed, secondLast?.speed), avgSpeed: avgSpeedTotal },
  ];

  // 5. Pie & Recent
  const pieData = Object.entries(last._books).map(([label, value]) => ({ label, value }));
  const recentData = [...processedData]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3)
    .map(item => ({
      id: item.timestamp,
      label: item.chapter || "Chapter",
      subtitle: `${item.book} · ${new Date(item.timestamp).toLocaleDateString()}`,
      value: `${item.pages} pages · ${formatMin(item.time)} min`,
      status: item.status || "Pending",
    }));

  self.postMessage({ chartData, pieData, statsData, recentData });
};