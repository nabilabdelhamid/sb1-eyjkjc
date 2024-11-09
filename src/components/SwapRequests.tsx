import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle } from 'lucide-react';

interface SwapRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  requestedItemId: string;
  offeredItemIds: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: number;
  fromUserEmail?: string;
  toUserEmail?: string;
  requestedItem?: any;
  offeredItems?: any[];
}

export default function SwapRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'swapRequests'),
      where('toUserId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SwapRequest[];
      setRequests(fetchedRequests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Swap Requests</h1>

      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500">No swap requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Swap Request from {request.fromUserEmail}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(request.createdAt)} ago
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    request.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">Requested Item:</h4>
                {request.requestedItem && (
                  <div className="mt-2 flex items-center space-x-4">
                    <img
                      src={request.requestedItem.imageUrl}
                      alt={request.requestedItem.title}
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium">{request.requestedItem.title}</p>
                      <p className="text-sm text-gray-500">{request.requestedItem.description}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">Offered Items:</h4>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {request.offeredItems?.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {request.status === 'pending' && (
                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={() => {
                      // TODO: Implement accept logic
                    }}
                    className="btn btn-primary"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement reject logic
                    }}
                    className="btn bg-red-600 text-white hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}

              {request.status === 'accepted' && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      // TODO: Implement chat logic
                    }}
                    className="btn btn-primary inline-flex items-center"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Chat with Swapper
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}