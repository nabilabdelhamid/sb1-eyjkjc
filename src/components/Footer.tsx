import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h1 className="text-xl font-bold text-purple-600">GetAndLet</h1>
            <p className="mt-2 text-sm text-gray-500">
              Join our community of item swappers and give your unused items a new life.
              Sustainable, simple, and social.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/explore" className="text-base text-gray-500 hover:text-gray-900">
                  Explore Items
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-base text-gray-500 hover:text-gray-900">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-base text-gray-500 hover:text-gray-900">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Connect With Us
            </h3>
            <div className="mt-4 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Github className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Facebook className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            © {new Date().getFullYear()} GetAndLet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}