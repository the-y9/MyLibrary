import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/' },
  { name: 'Sessions', path: '/sessions' },
  { name: 'Books', path: '/books' },
  { name: 'Tests', path: '/tests' },
  // { name: 'Analytics' } // No path means it's not a link
];

export default function Sidebar() {
  const location = useLocation(); // Get current path

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const isActive = item.path === location.pathname;
        return (
          <div
            key={item.name}
            className={`p-2 rounded-md cursor-pointer ${
              isActive
                ? "bg-blue-100 text-blue-700 font-semibold" // active page style
                : "text-gray-700 hover:bg-blue-50"
            }`}
          >
            {item.path ? <Link to={item.path}>{item.name}</Link> : item.name}
          </div>
        );
      })}
    </nav>
  );
}
