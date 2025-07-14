// This is an AI-powered application that analyzes real-time social media trends for specific products.

'use server';

/**
 * @fileOverview Analyzes real-time social media trends for specific products by fetching live data from Instagram, Twitter/X, and Reddit.
 *
 * - analyzeSocialTrends - Analyzes real-time social media trends for specific products.
 * - AnalyzeSocialTrendsInput - The input type for the analyzeSocialTrends function.
 * - AnalyzeSocialTrendsOutput - The return type for the analyzeSocialTrends function.
 */
'use server';
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

const fetchTwitterData = async (productName: string) => {
    const bearerToken = process.env.X_BEARER_TOKEN;
    if (!bearerToken) {
        console.warn("X_BEARER_TOKEN not found. Returning empty array.");
        return [];
    }
    
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(productName)}&tweet.fields=text,author_id,id&expansions=author_id&max_results=10`;
    
    try {
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${bearerToken}` } });
        const data: any = await response.json();
        
        if (!response.ok || !data.data) {
            console.error('Failed to fetch Twitter data:', data.errors?.[0]?.message || 'Unknown error');
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
        console.error('Error fetching Twitter data:', error);
        return [];
    }
};

const fetchRedditData = async (productName: string) => {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(productName)}&limit=10&sort=hot`;
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
            postUrl: `https://www.reddit.com${post.data.permalink || ''}`,
        }));
    } catch (error) {
        console.error('Error fetching Reddit data:', error);
        return [];
    }
};

const AnalyzeSocialTrendsInputSchema = z.object({
  productName: z.string().describe('The name of the product to analyze.'),
});
export type AnalyzeSocialTrendsInput = z.infer<typeof AnalyzeSocialTrendsInputSchema>;

export const AnalyzeSocialTrendsOutputSchema = z.object({
  overallSentiment: z
    .string()
    .describe('The overall sentiment towards the product.'),
  trendingTopics: z
    .array(z.string())
    .describe('The trending topics related to the product.'),
  volume: z.number().describe('The volume of mentions of the product.'),
  sentimentBreakdown: z.object({
    Twitter: z.object({ positive: z.number(), negative: z.number(), neutral: z.number() }),
    Reddit: z.object({ positive: z.number(), negative: z.number(), neutral: z.number() }),
  }).describe('Sentiment breakdown by platform with specific sentiment values.'),
}).describe('The output of the social media trend analysis.');
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
      Twitter: { positive: 0, negative: 0, neutral: 0 },
      Reddit: { positive: 0, negative: 0, neutral: 0 },
    };
    

    const trendingTopics = new Set<string>();

    const [twitterData, redditData] = await Promise.all([ // Removed Instagram and TikTok
        fetchTwitterData(productName),
        fetchRedditData(productName),
    ]);

    const allData = [...twitterData, ...redditData]; // Removed instagramData and tiktokData
    let totalMentions = 0;

    for (const item of allData) {
      totalMentions++;
      const text = item.text || '';
      if (text) {
        const score = analyzeSentiment(text);
        if (score >= 0.05) {
          const platform = item.platform as keyof AnalyzeSocialTrendsOutput['sentimentBreakdown'];
          sentimentBreakdown[platform].positive++;
        } else if (score <= -0.05) {
          sentimentBreakdown[item.platform as keyof AnalyzeSocialTrendsOutput['sentimentBreakdown']].negative++;
        } else {
          sentimentBreakdown[item.platform as keyof AnalyzeSocialTrendsOutput['sentimentBreakdown']].neutral++;
        }
        
        const topics = analyzeText(text);
        topics.forEach(topic => trendingTopics.add(topic));
      }
    }

    const overallSentiment = calculateOverallSentiment(sentimentBreakdown);

    return {
      overallSentiment,
      trendingTopics: Array.from(trendingTopics),
      volume: totalMentions,
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
