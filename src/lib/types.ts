export interface Product {
  id: string;
  name: string;
  category: string;
  forecastedDemand: number;
  inventoryStatus: 'Optimal' | 'Overstock' | 'Understock';
  lastUpdated: string;
  imageUrl: string;
}
