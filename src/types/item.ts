export interface Item {
  id: string;
  userId: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  createdAt: number;
  status: 'available' | 'pending' | 'swapped';
}