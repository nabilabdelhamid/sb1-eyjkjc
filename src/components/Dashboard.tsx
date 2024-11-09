import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Plus } from 'lucide-react';
import ItemForm from './ItemForm';
import ItemGrid from './ItemGrid';
import { Item } from '../types/item';

export default function Dashboard() {
  const { user } = useAuth();
  const [showAddItem, setShowAddItem] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'items'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Item[];
      setItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Items</h1>
        <button
          onClick={() => setShowAddItem(!showAddItem)}
          className="btn btn-primary inline-flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Item
        </button>
      </div>

      {showAddItem && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <ItemForm onSuccess={() => setShowAddItem(false)} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">You haven't added any items yet.</p>
        </div>
      ) : (
        <ItemGrid items={items} />
      )}
    </div>
  );
}