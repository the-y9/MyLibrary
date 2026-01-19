import { useContext, useState } from "react";
import { DataContext } from "../context/DataContext";
import { useEffect, useRef } from "react";

const BookTitleDropdown = ({ value, onChange }) => {
  const { books } = useContext(DataContext); // get books from context
  const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [tag, setTag] = useState("CSE");
    const dropdownRef = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
          if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setOpen(false);
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
  if (!books) return null; // or loading spinner

    const allTags = Object.values(books)
        .flatMap((b) => {
            if (!b.tags) return [];
            // If tags is a string with comma-separated tags
            if (typeof b.tags === "string") return b.tags.split(",").map(t => t.trim());
            // If tags is already an array
            if (Array.isArray(b.tags)) return b.tags;
            return [];
        });

    // Remove duplicates
    const uniqueTags = Array.from(new Set(allTags));
    
    // tag "CSE"
    const fbooksArray = Object.values(books).filter((b) =>
      b.tags?.toString().toLowerCase().includes(tag.toLowerCase())
    );


  // Filter based on search
  const filtered = fbooksArray
  .filter(b => b.bookTitle) // ignore empty titles
  .filter((b) =>
    b.bookTitle.toLowerCase().includes(search.toLowerCase())
  );


  const handleSelect = (bookTitle) => {
    onChange(bookTitle);
    setSearch("");
    setOpen(false);
  };

    return (<>
        <div className="relative w-full flex gap-2 mb-4 overflow-x-auto
  [color-scheme:light] dark:[color-scheme:dark]
  scrollbar-none md:scrollbar-auto">
            {uniqueTags.map((option) => (
                <button
                type="button"
                key={option}
                    onClick={() => { setTag(option);}}
                className={`px-3 py-1 rounded whitespace-nowrap mb-2 ${
                    tag === option
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-900 "
                }`}
                >
                {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
            ))}
        </div>

        <div className="relative w-full" ref={dropdownRef}>
        <label className="block font-medium mb-1">Book Title</label>
        <input
            type="text"
            value={search || value}
            onChange={(e) => {
            setSearch(e.target.value);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search book..."
            className="w-full p-2 mt-1 border rounded-md bg-white text-black dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
        />

        {open && filtered.length > 0 && (
            <ul className="absolute z-10 w-full max-h-60 overflow-y-auto mt-1 border rounded-md bg-white dark:bg-gray-800 shadow-lg">
            {filtered.map((b) => (
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

  </>);
};

export default BookTitleDropdown;
