import { Link, useLocation } from "react-router-dom";

const navItems = [
  { name: "Dashboard", path: "/" },
  { name: "Sessions", path: "/sessions" },
  { name: "Books", path: "/books" },
  { name: "Tests", path: "/tests" },
  { name: "Syllabus", path: "/syllabus" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = item.path === location.pathname;

        return (
          <Link
            key={item.name}
            to={item.path}
            className={`block px-3 py-2 rounded-md transition-colors duration-200
              ${
                isActive
                  ? "bg-accent text-accent-foreground font-medium border border-border"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
