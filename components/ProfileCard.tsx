'use client';

import { useState } from 'react';

interface AdditionalInfo {
  prs?: Record<string, string>;
  preferredTimes?: string[];
}

interface Profile {
  id: string;
  displayName: string | null;
  name: string | null;
  gender: string;
  age: number;
  experienceLevel: string;
  fitnessTags: string[];
  bio: string | null;
  additionalInfo: AdditionalInfo | null;
  profilePhoto: string | null;
}

export default function ProfileCard({ profile, currentUserId }: { profile: Profile; currentUserId: string }) {
  const [expressingInterest, setExpressingInterest] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);

  const handleExpressInterest = async () => {
    setExpressingInterest(true);
    try {
      const response = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: profile.id,
        }),
      });

      if (response.ok) {
        alert('Interest expressed! The user will be notified.');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to express interest');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setExpressingInterest(false);
    }
  };

  const displayName = profile.displayName || profile.name || 'Anonymous';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6 hover:shadow-lg hover:border-orange-300 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start space-x-4">
        {profile.profilePhoto ? (
          <div className="relative">
            <img
              src={profile.profilePhoto}
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-orange-100"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        ) : (
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{displayName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500">
              {profile.gender} • Age {profile.age}
            </p>
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
              {profile.experienceLevel}
            </span>
          </div>
        </div>
      </div>

      {profile.bio && (
        <p className="mt-4 text-gray-700 text-sm leading-relaxed line-clamp-2">
          {profile.bio}
        </p>
      )}

      {profile.fitnessTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.fitnessTags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-100"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex space-x-2">
        <button
          onClick={handleExpressInterest}
          disabled={expressingInterest}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-gray-900 font-semibold py-2.5 px-4 rounded-lg transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {expressingInterest ? 'Sending...' : 'Express Interest'}
        </button>
        <button
          onClick={() => setShowFullProfile(!showFullProfile)}
          className="px-4 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors border border-orange-200"
        >
          {showFullProfile ? 'Hide' : 'View'}
        </button>
      </div>

      {showFullProfile && (
        <div className="mt-5 pt-5 border-t border-orange-200 animate-in fade-in duration-200">
          {profile.additionalInfo ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-semibold text-gray-900 text-base">Additional Information</h4>
              </div>
              
              {profile.additionalInfo.prs && Object.keys(profile.additionalInfo.prs).length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Personal Records (PRs)</h5>
                  <div className="space-y-2">
                    {Object.entries(profile.additionalInfo.prs).map(([exercise, record]) => (
                      <div key={exercise} className="flex justify-between items-center py-2 px-3 bg-orange-50 rounded-lg border border-orange-100">
                        <span className="text-sm font-medium text-gray-900">{exercise}</span>
                        <span className="text-sm font-semibold text-orange-600">{record}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {profile.additionalInfo.preferredTimes && profile.additionalInfo.preferredTimes.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Preferred Times</h5>
                  <div className="flex flex-wrap gap-2">
                    {profile.additionalInfo.preferredTimes.map((time, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg border border-amber-100">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {(!profile.additionalInfo.prs || Object.keys(profile.additionalInfo.prs).length === 0) && 
               (!profile.additionalInfo.preferredTimes || profile.additionalInfo.preferredTimes.length === 0) && (
                <p className="text-sm text-gray-500 italic text-center py-4">No additional information provided</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic text-center py-4">No additional information available</p>
          )}
        </div>
      )}
    </div>
  );
}

