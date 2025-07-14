'use server';

/**
 * @fileOverview Analyzes real-time social media trends for specific products by fetching live data from Twitter/X and Reddit.
 */

import { ai } from '@/ai/genkit';
import vader from 'vader-sentiment';
import fetch from 'node-fetch';
import {
  AnalyzeSocialTrendsInput,
  AnalyzeSocialTrendsInputSchema,
  AnalyzeSocialTrendsOutput,
  AnalyzeSocialTrendsOutputSchema,
} from './analyze-social-trends.types';

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
  platform: 'Twitter' | 'Reddit' | 'Instagram' | 'TikTok';
  text: string;
  username: string;
  postUrl: string;
}

const fetchTwitterData = async (productName: string): Promise<SocialDataItem[]> => {
  const bearerToken = process.env.X_BEARER_TOKEN;
  if (!bearerToken) {
    console.warn("X_BEARER_TOKEN not found. Returning empty array for Twitter.");
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
      return [];
    }

    const users = new Map((data.includes?.users || []).map((user: any) => [user.id, user.username]));

    return data.data.map((tweet: any): SocialDataItem => ({
      platform: 'Twitter',
      text: tweet.text || '',
      username: users.get(tweet.author_id) || 'twitter_user',
      postUrl: `https://twitter.com/${users.get(tweet.author_id) || 'i'}/status/${tweet.id}`,
    }));
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
    console.warn("Reddit credentials missing. Returning empty array for Reddit.");
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
      text: post.data?.title || '',
      username: post.data?.author || 'reddit_user',
      postUrl: `https://www.reddit.com${post.data?.permalink || ''}`,
    }));
  } catch (error) {
    console.error('Error fetching Reddit data:', error instanceof Error ? error.message : error);
    return [];
  }
};

const fetchInstagramData = async (productName: string): Promise<SocialDataItem[]> => {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!accessToken) {
        console.warn("INSTAGRAM_ACCESS_TOKEN not found. Returning empty array for Instagram.");
        return [];
    }
    // This is a simplified simulation as Instagram's public API is limited.
    // In a real scenario, you'd use the Graph API for hashtag searches.
    return [
        { platform: 'Instagram', text: `Loving my new ${productName}! #ad`, username: 'influencer123', postUrl: 'https://www.instagram.com/p/C8_somepostid/' },
        { platform: 'Instagram', text: `Is the ${productName} worth the hype?`, username: 'tech_reviewer', postUrl: 'https://www.instagram.com/p/C8_anotherpost/' },
    ];
};

const fetchTikTokData = async (productName: string): Promise<SocialDataItem[]> => {
    // TikTok's API is restrictive; this is a simulated endpoint.
    return [
        { platform: 'TikTok', text: `${productName} unboxing! #viral`, username: 'tiktok_star', postUrl: 'https://www.tiktok.com/t/ZPRvy_someid/' },
        { platform: 'TikTok', text: `My honest review of the ${productName}`, username: 'user98765', postUrl: 'https://www.tiktok.com/t/ZPRvy_anotherid/' },
    ];
};


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
    Instagram: { positive: 0, negative: 0, neutral: 0 },
    TikTok: { positive: 0, negative: 0, neutral: 0 },
  };

  const trendingTopics = new Set<string>();

  const [twitterData, redditData, instagramData, tiktokData] = await Promise.all([
    fetchTwitterData(productName),
    fetchRedditData(productName),
    fetchInstagramData(productName),
    fetchTikTokData(productName),
  ]);

  const allData: SocialDataItem[] = [...twitterData, ...redditData, ...instagramData, ...tiktokData];
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
