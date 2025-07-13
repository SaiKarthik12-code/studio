// src/ai/flows/get-trending-products.ts
'use server';
/**
 * @fileOverview Generates a list of currently trending products by fetching and analyzing live social media data.
 *
 * - getTrendingProducts - A function that generates a list of trending products.
 * - TrendingProductsOutput - The return type for the getTrendingProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Product } from '@/lib/types';
import vader from 'vader-sentiment';
import fetch from 'node-fetch';

// Helper function for sentiment analysis
const analyzeSentiment = (text: string): 'positive' | 'neutral' | 'negative' => {
    if (!text) return 'neutral';
    const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(text);
    if (intensity.compound >= 0.05) return 'positive';
    if (intensity.compound <= -0.05) return 'negative';
    return 'neutral';
};

// Data fetching functions (similar to analyze-social-trends flow)
const fetchTwitterData = async (query: string) => {
    const token = process.env.X_BEARER_TOKEN;
    if (!token) return [];
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=20`;
    try {
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` }});
        if (!response.ok) return [];
        const data: any = await response.json();
        return data.data?.map((t: any) => t.text) || [];
    } catch (e) {
        return [];
    }
};

const fetchRedditData = async (query: string) => {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=20`;
    try {
        const response = await fetch(url);
        if (!response.ok) return [];
        const data: any = await response.json();
        return data.data?.children?.map((post: any) => post.data.title) || [];
    } catch (e) {
        return [];
    }
};


const SocialMediaAnalysisToolInputSchema = z.object({
  topics: z.array(z.string()).describe("A list of product-related topics to search for on social media."),
});

const getSocialMediaMentions = ai.defineTool(
    {
      name: 'getSocialMediaMentions',
      description: 'Retrieves mentions and sentiment for a list of topics from various social media platforms.',
      inputSchema: SocialMediaAnalysisToolInputSchema,
      outputSchema: z.array(z.object({
          topic: z.string(),
          mentions: z.number(),
          sentiment: z.enum(['positive', 'neutral', 'negative']),
      })),
    },
    async ({ topics }) => {
        const results = [];
        for (const topic of topics) {
            const twitterPosts = await fetchTwitterData(topic);
            const redditPosts = await fetchRedditData(topic);
            
            const allPosts = [...twitterPosts, ...redditPosts];
            if (allPosts.length === 0) continue;

            let positive = 0;
            let negative = 0;
            let neutral = 0;

            for (const post of allPosts) {
                const sentiment = analyzeSentiment(post);
                if (sentiment === 'positive') positive++;
                else if (sentiment === 'negative') negative++;
                else neutral++;
            }
            
            const overallSentiment = positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral';

            results.push({
                topic: topic,
                mentions: allPosts.length,
                sentiment: overallSentiment
            });
        }
        return results;
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

First, come up with a list of 10-15 plausible product-related topics that might be trending right now (e.g., 'air fryer', 'skincare', 'running shoes', 'summer dress').

Then, use the 'getSocialMediaMentions' tool to fetch live data for those topics.

Based on the tool's output, analyze the data to identify the top 10 most relevant and impactful product trends for Walmart. A higher mention count with positive sentiment should result in higher demand and an 'Understock' status.

For each of the 10 products you identify, provide the following information:
- A unique product ID (e.g., prod-001, prod-002).
- The specific product name.
- A plausible Walmart category (e.g., Home Goods, Electronics, Apparel, Beauty, Groceries, Toys).
- A forecasted weekly demand as a number, reflecting its viral velocity.
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