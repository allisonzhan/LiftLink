'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfilesFeed from '@/components/ProfilesFeed';
import GymSessionsFeed from '@/components/GymSessionsFeed';

export default function AppPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profiles' | 'sessions'>('profiles');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        if (!userData.verified) {
          // Show unverified message
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  if (!user.verified) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Email Verification Required
          </h2>
          <p className="text-yellow-700">
            Please verify your email address to access profiles and gym sessions.
            Check your inbox for a verification link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Your Gym Buddy</h1>
            <p className="text-gray-600 mt-1">Connect with students at your university for workout sessions</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-orange-200 mb-6 overflow-hidden">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`flex-1 py-4 px-6 text-sm font-semibold transition-all ${
              activeTab === 'profiles'
                ? 'bg-orange-500 text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
            }`}
          >
            Profiles
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 py-4 px-6 text-sm font-semibold transition-all ${
              activeTab === 'sessions'
                ? 'bg-orange-500 text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
            }`}
          >
            Gym Sessions
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'profiles' && <ProfilesFeed currentUserId={user.id} />}
      {activeTab === 'sessions' && <GymSessionsFeed currentUserId={user.id} />}
    </div>
  );
}

