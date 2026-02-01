'use client';

import { useState, useEffect } from 'react';

const insults = [
  "Meow... Your form is worse than a sleeping human's posture! 😾",
  "Purr-lease... Even I lift better than that! 🐱",
  "Hiss! That workout was as weak as a kitten's meow! 😼",
  "Meowch! Your dedication is thinner than my whiskers! 😹",
  "Ruff... wait, wrong animal. But still, step it up! 🐾",
  "Meow... I've seen mice with more determination! 🐭",
  "Purr-fectly pathetic! Time to get serious! 😾",
];

const compliments = [
  "Meow! You're doing great! Keep it up! 🐱✨",
  "Purr-fect form! You're amazing! 😸",
  "Meow! Your dedication is inspiring! 🌟",
  "Wow! Even I'm impressed! Keep going! 🐾",
  "Meow-velous work! You're crushing it! 💪",
  "Purr-sistence pays off! You're doing awesome! 😺",
  "Meow! You're stronger than you think! 🦁",
];

const motivations = [
  "Meow! Every rep counts! You've got this! 💪",
  "Purr-severance is key! Don't give up! 🐱",
  "Meow! Remember why you started! Keep pushing! 🔥",
  "You're one workout closer to your goals! Meow! 🎯",
  "Purr-fect progress! Every step matters! 🐾",
  "Meow! Your future self will thank you! 🙏",
  "Hiss at the pain, but keep going! You're strong! 💪",
];

const catFacts = [
  "Did you know? Cats can jump 6 times their height! 🐱",
  "Fun fact: I'm judging your workout... but keep going! 😸",
  "Meow! Cats sleep 12-16 hours a day. You should rest too! 😴",
  "Purr tip: Hydration is important! Drink water! 💧",
];

type MessageType = 'insult' | 'compliment' | 'motivation' | 'fact';

interface Message {
  text: string;
  type: MessageType;
  timestamp: Date;
}

export default function CatChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Add initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        text: "Meow! I'm Gym Cat! Click the buttons below to hear what I think! 🐱",
        type: 'fact',
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [isOpen, messages.length]);

  const addMessage = (type: MessageType) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let text = '';
      switch (type) {
        case 'insult':
          text = insults[Math.floor(Math.random() * insults.length)];
          break;
        case 'compliment':
          text = compliments[Math.floor(Math.random() * compliments.length)];
          break;
        case 'motivation':
          text = motivations[Math.floor(Math.random() * motivations.length)];
          break;
        case 'fact':
          text = catFacts[Math.floor(Math.random() * catFacts.length)];
          break;
      }

      const newMessage: Message = {
        text,
        type,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 z-50 flex items-center justify-center group"
          aria-label="Open cat chatbot"
        >
          <span className="text-3xl">🐱</span>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border-2 border-orange-200 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-400 to-red-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐱</span>
              <div>
                <h3 className="text-white font-bold text-sm">Gym Cat</h3>
                <p className="text-orange-100 text-xs">Always watching...</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-orange-50 to-white">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className="flex justify-start"
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    msg.type === 'insult'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : msg.type === 'compliment'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : msg.type === 'motivation'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-orange-100 text-orange-800 border border-orange-200'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-3 bg-orange-50 border-t border-orange-200 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addMessage('insult')}
                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                😾 Insult Me
              </button>
              <button
                onClick={() => addMessage('compliment')}
                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                😸 Compliment
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addMessage('motivation')}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                💪 Motivate
              </button>
              <button
                onClick={() => addMessage('fact')}
                className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                🐱 Cat Fact
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

