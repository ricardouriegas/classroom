
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Menu, X, BookOpen, Plus, Calendar, Settings, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  if (!currentUser) return null;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <BookOpen className="w-5 h-5 mr-2" /> },
    { path: '/assignments', label: 'Assignments', icon: <Calendar className="w-5 h-5 mr-2" /> },
  ];

  // Teacher-specific nav item
  if (currentUser.role === 'teacher') {
    navItems.push({ 
      path: '/create-class', 
      label: 'Create Class', 
      icon: <Plus className="w-5 h-5 mr-2" /> 
    });
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center mr-2">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">ClassConnect</span>
            </Link>
          </div>

          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu (Avatar + Dropdown) */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9 transition-transform hover:scale-105">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-gray-500">{currentUser.email}</p>
                    <p className="text-xs leading-none text-primary mt-1 capitalize">{currentUser.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <div className="md:hidden flex ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="text-gray-500 hover:text-gray-700"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === item.path 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={closeMenu}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
