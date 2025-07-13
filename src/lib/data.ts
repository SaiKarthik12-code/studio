import type { Product } from '@/lib/types';

// This is mock data. In a real application, this would come from a database.
const products: Product[] = [
    {
        id: 'prod-001',
        name: 'Stanley Quencher Tumbler',
        category: 'Drinkware',
        forecastedDemand: 1200,
        inventoryStatus: 'Understock',
        lastUpdated: '2 hours ago',
        imageUrl: 'https://placehold.co/64x64/1d4ed8/ffffff.png',
      },
      {
        id: 'prod-002',
        name: 'Organic Avocadoes (4-pack)',
        category: 'Groceries',
        forecastedDemand: 800,
        inventoryStatus: 'Optimal',
        lastUpdated: '1 day ago',
        imageUrl: 'https://placehold.co/64x64/22c55e/ffffff.png',
      },
      {
        id: 'prod-003',
        name: 'LEGO Star Wars Set',
        category: 'Toys',
        forecastedDemand: 350,
        inventoryStatus: 'Overstock',
        lastUpdated: '5 hours ago',
        imageUrl: 'https://placehold.co/64x64/facc15/000000.png',
      },
      {
        id: 'prod-004',
        name: 'Great Value Milk',
        category: 'Groceries',
        forecastedDemand: 2500,
        inventoryStatus: 'Optimal',
        lastUpdated: '30 minutes ago',
        imageUrl: 'https://placehold.co/64x64/f8fafc/000000.png',
      },
      {
        id: 'prod-005',
        name: 'Nintendo Switch OLED',
        category: 'Electronics',
        forecastedDemand: 600,
        inventoryStatus: 'Understock',
        lastUpdated: '8 hours ago',
        imageUrl: 'https://placehold.co/64x64/ef4444/ffffff.png',
      },
];

// This function simulates fetching data from an API.
export const fetchProducts = async (): Promise<Product[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return products;
};
