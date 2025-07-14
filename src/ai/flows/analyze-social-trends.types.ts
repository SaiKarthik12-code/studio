// src/ai/flows/analyze-social-trends.types.ts
import { z } from 'zod';

export const AnalyzeSocialTrendsInputSchema = z.object({
  productName: z.string().describe('The name of the product to analyze.'),
});
export type AnalyzeSocialTrendsInput = z.infer<
  typeof AnalyzeSocialTrendsInputSchema
>;

export const AnalyzeSocialTrendsOutputSchema = z.object({
  overallSentiment: z
    .string()
    .describe('The overall sentiment towards the product.'),
  trendingTopics: z
    .array(z.string())
    .describe('The trending topics related to the product.'),
  volume: z.number().describe('The volume of mentions of the product.'),
  sentimentBreakdown: z
    .object({
      Twitter: z.object({
        positive: z.number(),
        negative: z.number(),
        neutral: z.number(),
      }),
      Reddit: z.object({
        positive: z.number(),
        negative: z.number(),
        neutral: z.number(),
      }),
      Instagram: z.object({
        positive: z.number(),
        negative: z.number(),
        neutral: z.number(),
      }),
      TikTok: z.object({
        positive: z.number(),
        negative: z.number(),
        neutral: z.number(),
      }),
    })
    .describe('Sentiment breakdown by platform.'),
});
export type AnalyzeSocialTrendsOutput = z.infer<
  typeof AnalyzeSocialTrendsOutputSchema
>;
