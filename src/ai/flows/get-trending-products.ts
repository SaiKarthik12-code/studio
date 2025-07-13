// src/ai/flows/get-trending-products.ts
'use server';
/**
 * @fileOverview Generates a list of currently trending products by using a simulated web scraping tool.
 *
 * - getTrendingProducts - A function that generates a list of trending products.
 * - TrendingProductsOutput - The return type for the getTrendingProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Product } from '@/lib/types';
import { getSocialMediaMentions as getSocialMediaMentionsService } from '@/services/scraping';


const getSocialMediaMentions = ai.defineTool(
    {
      name: 'getSocialMediaMentions',
      description: 'Retrieves a list of products being mentioned on social media, along with their mention counts and sentiment.',
      outputSchema: z.array(z.object({
          productName: z.string(),
          mentions: z.number(),
          sentiment: z.enum(['positive', 'neutral', 'negative']),
      })),
    },
    async () => {
      // In a real application, this would involve web scraping or calling live social media APIs.
      // For this demo, we are calling a mock service.
      return getSocialMediaMentionsService();
    }
);


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
  model: 'googleai/gemini-1.5-flash-latest',
  output: {schema: TrendingProductsOutputSchema},
  tools: [getSocialMediaMentions],
  prompt: `You are the AI engine for "TrendSense," a real-time demand forecasting platform for Walmart. Your primary function is to analyze social media data to identify viral product trends.

Use the 'getSocialMediaMentions' tool to fetch the latest data on products trending across social media.

Based on the tool's output, analyze the data to identify the top 10 most relevant and impactful product trends for Walmart.

For each of the 10 products you identify, provide the following information:
- A unique product ID (e.g., prod-001, prod-002).
- The specific product name.
- A plausible Walmart category (e.g., Home Goods, Electronics, Apparel, Beauty, Groceries, Toys).
- A forecasted weekly demand as a number, reflecting its viral velocity. A higher mention count with positive sentiment should result in higher demand.
- An inventory status: 'Understock' for new, explosive trends; 'Optimal' for established trends; 'Overstock' for fading trends.
- A lastUpdated string, which should be 'Just now'.
- A valid placeholder image URL from 'https://placehold.co' with a size of 64x64.

Return the list of 10 products in the specified JSON format. Ensure the data reflects a diverse range of categories and consumer interests based on the tool's output.`,
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
