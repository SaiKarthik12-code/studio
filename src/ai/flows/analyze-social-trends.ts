'use server';

/**
 * @fileOverview Analyzes real-time social media trends for specific products by fetching live data from Twitter/X and Reddit.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import vader from 'vader-sentiment';
import fetch from 'node-fetch';

const analyzeSentiment = (text: string): number => {
  if (!text) return 0;
  const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(text);
  return intensity.compound;
};

const analyzeText = (text: string): string[] => {
  if (!text) return [];
  return text.toLowerCase().match(/#\w+/g)?.map(tag => tag.substring(1)) || [];
};

interface SocialDataItem {
  platform: 'Twitter' | 'Reddit';
  text: string;
  username: string;
  postUrl: string;
}

const fetchTwitterData = async (productName: string): Promise<SocialDataItem[]> => {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  if (!bearerToken) {
    console.warn("TWITTER_BEARER_TOKEN not found. Returning empty array.");
    return [];
  }

  const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(productName)}&tweet.fields=text,author_id,id&expansions=author_id&max_results=10`;

  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${bearerToken}` }
    });
    const data = await response.json() as any;

    if (!response.ok || !data.data) {
      console.error(`Failed to fetch Twitter data: Status ${response.status}, Body: ${JSON.stringify(data)}`);
      console.error('Twitter API error details:', data.errors?.[0]?.message || 'No specific error message');
      return [];
    }

    const usersMap = new Map((data.includes?.users || []).map((user: any) => [user.id, user.username]));

    return data.data.map((tweet: any): SocialDataItem => {
      const rawUsername = usersMap.get(tweet.author_id);
      const username = typeof rawUsername === 'string' ? rawUsername : 'twitter_user';

      return {
        platform: 'Twitter',
        text: typeof tweet.text === 'string' ? tweet.text : '',
        username,
        postUrl: `https://twitter.com/${username}/status/${tweet.id}`,
      };
    });
  } catch (error) {
    console.error('Error fetching Twitter data:', error instanceof Error ? error.message : error);
    return [];
  }
};

const fetchRedditData = async (productName: string): Promise<SocialDataItem[]> => {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const userAgent = process.env.REDDIT_USER_AGENT || 'TrendSense/0.1 by yourusername';

  if (!clientId || !clientSecret) {
    console.warn("Reddit credentials missing. Returning empty array.");
    return [];
  }

  try {
    const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    const tokenJson = await tokenRes.json() as any;
    const accessToken = tokenJson.access_token;
    if (!accessToken) {
      console.error('Failed to get Reddit access token:', tokenJson);
      return [];
    }

    const searchUrl = `https://oauth.reddit.com/search?q=${encodeURIComponent(productName)}&limit=10&sort=hot`;
    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': userAgent
      }
    });
    const data = await response.json() as any;

    if (!response.ok || !data.data || !data.data.children) {
      console.error(`Failed to fetch Reddit data: Status ${response.status}, Body: ${JSON.stringify(data)}`);
      return [];
    }

    return data.data.children.map((post: any): SocialDataItem => ({
      platform: 'Reddit',
      text: typeof post.data?.title === 'string' ? post.data.title : '',
      username: typeof post.data?.author === 'string' ? post.data.author : 'reddit_user',
      postUrl: `https://www.reddit.com${typeof post.data?.permalink === 'string' ? post.data.permalink : ''}`,
    }));
  } catch (error) {
    console.error('Error fetching Reddit data:', error instanceof Error ? error.message : error);
    return [];
  }
};

const AnalyzeSocialTrendsInputSchema = z.object({
  productName: z.string().describe('The name of the product to analyze.')
});
export type AnalyzeSocialTrendsInput = z.infer<typeof AnalyzeSocialTrendsInputSchema>;

export const AnalyzeSocialTrendsOutputSchema = z.object({
  overallSentiment: z.string().describe('The overall sentiment towards the product.'),
  trendingTopics: z.array(z.string()).describe('The trending topics related to the product.'),
  volume: z.number().describe('The volume of mentions of the product.'),
  sentimentBreakdown: z.object({
    Twitter: z.object({ positive: z.number(), negative: z.number(), neutral: z.number() }),
    Reddit: z.object({ positive: z.number(), negative: z.number(), neutral: z.number() }),
  }).describe('Sentiment breakdown by platform.')
});
export type AnalyzeSocialTrendsOutput = z.infer<typeof AnalyzeSocialTrendsOutputSchema>;

export async function analyzeSocialTrends(input: AnalyzeSocialTrendsInput): Promise<AnalyzeSocialTrendsOutput> {
  return analyzeSocialTrendsFlow(input);
}

const analyzeSocialTrendsFlow = ai.defineFlow({
  name: 'analyzeSocialTrendsFlow',
  inputSchema: AnalyzeSocialTrendsInputSchema,
  outputSchema: AnalyzeSocialTrendsOutputSchema,
}, async (input) => {
  const { productName } = input;

  const sentimentBreakdown: AnalyzeSocialTrendsOutput["sentimentBreakdown"] = {
    Twitter: { positive: 0, negative: 0, neutral: 0 },
    Reddit: { positive: 0, negative: 0, neutral: 0 },
  };

  const trendingTopics = new Set<string>();

  const [twitterData, redditData] = await Promise.all([
    fetchTwitterData(productName),
    fetchRedditData(productName),
  ]);

  const allData: SocialDataItem[] = [...twitterData, ...redditData];
  let totalMentions = 0;

  for (const item of allData) {
    totalMentions++;
    const score = analyzeSentiment(item.text || '');
    const platform = item.platform;

    if (score >= 0.05) {
      sentimentBreakdown[platform].positive++;
    } else if (score <= -0.05) {
      sentimentBreakdown[platform].negative++;
    } else {
      sentimentBreakdown[platform].neutral++;
    }

    analyzeText(item.text).forEach(topic => trendingTopics.add(topic));
  }

  const overallSentiment = calculateOverallSentiment(sentimentBreakdown);

  return {
    overallSentiment,
    trendingTopics: Array.from(trendingTopics),
    volume: totalMentions,
    sentimentBreakdown,
  };
});

function calculateOverallSentiment(sentimentBreakdown: AnalyzeSocialTrendsOutput["sentimentBreakdown"]): string {
  const totalPositive = Object.values(sentimentBreakdown).reduce((sum, platform) => sum + platform.positive, 0);
  const totalNegative = Object.values(sentimentBreakdown).reduce((sum, platform) => sum + platform.negative, 0);
  if (totalPositive > totalNegative) return 'positive';
  if (totalNegative > totalPositive) return 'negative';
  return 'neutral';
}
