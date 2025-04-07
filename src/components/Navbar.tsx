import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  RiDashboardLine,
  RiCalendar2Line,
  RiAddLine,
  RiSettings3Line,
  RiLogoutBoxRLine,
  RiRobot2Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiUser3Line,
} from 'react-icons/ri';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check on initial render

    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed]);

  if (!currentUser) return null;

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        <button 
          onClick={toggleCollapse} 
          className="text-gray-400 hover:text-white transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <RiArrowRightSLine /> : <RiArrowLeftSLine />}
        </button>
      </div>

      {/* User Profile Section */}
      <div className="flex items-center gap-3 p-4 border-b border-[#4c4c6d]">
        {isCollapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 p-0">
                <Avatar className="h-10 w-10 ring-2 ring-[#00ffc3]/50 cursor-pointer">
                  <AvatarImage src={currentUser.avatar || currentUser.avatar_url} alt={currentUser.name} />
                  <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56 bg-[#1e1e2f] border-[#4c4c6d] text-white">
              <DropdownMenuLabel className="flex flex-col space-y-1">
                <span className="font-medium">{currentUser.name}</span>
                <span className="text-xs text-gray-400">{currentUser.email}</span>
                <span className="text-xs text-[#00ffc3] capitalize">{currentUser.role}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#4c4c6d]" />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-2 cursor-pointer hover:bg-[#252538] text-white">
                  <RiSettings3Line className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-400 hover:bg-red-500/10">
                <RiLogoutBoxRLine className="w-4 h-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Avatar className="h-10 w-10 ring-2 ring-[#00ffc3]/50">
              <AvatarImage src={currentUser.avatar || currentUser.avatar_url} alt={currentUser.name} />
              <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">{currentUser.name}</span>
              <span className="text-xs text-gray-400 truncate">{currentUser.role}</span>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center ${
              isCollapsed ? 'justify-center mx-2' : 'gap-3 px-4'
            } py-2 rounded-md transition-all text-sm font-medium ${
              location.pathname === item.path
                ? 'bg-[#00ffc3]/10 text-[#00ffc3]'
                : 'text-gray-300 hover:bg-[#252538] hover:text-white'
            }`}
            title={isCollapsed ? item.label : undefined}
          >
            {item.icon}
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed ? (
        <div className="border-t border-[#4c4c6d] px-4 py-3 space-y-2">
          <Link
            to="/settings"
            className="flex items-center gap-3 text-sm hover:text-[#00ffc3] transition-colors"
          >
            <RiSettings3Line className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-sm text-red-500 hover:text-red-400 w-full transition-colors"
          >
            <RiLogoutBoxRLine className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      ) : (
        <div className="border-t border-[#4c4c6d] py-3 flex flex-col items-center space-y-4">
          <Link
            to="/settings"
            className="text-gray-400 hover:text-[#00ffc3] transition-colors"
            title="Settings"
          >
            <RiSettings3Line className="w-5 h-5" />
          </Link>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <RiLogoutBoxRLine className="w-5 h-5" />
          </button>
        </div>
      )}
    </aside>
  );
};

export default Navbar;
