import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Menu, X, Bell, User as UserIcon } from 'lucide-react';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Explore', href: '/explore' },
    { name: 'Swap Requests', href: '/requests' },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-purple-600">GetAndLet</h1>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname === item.href
                      ? 'border-purple-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {user ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
                  >
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                      2
                    </span>
                    <Bell className="h-6 w-6" />
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50 border">
                      <div className="px-4 py-2 border-b">
                        <h3 className="text-sm font-medium">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm text-gray-900">New swap request received</p>
                          <p className="text-xs text-gray-500">2 minutes ago</p>
                        </div>
                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm text-gray-900">Your swap request was accepted</p>
                          <p className="text-xs text-gray-500">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/profile"
                  className="flex items-center space-x-3 text-gray-700 hover:text-gray-900"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Profile'}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-purple-600" />
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                Sign In
              </Link>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {user && (
              <div className="px-4 py-2 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Profile'}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-purple-600" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </div>
              </div>
            )}
            
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  location.pathname === item.href
                    ? 'bg-purple-50 border-purple-500 text-purple-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/auth"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}