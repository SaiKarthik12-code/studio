// This is an AI-powered application that analyzes real-time social media trends for specific products.

'use server';

/**
 * @fileOverview Analyzes real-time social media trends for specific products by fetching live data.
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
 * Fetches data from X (formerly Twitter).
 * In a real application, you would use your actual bearer token.
 */
const fetchTwitterData = async (productName: string) => {
    const X_BEARER_TOKEN = process.env.X_BEARER_TOKEN;
    if (!X_BEARER_TOKEN) {
        console.log("X_BEARER_TOKEN not found, returning mock data.");
        return [{ text: `Just got the ${productName}, it's okay. #review` }];
    }
    
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(productName)}&max_results=10`;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${X_BEARER_TOKEN}` }
        });
        if (!response.ok) {
            console.error(`Twitter API error: ${response.statusText}`);
            return [];
        }
        const data: any = await response.json();
        return data.data || [];
    } catch (error) {
        console.error("Failed to fetch from Twitter:", error);
        return [];
    }
};

/**
 * Fetches data from Reddit.
 */
const fetchRedditData = async (productName: string) => {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(productName)}&limit=10`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Reddit API error: ${response.statusText}`);
            return [];
        }
        const data: any = await response.json();
        return data.data?.children?.map((post: any) => ({ text: post.data.title })) || [];
    } catch (error) {
        console.error("Failed to fetch from Reddit:", error);
        return [];
    }
};


/**
 * NOTE FOR HACKATHON:
 * The following functions simulate calls to APIs that require complex authentication
 * or browser automation (like Puppeteer), which is difficult to run in this environment.
 * You would replace the mock data with actual API calls in a full implementation.
 */
const fetchTikTokData = async (productName: string) => {
    console.log(`Simulating TikTok API call for "${productName}"...`);
    // REAL IMPLEMENTATION would use Puppeteer or TikTok's API.
    return [{ text: `Love the ${productName}! #musthave` }];
};

const fetchInstagramData = async (productName: string) => {
    console.log(`Simulating Instagram API call for "${productName}"...`);
    // REAL IMPLEMENTATION would use the Instagram Graph API.
    return [{ text: `New ${productName} is amazing! #favorite` }];
};


const AnalyzeSocialTrendsInputSchema = z.object({
  productName: z.string().describe('The name of the product to analyze.'),
  socialMediaPlatforms: z
    .array(z.enum(['TikTok', 'Instagram', 'X', 'Reddit']))
    .describe('The social media platforms to analyze.'),
  timeframe: z
    .string()
    .default('7d')
    .describe(
      'The timeframe for the analysis, e.g., 1h, 1d, 7d, 30d. Defaults to 7d.'
    ),
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
    TikTok: z.object({
      positive: z.number(),
      negative: z.number(),
      neutral: z.number(),
    }),
    Instagram: z.object({
      positive: z.number(),
      negative: z.number(),
      neutral: z.number(),
    }),
    X: z.object({
      positive: z.number(),
      negative: z.number(),
      neutral: z.number(),
    }),
    Reddit: z.object({
      positive: z.number(),
      negative: z.number(),
      neutral: z.number(),
    })
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
    const { productName, socialMediaPlatforms } = input;
    
    const sentimentBreakdown: AnalyzeSocialTrendsOutput["sentimentBreakdown"] = {
      TikTok: { positive: 0, negative: 0, neutral: 0 },
      Instagram: { positive: 0, negative: 0, neutral: 0 },
      X: { positive: 0, negative: 0, neutral: 0 },
      Reddit: { positive: 0, negative: 0, neutral: 0 },
    };

    let totalMentions = 0;
    const trendingTopics = new Set<string>();

    for (const platform of socialMediaPlatforms) {
      let data: any[] = [];
      switch (platform) {
        case 'TikTok':
          data = await fetchTikTokData(productName);
          break;
        case 'Instagram':
          data = await fetchInstagramData(productName);
          break;
        case 'X':
          data = await fetchTwitterData(productName);
          break;
        case 'Reddit':
          data = await fetchRedditData(productName);
          break;
      }

      totalMentions += data.length;

      let positive = 0;
      let negative = 0;
      let neutral = 0;

      for (const item of data) {
        const text = item.text || item.caption || item.title;
        if (text) {
          const score = analyzeSentiment(text);
          // VADER sentiment scores:
          // positive sentiment: compound score >= 0.05
          // neutral sentiment: (compound score > -0.05) and (compound score < 0.05)
          // negative sentiment: compound score <= -0.05
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

      sentimentBreakdown[platform as keyof typeof sentimentBreakdown] = { positive, negative, neutral };
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
