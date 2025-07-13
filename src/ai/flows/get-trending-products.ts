// src/ai/flows/get-trending-products.ts
'use server';
/**
 * @fileOverview Generates a list of currently trending products.
 *
 * - getTrendingProducts - A function that generates a list of trending products.
 * - TrendingProductsOutput - The return type for the getTrendingProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Product } from '@/lib/types';

const TrendingProductSchema = z.object({
  id: z.string().describe("A unique product ID, e.g., 'prod-001'"),
  name: z.string().describe('The name of the product.'),
  category: z.string().describe('The category the product belongs to.'),
  forecastedDemand: z.number().describe('The estimated weekly demand for this product.'),
  inventoryStatus: z.enum(['Optimal', 'Overstock', 'Understock']).describe('The current inventory status based on the trend.'),
  lastUpdated: z.string().describe("A human-readable string indicating when this data was generated, e.g., 'Just now'."),
  imageUrl: z.string().describe('A placeholder image URL for the product.'),
});

const TrendingProductsOutputSchema = z.object({
    products: z.array(TrendingProductSchema)
});

export type TrendingProductsOutput = z.infer<typeof TrendingProductsOutputSchema>;


export async function getTrendingProducts(): Promise<Product[]> {
    const result = await trendingProductsFlow();
    return result.products as Product[];
}

const prompt = ai.definePrompt({
  name: 'getTrendingProductsPrompt',
  output: {schema: TrendingProductsOutputSchema},
  prompt: `You are the AI engine for "TrendSense," a real-time demand forecasting platform for Walmart. Your primary function is to mine social media for viral product trends.

Simulate a scan of TikTok, Instagram, X, and Reddit to identify 10 specific products that are currently gaining significant traction and are relevant to Walmart's inventory.

For each product you identify, provide the following information:
- A unique product ID (e.g., prod-001, prod-002).
- The specific product name (e.g., "Cosori Air Fryer" not just "Air Fryer").
- A plausible Walmart category (e.g., Home Goods, Electronics, Apparel, Beauty, Groceries, Toys).
- A forecasted weekly demand as a number, reflecting its viral velocity.
- An inventory status: 'Understock' for new, explosive trends; 'Optimal' for established trends; 'Overstock' for fading trends.
- A lastUpdated string, which should be 'Just now'.
- A valid placeholder image URL from 'https://placehold.co' with a size of 64x64.

Return the list of 10 products in the specified JSON format. Ensure the data reflects a diverse range of categories and current consumer interests you'd expect to see trending online.`,
});

const trendingProductsFlow = ai.defineFlow(
  {
    name: 'trendingProductsFlow',
    outputSchema: TrendingProductsOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
