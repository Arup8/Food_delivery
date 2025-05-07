import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  LogOut,
  Menu as MenuIcon,
  X,
  Utensils,
  ClipboardList,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/login');
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const commonLinkClasses =
    'flex items-center gap-2 px-3 py-2 rounded hover:bg-orange-100 active:bg-orange-200 transition';

  const menuItems = (
    <>
      <Link to="/menu" onClick={closeMenu} className={commonLinkClasses}>
        <Utensils className="w-5 h-5" /> Menu
      </Link>
      {user && (
        <>
          <Link to="/cart" onClick={closeMenu} className={commonLinkClasses}>
            <ShoppingCart className="w-5 h-5" /> Cart
          </Link>
          <Link to="/orders" onClick={closeMenu} className={commonLinkClasses}>
            <ClipboardList className="w-5 h-5" /> Orders
          </Link>
          {user.role === 'ADMIN' && (
            <Link to="/admin" onClick={closeMenu} className={commonLinkClasses}>
              Admin
            </Link>
          )}
          <Link to="/profile" onClick={closeMenu} className={commonLinkClasses}>
            <User className="w-5 h-5" /> {user.username}
          </Link>
          <button onClick={handleLogout} className={commonLinkClasses}>
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </>
      )}
      {!user && (
        <Link
          to="/login"
          onClick={closeMenu}
          className="bg-orange-600 text-white px-4 py-2 mt-2 rounded hover:bg-orange-700 active:bg-orange-800 transition block"
        >
          Login
        </Link>
      )}
    </>
  );

  return (
    <nav className="bg-white shadow-md relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-orange-600">
            OrdEat
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 text-gray-700">
            {menuItems}
          </div>

          {/* Mobile Hamburger Icon */}
          <button onClick={toggleMenu} className="md:hidden text-gray-700">
            {isOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Right-side Slide-in Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Optional dark overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={closeMenu}
            />

            {/* Sidebar */}
            <motion.div
              ref={menuRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg px-6 py-8 space-y-4 text-gray-700 z-50 md:hidden"
            >
              {menuItems}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
