// This is an AI-powered application that analyzes real-time social media trends for specific products.

'use server';

/**
 * @fileOverview Analyzes real-time social media trends for specific products by fetching live data from Instagram (simulated).
 *
 * - analyzeSocialTrends - Analyzes real-time social media trends for specific products.
 * - AnalyzeSocialTrendsInput - The input type for the analyzeSocialTrends function.
 * - AnalyzeSocialTrendsOutput - The return type for the analyzeSocialTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import vader from 'vader-sentiment';

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
 * NOTE FOR HACKATHON:
 * The following function simulates a call to the Instagram API which requires complex authentication.
 * You would replace the mock data with actual API calls in a full implementation.
 */
const fetchInstagramData = async (productName: string) => {
    console.log(`Simulating Instagram API call for "${productName}"...`);
    // REAL IMPLEMENTATION would use the Instagram Graph API.
    return [
        { text: `New ${productName} is amazing! #favorite`, username: 'insta_user1', postUrl: '#' },
        { text: `Obsessed with the ${productName}`, username: 'style_guru', postUrl: '#' },
        { text: `Just got the ${productName}, so good! #musthave`, username: 'product_fan', postUrl: '#' },
    ];
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
