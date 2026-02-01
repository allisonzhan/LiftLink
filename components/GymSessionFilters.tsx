'use client';

const FITNESS_TAGS = ['Bodybuilding', 'Powerlifting', 'Pilates', 'Cardio', 'General fitness'];

interface Filters {
  workoutType: string[];
  genderPreference: string;
  experiencePreference: string;
  dateFrom: string;
  dateTo: string;
}

export default function GymSessionFilters({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}) {
  const toggleWorkoutType = (tag: string) => {
    if (filters.workoutType.includes(tag)) {
      setFilters({
        ...filters,
        workoutType: filters.workoutType.filter((t) => t !== tag),
      });
    } else {
      setFilters({
        ...filters,
        workoutType: [...filters.workoutType, tag],
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-5">
        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender Preference</label>
          <select
            value={filters.genderPreference}
            onChange={(e) => setFilters({ ...filters, genderPreference: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
          <select
            value={filters.experiencePreference}
            onChange={(e) => setFilters({ ...filters, experiencePreference: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Workout Type</label>
        <div className="flex flex-wrap gap-2">
          {FITNESS_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleWorkoutType(tag)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filters.workoutType.includes(tag)
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

