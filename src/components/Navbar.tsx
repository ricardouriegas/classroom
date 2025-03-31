import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  RiDashboardLine,
  RiCalendar2Line,
  RiAddLine,
  RiSettings3Line,
  RiLogoutBoxRLine,
  RiRobot2Line,
  RiArrowLeftSLine,
  RiArrowRightSLine
} from 'react-icons/ri';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!currentUser) return null;

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <RiDashboardLine className="w-5 h-5" /> },
    { path: '/assignments', label: 'Assignments', icon: <RiCalendar2Line className="w-5 h-5" /> },
  ];

  if (currentUser.role === 'teacher') {
    navItems.push({
      path: '/create-class',
      label: 'Create Class',
      icon: <RiAddLine className="w-5 h-5" />
    });
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#1e1e2f] text-white border-r border-[#4c4c6d] shadow-lg z-50 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo + Collapse Button */}
      <div className="flex items-center justify-between p-4 border-b border-[#4c4c6d]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#00ffc3] rounded-full flex items-center justify-center">
            <RiRobot2Line className="text-black w-6 h-6" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold tracking-wider">Classroom</span>
          )}
        </div>
        <button onClick={toggleCollapse} className="text-gray-400 hover:text-white">
          {isCollapsed ? <RiArrowRightSLine /> : <RiArrowLeftSLine />}
        </button>
      </div>

      {/* Avatar + Info */}
      <div className="flex items-center gap-3 p-4 border-b border-[#4c4c6d]">
        <Avatar className="h-10 w-10 ring-2 ring-[#00ffc3]/50">
          <AvatarImage src={currentUser.avatar || currentUser.avatar_url} />
          <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{currentUser.name}</span>
            <span className="text-xs text-gray-400">{currentUser.role}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center ${
              isCollapsed ? 'justify-center' : 'gap-3 px-4'
            } py-2 rounded-md transition-all text-sm font-medium ${
              location.pathname === item.path
                ? 'bg-[#00ffc3]/10 text-[#00ffc3]'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {item.icon}
            {!isCollapsed && item.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className={`border-t border-[#4c4c6d] px-4 py-3 space-y-2 ${isCollapsed ? 'px-2' : ''}`}>
        <Link
          to="/settings"
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} text-sm hover:text-[#00ffc3]`}
        >
          <RiSettings3Line className="w-5 h-5" />
          {!isCollapsed && 'Settings'}
        </Link>
        <button
          onClick={logout}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} text-sm text-red-500 hover:text-red-400 w-full`}
        >
          <RiLogoutBoxRLine className="w-5 h-5" />
          {!isCollapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
