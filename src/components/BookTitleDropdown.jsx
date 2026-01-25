import { useContext, useState, useMemo, useEffect, useRef } from "react";
import { DataContext } from "../context/DataContext";

const BookTitleDropdown = ({ value, onChange }) => {
  const { books } = useContext(DataContext);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [tag, setTag] = useState("CSE");

  const dropdownRef = useRef(null);

  /* -----------------------------
     Click outside to close
  ------------------------------ */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* -----------------------------
     Normalize books once
  ------------------------------ */
  const booksArray = useMemo(() => {
    return books ? Object.values(books) : [];
  }, [books]);

  /* -----------------------------
     Extract unique tags
  ------------------------------ */
  const uniqueTags = useMemo(() => {
    const allTags = booksArray.flatMap((b) => {
      if (!b.tags) return [];
      if (typeof b.tags === "string") {
        return b.tags.split(",").map((t) => t.trim());
      }
      if (Array.isArray(b.tags)) return b.tags;
      return [];
    });

    return Array.from(new Set(allTags));
  }, [booksArray]);

  /* -----------------------------
     Filter books by tag
  ------------------------------ */
  const tagFilteredBooks = useMemo(() => {
    if (!tag) return booksArray;

    const lowerTag = tag.toLowerCase();

    return booksArray.filter((b) =>
      b.tags?.toString().toLowerCase().includes(lowerTag)
    );
  }, [booksArray, tag]);

  /* -----------------------------
     Filter by search (only when open)
  ------------------------------ */
  const filteredBooks = useMemo(() => {
    if (!open) return [];

    const q = search.toLowerCase();

    return tagFilteredBooks
      .filter((b) => b.bookTitle)
      .filter((b) => b.bookTitle.toLowerCase().includes(q));
  }, [open, search, tagFilteredBooks]);

  /* -----------------------------
     Select book
  ------------------------------ */
  const handleSelect = (bookTitle) => {
    onChange(bookTitle);
    setSearch("");
    setOpen(false);
  };

  if (!books) return null;

  return (
    <>
      {/* Tags */}
      <div
        className="relative w-full flex gap-2 mb-4 overflow-x-auto
        [color-scheme:light] dark:[color-scheme:dark]
        scrollbar-none md:scrollbar-auto"
      >
        {uniqueTags.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setTag(option)}
            className={`px-3 py-1 rounded whitespace-nowrap mb-2 ${
              tag === option
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-white"
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {/* Dropdown */}
      <div className="relative w-full" ref={dropdownRef}>
        <label className="block font-medium mb-1">Book Title</label>

        <input
          type="text"
          value={search || value}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search book..."
          className="w-full p-2 mt-1 border rounded-md bg-white text-black
          dark:bg-gray-800 dark:text-white focus:outline-none
          focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
        />

        {open && filteredBooks.length > 0 && (
          <ul className="absolute z-10 w-full max-h-60 overflow-y-auto mt-1 border rounded-md bg-white dark:bg-gray-800 shadow-lg">
            {filteredBooks.map((b) => (
              <li
                key={b.bookId}
                onClick={() => handleSelect(b.bookTitle)}
                className="px-2 py-1 cursor-pointer hover:bg-green-100 dark:hover:bg-green-700"
              >
                {b.bookTitle}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default BookTitleDropdown;
