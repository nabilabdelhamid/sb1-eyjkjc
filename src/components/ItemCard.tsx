import React from 'react';
import { Item } from '../types/item';
import { formatDistanceToNow } from 'date-fns';

interface ItemCardProps {
  item: Item;
  onRequestSwap?: () => void;
}

export default function ItemCard({ item, onRequestSwap }: ItemCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={item.imageUrl} 
        alt={item.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {item.condition}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">{item.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Added {formatDistanceToNow(item.createdAt)} ago
          </span>
          {onRequestSwap && item.status === 'available' && (
            <button
              onClick={onRequestSwap}
              className="btn btn-primary text-sm"
            >
              Request Swap
            </button>
          )}
        </div>
      </div>
    </div>
  );
}