'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CatChatbot from '@/components/CatChatbot';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPendingRequestsCount();
      // Poll for new requests every 30 seconds
      const interval = setInterval(fetchPendingRequestsCount, 30000);
      
      // Listen for requests updated event
      const handleRequestsUpdated = () => {
        fetchPendingRequestsCount();
      };
      window.addEventListener('requestsUpdated', handleRequestsUpdated);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('requestsUpdated', handleRequestsUpdated);
      };
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        if (!userData.verified) {
          // Redirect to verification page or show message
        }
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const fetchPendingRequestsCount = async () => {
    try {
      const response = await fetch('/api/interest/count');
      if (response.ok) {
        const data = await response.json();
        setPendingRequestsCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching pending requests count:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <nav className="bg-white/90 backdrop-blur-sm shadow-md border-b border-orange-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/app" className="flex items-center space-x-2 group">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform shadow-sm">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  LiftLink
                </span>
              </Link>
              {user && user.university && (
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                  {user.university.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Link
                href="/app"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                Home
              </Link>
              <Link
                href="/app/requests"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors relative"
              >
                Requests
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                    {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                  </span>
                )}
              </Link>
              <Link
                href="/app/profile"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="ml-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
      <CatChatbot />
    </div>
  );
}

