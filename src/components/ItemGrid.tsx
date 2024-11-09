import React from 'react';
import { Item } from '../types/item';
import ItemCard from './ItemCard';

interface ItemGridProps {
  items: Item[];
  onRequestSwap?: (item: Item) => void;
}

export default function ItemGrid({ items, onRequestSwap }: ItemGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onRequestSwap={() => onRequestSwap?.(item)}
        />
      ))}
    </div>
  );
}