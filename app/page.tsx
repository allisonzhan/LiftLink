'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden">
      {/* Background GIF */}
      <div 
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: 'url(/gym-background.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-amber-50/80 to-yellow-50/80"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div 
          className={`max-w-4xl mx-auto text-center transition-opacity duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="mb-8 flex justify-center">
            <div 
              className={`w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-1000 delay-200 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
            >
              <span className="text-white font-bold text-3xl">L</span>
            </div>
          </div>
          <h1 
            className={`text-5xl md:text-6xl font-bold text-gray-900 mb-6 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Find a Gym Buddy on Campus
          </h1>
          <p 
            className={`text-xl md:text-2xl text-gray-700 mb-12 transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Connect with fellow students for workouts, accountability, and fitness-focused friendships
          </p>
          <Link
            href="/auth/signup"
            className={`inline-block bg-orange-500 hover:bg-orange-600 text-gray-900 font-semibold px-8 py-4 rounded-lg text-lg transition-all shadow-lg hover:shadow-xl duration-1000 delay-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}

