'use client';

import { useState } from 'react';
import EditGymSessionModal from './EditGymSessionModal';

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
}

export default function GymSessionCard({
  session,
  currentUserId,
  onUpdate,
}: {
  session: GymSession;
  currentUserId: string;
  onUpdate: () => void;
}) {
  const [requesting, setRequesting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const isOwner = session.creatorId === currentUserId;

  const handleRequestJoin = async () => {
    setRequesting(true);
    try {
      const response = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gymPostId: session.id,
        }),
      });

      if (response.ok) {
        alert('Request sent! The creator will be notified.');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to send request');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setRequesting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const response = await fetch(`/api/gym-sessions/${session.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
      } else {
        alert('Failed to delete session');
      }
    } catch (error) {
      alert('An error occurred');
    }
  };

  // Parse date - handle timezone correctly
  // Parse date - it's stored in database, display in local time
  const date = new Date(session.dateTime);
  const creatorName = session.creator.displayName || session.creator.name || 'Anonymous';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6 hover:shadow-lg hover:border-orange-300 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{session.title}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{session.gymLocation}</span>
          </div>
        </div>
        {isOwner && (
          <div className="flex space-x-1">
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
              title="Edit session"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete session"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 text-sm mb-4">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="font-medium text-gray-700">{creatorName}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-4 bg-orange-50 rounded-lg p-3">
        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-semibold text-gray-700">
          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        <span className="text-orange-300">•</span>
        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-semibold text-gray-700">
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {session.workoutType.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {session.workoutType.map((type) => (
            <span
              key={type}
              className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-100"
            >
              {type}
            </span>
          ))}
        </div>
      )}

      <div className="mb-4 space-y-2 text-sm">
        <div className="flex items-center justify-between py-2 px-3 bg-orange-50 rounded-lg border border-orange-100">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-gray-700">Party size</span>
          </div>
          <span className="font-semibold text-gray-900">{session.partySize} people</span>
        </div>
        {session.sameGenderOnly && (
          <div className="flex items-center space-x-2 py-2 px-3 bg-orange-50 rounded-lg border border-orange-100 text-orange-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-medium">Same gender only</span>
          </div>
        )}
        {session.genderPreference && (
          <div className="flex items-center justify-between py-2 px-3 bg-orange-50 rounded-lg border border-orange-100">
            <span className="text-gray-700">Gender preference</span>
            <span className="font-semibold text-gray-900">{session.genderPreference}</span>
          </div>
        )}
        {session.experiencePreference && (
          <div className="flex items-center justify-between py-2 px-3 bg-orange-50 rounded-lg border border-orange-100">
            <span className="text-gray-700">Experience</span>
            <span className="font-semibold text-gray-900">{session.experiencePreference}</span>
          </div>
        )}
      </div>

      {session.additionalNotes && (
        <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
          <p className="text-sm text-gray-700 leading-relaxed">{session.additionalNotes}</p>
        </div>
      )}

      {!isOwner && (
        <button
          onClick={handleRequestJoin}
          disabled={requesting}
          className="w-full bg-orange-500 hover:bg-orange-600 text-gray-900 font-semibold py-2.5 px-4 rounded-lg transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {requesting ? 'Sending...' : 'Request to Join'}
        </button>
      )}

      {showEditModal && (
        <EditGymSessionModal
          sessionId={session.id}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}

