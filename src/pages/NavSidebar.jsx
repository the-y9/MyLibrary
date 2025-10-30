import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/' },
  { name: 'Sessions', path: '/sessions' },
  { name: 'Books', path: '/books' },
  { name: 'Analytics' } // No path means it's not a link
];

export default function Sidebar() {
  const location = useLocation(); // Get current path

  return (
    <nav className="space-y-2">
      {navItems
        .filter((item) => item.path !== location.pathname) // Exclude current page
        .map((item) => (
          <div
            key={item.name}
            className="text-gray-700 hover:bg-green-50 p-2 rounded-md cursor-pointer"
          >
            {item.path ? <Link to={item.path}>{item.name}</Link> : item.name}
          </div>
        ))}
    </nav>
  );
}
