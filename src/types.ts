export interface Post {
  id: string;
  timestamp: number;
  imageUrl: string;
  quality: 'fire' | 'suspect' | 'moldy' | 'pgr';
  details: string;
  visualNotes: string;
  warnings: string[];
  terpenes?: string[];
  userName: string;
}

export const MOCK_POSTS: Post[] = [];
