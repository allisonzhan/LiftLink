'use client';

import { useState, useEffect } from 'react';
import GymSessionCard from './GymSessionCard';
import CreateGymSessionModal from './CreateGymSessionModal';
import GymSessionFilters from './GymSessionFilters';

interface GymSession {
  id: string;
  creatorId: string;
  creator: {
    displayName: string | null;
    name: string | null;
  };
  title: string;
  workoutType: string[];
  gymLocation: string;
  dateTime: string;
  partySize: number;
  genderPreference: string | null;
  experiencePreference: string | null;
  additionalNotes: string | null;
  createdAt: string;
}

interface Filters {
  workoutType: string[];
  genderPreference: string;
  experiencePreference: string;
  dateFrom: string;
  dateTo: string;
}

export default function GymSessionsFeed({ currentUserId }: { currentUserId: string }) {
  const [sessions, setSessions] = useState<GymSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    workoutType: [],
    genderPreference: '',
    experiencePreference: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    fetchSessions();
  }, [filters]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.workoutType.length > 0) {
        filters.workoutType.forEach(tag => params.append('workoutType', tag));
      }
      if (filters.genderPreference) params.append('genderPreference', filters.genderPreference);
      if (filters.experiencePreference) params.append('experiencePreference', filters.experiencePreference);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const response = await fetch(`/api/gym-sessions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Fetched sessions:', data.length, 'sessions');
        setSessions(data);
      } else {
        const errorData = await response.json();
        console.error('❌ Error fetching sessions:', errorData);
      }
    } catch (error) {
      console.error('Error fetching gym sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionCreated = () => {
    setShowCreateModal(false);
    // Small delay to ensure database is updated
    setTimeout(() => {
      fetchSessions();
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Loading gym sessions...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gym Sessions</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-gray-900 font-semibold px-6 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Session
        </button>
      </div>

      <GymSessionFilters filters={filters} setFilters={setFilters} />

      {showCreateModal && (
        <CreateGymSessionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleSessionCreated}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {sessions.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white rounded-xl border border-orange-200 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or create a new session.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-gray-900 font-semibold px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Session
              </button>
            </div>
          </div>
        ) : (
          sessions.map((session) => (
            <GymSessionCard
              key={session.id}
              session={session}
              currentUserId={currentUserId}
              onUpdate={fetchSessions}
            />
          ))
        )}
      </div>
    </div>
  );
}

