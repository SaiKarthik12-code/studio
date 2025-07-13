export type SocialPlatform = 'Instagram' | 'Twitter' | 'Reddit' | 'TikTok';

export interface Product {
  id: string;
  name: string;
  category: string;
  forecastedDemand: number;
  inventoryStatus: 'Optimal' | 'Overstock' | 'Understock';
  lastUpdated: string;
  imageUrl: string;
  reviews?: {
    platform: SocialPlatform;
    text: string;
    username: string;
    postUrl: string;
  }[];
}
