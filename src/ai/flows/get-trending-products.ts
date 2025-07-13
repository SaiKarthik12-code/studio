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
  prompt: `You are a market trend analyst. Your task is to identify 5 currently trending products based on real-world recent social media and market data.

For each product, provide the following information:
- A unique product ID (e.g., prod-001, prod-002).
- The product name.
- A plausible category (e.g., Drinkware, Electronics, Apparel, Beauty).
- A forecasted weekly demand as a number.
- An inventory status ('Understock', 'Optimal', 'Overstock'). If a product is very trendy, it should be 'Understock'. If it's a stable trend, make it 'Optimal'.
- A lastUpdated string, which should be 'Just now'.
- A placeholder image URL from 'https://placehold.co/64x64/...' with a unique color scheme for each product.

Return the list of 5 products in the specified JSON format. Ensure the data is diverse and reflects current consumer interests.`,
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
