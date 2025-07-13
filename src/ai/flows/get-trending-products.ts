// src/ai/flows/get-trending-products.ts
'use server';
/**
 * @fileOverview Generates a list of currently trending products by analyzing social media data.
 *
 * - getTrendingProducts - A function that generates a list of trending products.
 * - TrendingProductsOutput - The return type for the getTrendingProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Product, SocialPlatform } from '@/lib/types';
import fetch from 'node-fetch';

const ProductReviewSchema = z.object({
    platform: z.enum(['Instagram', 'Twitter', 'Reddit', 'TikTok']).describe("The social media platform (e.g., 'Instagram', 'Twitter')."),
    text: z.string().describe("The full text of the social media post."),
    username: z.string().describe("The username of the author of the post."),
    postUrl: z.string().url().describe("The direct URL to the social media post."),
});

const fetchInstagramData = async (query: string) => {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!accessToken) {
        console.warn(`INSTAGRAM_ACCESS_TOKEN not found for query "${query}". Returning mock data.`);
        return [{ platform: 'Instagram' as const, text: `This is a sample post for ${query}. #sample`, username: 'preview_user', postUrl: 'https://www.instagram.com' }];
    }
    
    const sanitizedQuery = query.replace(/\s+/g, '').toLowerCase();
    const searchUrl = `https://graph.facebook.com/v20.0/ig_hashtag_search?user_id=me&q=${sanitizedQuery}&access_token=${accessToken}`;
    
    try {
        const searchResponse = await fetch(searchUrl);
        const searchData: any = await searchResponse.json();

        if (!searchResponse.ok || !searchData.data || searchData.data.length === 0) {
            console.error(`Failed to find Instagram hashtag for "${query}":`, searchData.error?.message || 'No hashtag found.');
            return [];
        }
        
        const hashtagId = searchData.data[0].id;
        const mediaUrl = `https://graph.facebook.com/v20.0/${hashtagId}/top_media?user_id=me&fields=id,media_type,caption,permalink&limit=5&access_token=${accessToken}`;
        const mediaResponse = await fetch(mediaUrl);
        const mediaData: any = await mediaResponse.json();

        if (!mediaResponse.ok) {
            console.error(`Failed to fetch Instagram media for "${query}":`, mediaData.error?.message);
            return [];
        }

        return mediaData.data.map((post: any) => ({
            platform: 'Instagram' as const,
            text: post.caption || '',
            username: 'instagram_user',
            postUrl: post.permalink || 'https://www.instagram.com',
        }));

    } catch (error) {
        console.error(`Error fetching Instagram data for "${query}":`, error);
        return [];
    }
};

const fetchTwitterData = async (query: string) => {
    const bearerToken = process.env.X_BEARER_TOKEN;
    if (!bearerToken) {
        console.warn(`X_BEARER_TOKEN not found for query "${query}". Returning mock data.`);
        return [{ platform: 'Twitter' as const, text: `Mock tweet about ${query}! #mock`, username: 'mock_user', postUrl: 'https://twitter.com' }];
    }
    
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&tweet.fields=text,author_id,id&expansions=author_id&max_results=5`;
    
    try {
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${bearerToken}` } });
        const data: any = await response.json();
        
        if (!response.ok || !data.data) {
            console.error(`Failed to fetch Twitter data for "${query}":`, data.errors?.[0]?.message || 'Unknown error');
            return [];
        }
        
        const users = new Map(data.includes?.users?.map((user: any) => [user.id, user.username]) || []);
        
        return data.data.map((tweet: any) => ({
            platform: 'Twitter' as const,
            text: tweet.text || '',
            username: users.get(tweet.author_id) || 'twitter_user',
            postUrl: `https://twitter.com/${users.get(tweet.author_id) || 'i'}/status/${tweet.id}`,
        }));
    } catch (error) {
        console.error(`Error fetching Twitter data for "${query}":`, error);
        return [];
    }
};

const fetchRedditData = async (query: string) => {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=5&sort=hot`;
    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'node:firebase-studio-app:v1.0' } });
        if (!response.ok) {
            console.error('Failed to fetch Reddit data:', response.statusText);
            return [];
        }
        const data: any = await response.json();
        if (!data.data || !data.data.children) return [];
        
        return data.data.children.map((post: any) => ({
            platform: 'Reddit' as const,
            text: post.data.title || '',
            username: post.data.author || 'reddit_user',
            postUrl: `https://www.reddit.com${post.data.permalink}` || 'https://www.reddit.com',
        }));
    } catch (error) {
        console.error(`Error fetching Reddit data for "${query}":`, error);
        return [];
    }
};

const fetchTikTokData = async (query: string) => {
    console.warn(`TikTok API is not implemented for query "${query}". Returning mock data.`);
    return [
        { platform: 'TikTok' as const, text: `Check out this amazing ${query}! So cool! #fyp`, username: 'tiktok_trendsetter', postUrl: 'https://www.tiktok.com' },
    ];
};


const TrendingProductSchema = z.object({
  id: z.string().describe("A unique product ID, e.g., 'prod-001'"),
  name: z.string().describe('The name of the product.'),
  category: z.string().describe('The category the product belongs to.'),
  forecastedDemand: z.number().describe('The estimated weekly demand for this product.'),
  inventoryStatus: z.enum(['Optimal', 'Overstock', 'Understock']).describe('The current inventory status based on the trend.'),
  lastUpdated: z.string().describe("A human-readable string indicating when this data was generated, e.g., 'Just now' for live data or 'Generated by AI' for fallback data."),
  imageUrl: z.string().url().describe('A valid placeholder image URL from \'https://placehold.co\' with a size of 64x64.'),
  reviews: z.array(ProductReviewSchema).describe("A list of 2-3 of the most representative social media posts that signal this trend.")
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

You have been provided with a raw data stream of posts from Instagram, Twitter, Reddit, and TikTok.

Social Media Data:
{{{socialMediaData}}}

Based on this live data, analyze it to identify up to 10 of the most relevant and impactful product trends for Walmart. A higher mention count with positive sentiment should result in higher demand and an 'Understock' status.

For each of the products you identify, provide the following information:
- A unique product ID (e.g., prod-001, prod-002).
- The specific product name.
- A plausible Walmart category (e.g., Home Goods, Electronics, Apparel, Beauty, Groceries, Toys).
- A forecasted weekly demand as a number, reflecting its viral velocity.
- An inventory status: 'Understock' for new, explosive trends; 'Optimal' for established trends; 'Overstock' for fading trends.
- A lastUpdated string. Use 'Just now' as you are analyzing live data.
- A valid placeholder image URL from 'https://placehold.co' with a size of 64x64.
- A list of 2-3 of the most representative "reviews" (social media posts) from the provided data that justify why this product is trending. Each review must include the platform, text, username, and the exact postUrl provided in the source data. Do not alter the postUrl.

Return the list of products in the specified JSON format. You must include reviews for each product.`,
});


const trendingProductsFlow = ai.defineFlow(
  {
    name: 'trendingProductsFlow',
    outputSchema: TrendingProductsOutputSchema,
  },
  async () => {
    const topics = ['air fryer', 'skincare', 'running shoes', 'summer dress', 'gaming keyboard', 'protein powder'];
    let allPosts: any[] = [];

    for (const topic of topics) {
        const [instagram, twitter, reddit, tiktok] = await Promise.all([
            fetchInstagramData(topic),
            fetchTwitterData(topic),
            fetchRedditData(topic),
            fetchTikTokData(topic)
        ]);
        allPosts = [...allPosts, ...instagram, ...twitter, ...reddit, ...tiktok];
    }
    
    const uniquePosts = Array.from(new Map(allPosts.map(p => [p.text, p])).values());

    if (uniquePosts.length === 0) {
        console.log("No social media data fetched. Returning fallback data.");
        return getFallbackProducts();
    }
    
    const socialMediaData = JSON.stringify(uniquePosts, null, 2);
    
    console.log("-----BEGIN SOCIAL MEDIA ANALYSIS-----");
    console.log(`Sending ${uniquePosts.length} unique posts to the AI model.`);
    console.log("-----END SOCIAL MEDIA ANALYSIS-----");

    try {
        const {output} = await prompt({ socialMediaData });
        return output!;
    } catch (error) {
        console.error("AI call failed. This is likely due to API quota limits. Returning fallback data.", error);
        return getFallbackProducts();
    }
  }
);

function getFallbackProducts(): TrendingProductsOutput {
  return {
    products: [
      {
        id: 'fallback-001',
        name: 'Smart Water Bottle',
        category: 'Home Goods',
        forecastedDemand: 1500,
        inventoryStatus: 'Understock',
        lastUpdated: 'Generated by AI',
        imageUrl: 'https://placehold.co/64x64',
        reviews: [
          { platform: 'Instagram', text: 'Just got this smart water bottle and it is a game changer for my hydration goals! #smartbottle #healthyliving', username: 'health_guru_123', postUrl: 'https://www.instagram.com/p/C9_8y7xSj8A/' },
          { platform: 'TikTok', text: 'This bottle literally nags me to drink water. 10/10 would recommend. #techtok #hydration', username: 'gadgetgirl', postUrl: 'https://www.tiktok.com' }
        ],
      },
      {
        id: 'fallback-002',
        name: 'Noise-Cancelling Headphones',
        category: 'Electronics',
        forecastedDemand: 950,
        inventoryStatus: 'Optimal',
        lastUpdated: 'Generated by AI',
        imageUrl: 'https://placehold.co/64x64',
        reviews: [
            { platform: 'Twitter', text: 'Finally got my hands on these headphones. The noise cancellation is unreal!', username: 'musiclover_xyz', postUrl: 'https://twitter.com/Interior/status/1788574945131' },
            { platform: 'Reddit', text: 'r/headphones - After a month of use, I can say these are worth the hype. Great for studying.', username: 'studentlife', postUrl: 'https://www.reddit.com' }
        ],
      },
      {
        id: 'fallback-003',
        name: 'Linen Summer Dress',
        category: 'Apparel',
        forecastedDemand: 700,
        inventoryStatus: 'Optimal',
        lastUpdated: 'Generated by AI',
        imageUrl: 'https://placehold.co/64x64',
        reviews: [
            { platform: 'Instagram', text: 'This linen dress is my summer uniform. So breezy and chic! #summerfashion', username: 'style_by_jane', postUrl: 'https://www.instagram.com/p/C9-Xv9JRot_/' }
        ],
      },
      {
        id: 'fallback-004',
        name: 'Vitamin C Serum',
        category: 'Beauty',
        forecastedDemand: 2100,
        inventoryStatus: 'Understock',
        lastUpdated: 'Generated by AI',
        imageUrl: 'https://placehold.co/64x64',
        reviews: [
            { platform: 'Instagram', text: 'My skin has never been brighter since I started using this Vitamin C serum. A must have!', username: 'skincare_addict', postUrl: 'https://www.instagram.com/p/C-B8bYdRLhY/' },
            { platform: 'TikTok', text: 'Look at that glow! All thanks to this amazing serum. #vitaminc #skincareroutine', username: 'glowup_guide', postUrl: 'https://www.tiktok.com' }
        ],
      },
      {
        id: 'fallback-005',
        name: 'Portable Blender',
        category: 'Groceries',
        forecastedDemand: 1100,
        inventoryStatus: 'Overstock',
        lastUpdated: 'Generated by AI',
        imageUrl: 'https://placehold.co/64x64',
        reviews: [
          { platform: 'Twitter', text: 'Making smoothies on the go has never been easier with my new portable blender!', username: 'fitlife_frank', postUrl: 'https://twitter.com' }
        ],
      },
    ],
  };
}
