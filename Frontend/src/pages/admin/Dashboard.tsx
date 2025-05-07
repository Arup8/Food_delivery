import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { FaClipboardList, FaHamburger, FaUsers } from 'react-icons/fa';
import OrdersSection from './OrderSection';
import MenuSection from './MenuSection';
import UsersSection from './UsersSection';

const AdminDashboard: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { to: '/admin/orders', icon: <FaClipboardList />, label: 'Orders' },
    { to: '/admin/menu', icon: <FaHamburger />, label: 'Food' },
    { to: '/admin/users', icon: <FaUsers />, label: 'Users' },
  ];

  return (
    <div className="flex h-screen overflow-hidden m-0 p-0">
      {/* Left Sidebar */}
      <div className="hidden md:flex flex-col w-20 bg-gray-800 text-white shadow-md items-center space-y-8 py-4 m-0 p-0">
        <div className="flex justify-center mb-6 m-0 p-0">
          <img
            src="logo.jpg" // Add your logo here
            alt="Logo"
            className="h-12 w-12 object-contain"
          />
        </div>
        <nav className="flex flex-col space-y-8 m-0 p-0">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center justify-center text-gray-300 hover:text-white text-lg m-0 p-0`}
            >
              {item.icon}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col m-0 p-0">
      

        {/* Admin Dashboard Heading (below Navbar) */}
        <div className=" text-center text-2xl font-semibold text-gray-900 m-0 p-0">
          Admin Dashboard
        </div>

        {/* Main Content */}
        <main className="flex-1 mt-4 mb-[56px] overflow-y-auto px-0 py-0">
          <Routes>
            <Route path="orders" element={<OrdersSection />} />
            <Route path="menu" element={<MenuSection />} />
            <Route path="users" element={<UsersSection />} />
            <Route path="/" element={<div className="text-center text-gray-500 mt-4">Select a section to manage</div>} />
          </Routes>
        </main>
      </div>

      {/* Bottom Horizontal Nav (Mobile) */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-800 text-white flex justify-around items-center h-14 border-t border-gray-700 m-0 p-0">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center text-xs ${
              location.pathname === item.to ? 'text-white font-bold' : 'text-gray-400'
            } m-0 p-0`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </footer>
    </div>
  );
};

export default AdminDashboard;
