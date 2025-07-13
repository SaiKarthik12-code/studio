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

// Data fetching functions
const fetchTwitterData = async (query: string) => {
    const token = process.env.X_BEARER_TOKEN;
    if (!token) {
      console.log("X_BEARER_TOKEN not found, returning empty array for Twitter.");
      return [];
    }
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=10&expansions=author_id`;
    try {
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` }});
        if (!response.ok) {
           console.error(`Twitter API error for query "${query}": ${response.statusText}`);
           return [];
        }
        const data: any = await response.json();
        const users = data.includes?.users?.reduce((acc: any, user: any) => {
            acc[user.id] = user.username;
            return acc;
        }, {}) || {};
        
        const posts = data.data?.map((t: any) => ({
            platform: 'X',
            text: t.text,
            username: users[t.author_id] || 'Unknown',
            postUrl: `https://twitter.com/${users[t.author_id] || 'anyuser'}/status/${t.id}`
        })) || [];

        console.log(`Fetched ${posts.length} posts from Twitter for "${query}".`);
        return posts;
    } catch (e) {
        console.error(`Failed to fetch from Twitter for query "${query}":`, e);
        return [];
    }
};

const fetchRedditData = async (query: string) => {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=10`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
           console.error(`Reddit API error for query "${query}": ${response.statusText}`);
           return [];
        }
        const data: any = await response.json();
        const posts = data.data?.children?.map((post: any) => ({
            platform: 'Reddit',
            text: post.data.title,
            username: post.data.author,
            postUrl: `https://www.reddit.com${post.data.permalink}`
        })) || [];
        console.log(`Fetched ${posts.length} posts from Reddit for "${query}".`);
        return posts;
    } catch (e) {
        console.error(`Failed to fetch from Reddit for query "${query}":`, e);
        return [];
    }
};

const ProductReviewSchema = z.object({
    platform: z.enum(['X', 'Reddit']),
    text: z.string().describe("The full text of the social media post."),
    username: z.string().describe("The username of the author of the post."),
    postUrl: z.string().url().describe("The direct URL to the social media post."),
});

const TrendingProductSchema = z.object({
  id: z.string().describe("A unique product ID, e.g., 'prod-001'"),
  name: z.string().describe('The name of the product.'),
  category: z.string().describe('The category the product belongs to.'),
  forecastedDemand: z.number().describe('The estimated weekly demand for this product.'),
  inventoryStatus: z.enum(['Optimal', 'Overstock', 'Understock']).describe('The current inventory status based on the trend.'),
  lastUpdated: z.string().describe("A human-readable string indicating when this data was generated, e.g., 'Just now'."),
  imageUrl: z.string().describe('A placeholder image URL for the product.'),
  reviews: z.array(ProductReviewSchema).optional().describe("A list of 2-3 of the most representative social media posts that signal this trend.")
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
  prompt: `You are the AI engine for "TrendSense," a real-time demand forecasting platform for Walmart. Your primary function is to analyze social media data to identify viral product trends.

You have been provided with a raw data stream of social media posts.

Social Media Data:
{{{socialMediaData}}}

Based on this live data, analyze it to identify the top 10 most relevant and impactful product trends for Walmart. A higher mention count with positive sentiment should result in higher demand and an 'Understock' status.

For each of the 10 products you identify, provide the following information:
- A unique product ID (e.g., prod-001, prod-002).
- The specific product name.
- A plausible Walmart category (e.g., Home Goods, Electronics, Apparel, Beauty, Groceries, Toys).
- A forecasted weekly demand as a number, reflecting its viral velocity.
- An inventory status: 'Understock' for new, explosive trends; 'Optimal' for established trends; 'Overstock' for fading trends.
- A lastUpdated string, which should be 'Just now'.
- A valid placeholder image URL from 'https://placehold.co' with a size of 64x64.
- A list of 2-3 of the most representative "reviews" (social media posts) from the provided data that justify why this product is trending. Each review must include the platform, text, username, and postUrl.

Return the list of 10 products in the specified JSON format. Ensure the data reflects a diverse range of categories and consumer interests based on the tool's output.`,
});

const trendingProductsFlow = ai.defineFlow(
  {
    name: 'trendingProductsFlow',
    outputSchema: TrendingProductsOutputSchema,
  },
  async () => {
    const topics = ['air fryer', 'skincare', 'running shoes', 'summer dress', 'gaming keyboard', 'protein powder', 'yoga mat', 'noise cancelling headphones', 'weighted blanket', 'electric scooter'];
    let allPosts: any[] = [];

    for (const topic of topics) {
        const twitterPosts = await fetchTwitterData(topic);
        const redditPosts = await fetchRedditData(topic);
        allPosts = [...allPosts, ...twitterPosts, ...redditPosts];
    }
    
    // Deduplicate posts to avoid sending too much redundant data to the model
    const uniquePosts = Array.from(new Map(allPosts.map(p => [p.text, p])).values());

    const socialMediaData = JSON.stringify(uniquePosts, null, 2);
    
    console.log("-----BEGIN SOCIAL MEDIA ANALYSIS-----");
    console.log(`Sending ${uniquePosts.length} unique posts to the AI model.`);
    console.log("-----END SOCIAL MEDIA ANALYSIS-----");

    const {output} = await prompt({ socialMediaData });
    return output!;
  }
);
