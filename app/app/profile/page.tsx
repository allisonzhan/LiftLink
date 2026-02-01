'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const FITNESS_TAGS = ['Bodybuilding', 'Powerlifting', 'Pilates', 'Cardio', 'General fitness'];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    name: '',
    bio: '',
    experienceLevel: 'Beginner',
    fitnessTags: [] as string[],
    phoneNumber: '',
    profilePhoto: '',
    showProfileToSameGenderOnly: false,
    viewSameGenderOnly: false,
    additionalInfo: {
      prs: {} as Record<string, string>,
      preferredTimes: [] as string[],
    },
  });
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          displayName: data.displayName || '',
          name: data.name || '',
          bio: data.bio || '',
          experienceLevel: data.experienceLevel || 'Beginner',
          fitnessTags: data.fitnessTags || [],
          phoneNumber: data.phoneNumber || '',
          profilePhoto: data.profilePhoto || '',
          showProfileToSameGenderOnly: data.showProfileToSameGenderOnly || false,
          viewSameGenderOnly: data.viewSameGenderOnly || false,
          additionalInfo: data.additionalInfo || {
            prs: {},
            preferredTimes: [],
          },
        });
        setProfilePhotoPreview(data.profilePhoto || null);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFitnessTag = (tag: string) => {
    if (formData.fitnessTags.includes(tag)) {
      setFormData({
        ...formData,
        fitnessTags: formData.fitnessTags.filter((t) => t !== tag),
      });
    } else {
      setFormData({
        ...formData,
        fitnessTags: [...formData.fitnessTags, tag],
      });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, profilePhoto: base64String });
        setProfilePhotoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData({ ...formData, profilePhoto: '' });
    setProfilePhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          bio: formData.bio || null,
          phoneNumber: formData.phoneNumber || null,
          profilePhoto: formData.profilePhoto || null,
          showProfileToSameGenderOnly: formData.showProfileToSameGenderOnly,
          viewSameGenderOnly: formData.viewSameGenderOnly,
          additionalInfo: Object.keys(formData.additionalInfo.prs).length > 0 ||
                          formData.additionalInfo.preferredTimes.length > 0
            ? formData.additionalInfo
            : null,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        alert('Profile updated successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update profile');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600 mt-1">Update your profile information and preferences</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-orange-200 p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="How you want to be displayed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center space-x-4">
            {profilePhotoPreview ? (
              <div className="relative">
                <img
                  src={profilePhotoPreview}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-2xl border-2 border-orange-200">
                {(formData.displayName || formData.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio (max 200 characters)
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            maxLength={200}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Tell others about your fitness goals..."
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.bio.length}/200 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Experience Level
          </label>
          <select
            value={formData.experienceLevel}
            onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fitness Focus
          </label>
          <div className="flex flex-wrap gap-2">
            {FITNESS_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleFitnessTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  formData.fitnessTags.includes(tag)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (optional - shared when interest is accepted)
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="(123) 456-7890"
          />
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Visibility Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.showProfileToSameGenderOnly}
                  onChange={(e) => setFormData({ ...formData, showProfileToSameGenderOnly: e.target.checked })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Show my profile only to users of the same gender
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6 mt-1">
                When enabled, only users of the same gender as you will be able to see your profile
              </p>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.viewSameGenderOnly}
                  onChange={(e) => setFormData({ ...formData, viewSameGenderOnly: e.target.checked })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Only view profiles of the same gender
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6 mt-1">
                When enabled, you will only see profiles of users with the same gender as you
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Records (PRs)
              </label>
              <div className="space-y-2">
                {Object.entries(formData.additionalInfo.prs).map(([exercise, record], idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={exercise}
                      onChange={(e) => {
                        const newPrs = { ...formData.additionalInfo.prs };
                        delete newPrs[exercise];
                        newPrs[e.target.value] = record;
                        setFormData({
                          ...formData,
                          additionalInfo: { ...formData.additionalInfo, prs: newPrs },
                        });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Exercise (e.g., Bench Press)"
                    />
                    <input
                      type="text"
                      value={record}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          additionalInfo: {
                            ...formData.additionalInfo,
                            prs: { ...formData.additionalInfo.prs, [exercise]: e.target.value },
                          },
                        });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Record (e.g., 225 lbs)"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newPrs = { ...formData.additionalInfo.prs };
                        delete newPrs[exercise];
                        setFormData({
                          ...formData,
                          additionalInfo: { ...formData.additionalInfo, prs: newPrs },
                        });
                      }}
                      className="px-3 py-2 text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    additionalInfo: {
                      ...formData.additionalInfo,
                      prs: { ...formData.additionalInfo.prs, '': '' },
                    },
                  });
                }}
                className="mt-2 text-sm text-orange-600 hover:text-orange-700"
              >
                + Add PR
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Times
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {['Morning (6-9 AM)', 'Mid-morning (9-12 PM)', 'Afternoon (12-5 PM)', 'Evening (5-8 PM)', 'Late evening (8-10 PM)'].map((timeOption) => {
                  const isSelected = formData.additionalInfo.preferredTimes.includes(timeOption);
                  return (
                    <button
                      key={timeOption}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          // Remove if already selected
                          setFormData({
                            ...formData,
                            additionalInfo: {
                              ...formData.additionalInfo,
                              preferredTimes: formData.additionalInfo.preferredTimes.filter(t => t !== timeOption),
                            },
                          });
                        } else {
                          // Add if not selected
                          setFormData({
                            ...formData,
                            additionalInfo: {
                              ...formData.additionalInfo,
                              preferredTimes: [...formData.additionalInfo.preferredTimes, timeOption],
                            },
                          });
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-orange-500 text-gray-900 hover:bg-orange-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {timeOption}
                    </button>
                  );
                })}
              </div>
              {formData.additionalInfo.preferredTimes.length > 0 && (
                <p className="text-sm text-gray-500">
                  Selected: {formData.additionalInfo.preferredTimes.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg border border-orange-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-gray-900 font-semibold rounded-lg transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
      </form>
    </div>
  );
}

