'use client';

import { useState, useEffect } from 'react';
import ProfileCard from './ProfileCard';
import ProfileFilters from './ProfileFilters';

interface Profile {
  id: string;
  displayName: string | null;
  name: string | null;
  gender: string;
  age: number;
  experienceLevel: string;
  fitnessTags: string[];
  bio: string | null;
  profilePhoto: string | null;
}

interface Filters {
  gender: string;
  ageMin: number;
  ageMax: number;
  experienceLevel: string;
  fitnessTags: string[];
}

export default function ProfilesFeed({ currentUserId }: { currentUserId: string }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    gender: '',
    ageMin: 18,
    ageMax: 100,
    experienceLevel: '',
    fitnessTags: [],
  });

  useEffect(() => {
    fetchProfiles();
  }, [filters]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.ageMin) params.append('ageMin', filters.ageMin.toString());
      if (filters.ageMax) params.append('ageMax', filters.ageMax.toString());
      if (filters.experienceLevel) params.append('experienceLevel', filters.experienceLevel);
      if (filters.fitnessTags.length > 0) {
        filters.fitnessTags.forEach(tag => params.append('fitnessTags', tag));
      }

      const response = await fetch(`/api/profiles?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        // Filter out current user
        setProfiles(data.filter((p: Profile) => p.id !== currentUserId));
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Loading profiles...</p>
      </div>
    );
  }

  return (
    <div>
      <ProfileFilters filters={filters} setFilters={setFilters} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {profiles.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white rounded-xl border border-orange-200 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No profiles found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more results.</p>
            </div>
          </div>
        ) : (
          profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} currentUserId={currentUserId} />
          ))
        )}
      </div>
    </div>
  );
}

