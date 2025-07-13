// This is an AI-powered application that analyzes real-time social media trends for specific products.

'use server';

/**
 * @fileOverview Analyzes real-time social media trends for specific products by fetching live data from Instagram.
 *
 * - analyzeSocialTrends - Analyzes real-time social media trends for specific products.
 * - AnalyzeSocialTrendsInput - The input type for the analyzeSocialTrends function.
 * - AnalyzeSocialTrendsOutput - The return type for the analyzeSocialTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import vader from 'vader-sentiment';
import fetch from 'node-fetch';

const analyzeSentiment = (text: string): number => {
    if (!text) return 0;
    const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(text);
    return intensity.compound;
};

const analyzeText = (text: string): string[] => {
  if (!text) return [];
  // simple topic extraction using regex for hashtags
  return text.toLowerCase().match(/#\w+/g)?.map(tag => tag.substring(1)) || [];
}

/**
 * Fetches recent top media for a given hashtag from the Instagram Graph API.
 * NOTE: This requires a valid User Access Token with the necessary permissions.
 * The hashtag must be associated with the user's Instagram Business Account.
 * A placeholder is returned if the API token is not configured.
 */
const fetchInstagramData = async (productName: string) => {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!accessToken) {
        console.warn("INSTAGRAM_ACCESS_TOKEN not found. Returning mock data. Please add it to your .env file.");
        // Return a single mock item so the app doesn't show an empty state.
        return [
            { text: `This is a sample post for ${productName}. Configure the API key to see live data. #sample`, username: 'preview_user', postUrl: '#' },
        ];
    }
    
    // 1. Get the ID for the hashtag
    const sanitizedProductName = productName.replace(/\s+/g, '').toLowerCase();
    const searchUrl = `https://graph.facebook.com/v20.0/ig_hashtag_search?user_id=me&q=${sanitizedProductName}&access_token=${accessToken}`;
    
    try {
        const searchResponse = await fetch(searchUrl);
        const searchData: any = await searchResponse.json();

        if (!searchResponse.ok || !searchData.data || searchData.data.length === 0) {
            console.error('Failed to find Instagram hashtag or no data available:', searchData.error?.message || 'No hashtag found.');
            return [];
        }
        
        const hashtagId = searchData.data[0].id;

        // 2. Get recent top media for that hashtag
        const mediaUrl = `https://graph.facebook.com/v20.0/${hashtagId}/top_media?user_id=me&fields=id,media_type,caption,permalink&limit=10&access_token=${accessToken}`;
        const mediaResponse = await fetch(mediaUrl);
        const mediaData: any = await mediaResponse.json();

        if (!mediaResponse.ok) {
            console.error('Failed to fetch Instagram media:', mediaData.error?.message);
            return [];
        }

        return mediaData.data.map((post: any) => ({
            text: post.caption || '',
            username: 'instagram_user', // Username is not available from this endpoint
            postUrl: post.permalink || '#',
        }));

    } catch (error) {
        console.error('Error fetching Instagram data:', error);
        return [];
    }
};


const AnalyzeSocialTrendsInputSchema = z.object({
  productName: z.string().describe('The name of the product to analyze.'),
});
export type AnalyzeSocialTrendsInput = z.infer<
  typeof AnalyzeSocialTrendsInputSchema
>;

const AnalyzeSocialTrendsOutputSchema = z.object({
  overallSentiment: z
    .string()
    .describe('The overall sentiment towards the product.'),
  trendingTopics: z
    .array(z.string())
    .describe('The trending topics related to the product.'),
  volume: z.number().describe('The volume of mentions of the product.'),
  sentimentBreakdown: z.object({
    Instagram: z.object({
      positive: z.number(),
      negative: z.number(),
      neutral: z.number(),
    }),
  }).describe('Sentiment breakdown by platform with specific sentiment values.'),
});
export type AnalyzeSocialTrendsOutput = z.infer<
  typeof AnalyzeSocialTrendsOutputSchema
>;


export async function analyzeSocialTrends(
  input: AnalyzeSocialTrendsInput
): Promise<AnalyzeSocialTrendsOutput> {
  return analyzeSocialTrendsFlow(input);
}

const analyzeSocialTrendsFlow = ai.defineFlow(
  {
    name: 'analyzeSocialTrendsFlow',
    inputSchema: AnalyzeSocialTrendsInputSchema,
    outputSchema: AnalyzeSocialTrendsOutputSchema,
  },
  async input => {
    const { productName } = input;
    
    const sentimentBreakdown: AnalyzeSocialTrendsOutput["sentimentBreakdown"] = {
      Instagram: { positive: 0, negative: 0, neutral: 0 },
    };

    const trendingTopics = new Set<string>();

    const data = await fetchInstagramData(productName);

    let positive = 0;
    let negative = 0;
    let neutral = 0;

    for (const item of data) {
      const text = item.text || '';
      if (text) {
        const score = analyzeSentiment(text);
        if (score >= 0.05) {
          positive++;
        } else if (score <= -0.05) {
          negative++;
        } else {
          neutral++;
        }
        
        const topics = analyzeText(text);
        topics.forEach(topic => trendingTopics.add(topic));
      }
    }
    
    sentimentBreakdown.Instagram = { positive, negative, neutral };

    const overallSentiment = calculateOverallSentiment(sentimentBreakdown);

    return {
      overallSentiment,
      trendingTopics: Array.from(trendingTopics),
      volume: data.length,
      sentimentBreakdown,
    };
  }
);

function calculateOverallSentiment(sentimentBreakdown: AnalyzeSocialTrendsOutput["sentimentBreakdown"]): string {
  const totalPositive = Object.values(sentimentBreakdown).reduce((sum, platform) => sum + platform.positive, 0);
  const totalNegative = Object.values(sentimentBreakdown).reduce((sum, platform) => sum + platform.negative, 0);
  
  if (totalPositive > totalNegative) return 'positive';
  if (totalNegative > totalPositive) return 'negative';
  return 'neutral';
}
