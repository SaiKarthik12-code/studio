export interface Product {
  id: string;
  name: string;
  category: string;
  forecastedDemand: number;
  stockoutRisk: 'Low' | 'Medium' | 'High';
  lastUpdated: string;
  imageUrl: string;
}
