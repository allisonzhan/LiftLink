import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-3xl">L</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Find a Gym Buddy on Campus
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-12">
            Connect with fellow students for workouts, accountability, and fitness-focused friendships
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-gray-900 font-semibold px-8 py-4 rounded-lg text-lg transition-all shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}

