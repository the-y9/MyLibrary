import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Menu, X } from 'lucide-react';
import { Link } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import NavSidebar from "./NavSidebar";
import SideBar from '../components/SideBar';

const data = [
  { month: 'Jan', sales: 32000 },
  { month: 'Feb', sales: 29000 },
  { month: 'Mar', sales: 34000 },
  { month: 'Apr', sales: 45000 },
  { month: 'May', sales: 37000 },
  { month: 'Jun', sales: 46000 },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
     <SideBar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        title="Library"
        navComponent={NavSidebar}
        footerContent="👤 Profile Settings"
        width="w-72"
        bgColor="bg-gray-50"
        borderColor="border-gray-200"
        textColor="text-blue-700"
        footerTextColor="text-gray-600"
      />

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 space-y-6 w-full">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Dashboard</h2>
            <p className="text-gray-500 text-sm">Welcome back! Here's your business overview</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="md:hidden p-2 rounded-lg border text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              <Link to="https://forms.gle/AUyCFVASWgtFVJg69" target="blank"> + New Session</Link>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Total Sales</p>
            <h3 className="text-2xl font-bold">₹45,230</h3>
            <p className="text-green-500 text-sm">+12.5%</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Total Profit</p>
            <h3 className="text-2xl font-bold">₹12,450</h3>
            <p className="text-green-500 text-sm">+8.3%</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Orders</p>
            <h3 className="text-2xl font-bold">42</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Active Customers</p>
            <h3 className="text-2xl font-bold">156</h3>
          </div>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-800 p-3 rounded-md">
            ⚠️ <span>Low Stock Alert: 5 products are running low on stock.</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-300 text-blue-800 p-3 rounded-md">
            ⏰ <span>3 memberships expire in 3 days. Send payment reminders.</span>
          </div>
        </div>

        {/* Graph & Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Monthly Sales Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {[
                { id: '#1001', name: 'Priya Sharma', date: 'Oct 10, 2025', amount: '₹4500', status: 'Completed' },
                { id: '#1002', name: 'Rajesh Kumar', date: 'Oct 12, 2025', amount: '₹3200', status: 'Pending' },
                { id: '#1003', name: 'Anita Desai', date: 'Oct 13, 2025', amount: '₹5800', status: 'Completed' },
              ].map((order) => (
                <div
                  key={order.id}
                  className="flex justify-between items-center border p-3 rounded-lg"
                >
                  <div>
                    <p className="font-medium">Order {order.id}</p>
                    <p className="text-sm text-gray-500">
                      {order.name} · {order.date}
                    </p>
                    <p className="font-semibold">{order.amount}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      order.status === 'Completed'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-yellow-100 text-yellow-600'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
