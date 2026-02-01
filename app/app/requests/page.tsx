'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface InterestRequest {
  id: string;
  sender: {
    id: string;
    displayName: string | null;
    name: string | null;
    email: string;
    phoneNumber: string | null;
  } | null;
  receiver: {
    id: string;
    displayName: string | null;
    name: string | null;
    email: string;
    phoneNumber: string | null;
  } | null;
  gymPost: {
    id: string;
    title: string;
  } | null;
  status: string;
  createdAt: string;
}

export default function RequestsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedRequests, setReceivedRequests] = useState<InterestRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<InterestRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/interest?type=${activeTab}`);
      if (response.ok) {
        const data = await response.json();
        if (activeTab === 'received') {
          setReceivedRequests(data);
        } else {
          setSentRequests(data);
        }
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`/api/interest/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updated = await response.json();
        if (status === 'accepted' && updated.sender) {
          alert(
            `Request accepted! Contact info:\nEmail: ${updated.sender.email}\n${
              updated.sender.phoneNumber ? `Phone: ${updated.sender.phoneNumber}` : ''
            }`
          );
        }
        fetchRequests();
      } else {
        alert('Failed to update request');
      }
    } catch (error) {
      alert('An error occurred');
    }
  };

  const requests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interest Requests</h1>
        <p className="text-gray-600">Manage your incoming and outgoing workout requests</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-orange-200 mb-6 overflow-hidden">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-4 px-6 text-sm font-semibold transition-all ${
              activeTab === 'received'
                ? 'bg-orange-500 text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
            }`}
          >
            Received ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-4 px-6 text-sm font-semibold transition-all ${
              activeTab === 'sent'
                ? 'bg-orange-500 text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
            }`}
          >
            Sent ({sentRequests.length})
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-orange-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No {activeTab} requests</h3>
          <p className="text-gray-600">You don't have any {activeTab} requests at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const otherUser = activeTab === 'received' ? request.sender : request.receiver;
            const userName = otherUser?.displayName || otherUser?.name || 'Anonymous';

            return (
              <div key={request.id} className="bg-white rounded-xl shadow-sm border border-orange-200 p-6 hover:shadow-md hover:border-orange-300 transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {activeTab === 'received' ? 'Request from' : 'Request to'}: {userName}
                    </h3>
                    {request.gymPost && (
                      <p className="text-sm text-gray-600 mb-2">
                        Gym Session: <span className="font-medium">{request.gymPost.title}</span>
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {activeTab === 'received' && request.status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleRespond(request.id, 'accepted')}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-gray-900 font-semibold rounded-lg transition-colors shadow-sm hover:shadow"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespond(request.id, 'rejected')}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-gray-900 font-semibold rounded-lg transition-colors shadow-sm hover:shadow"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {activeTab === 'sent' && request.status === 'accepted' && otherUser && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-semibold text-green-900 mb-2">Contact Information:</p>
                      <p className="text-sm text-gray-700">
                        <strong>Email:</strong> {otherUser.email}
                      </p>
                      {otherUser.phoneNumber && (
                        <p className="text-sm text-gray-700 mt-1">
                          <strong>Phone:</strong> {otherUser.phoneNumber}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

