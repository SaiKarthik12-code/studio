// This is an AI-powered application that analyzes real-time social media trends for specific products.

'use server';

/**
 * @fileOverview Analyzes real-time social media trends for specific products.
 *
 * - analyzeSocialTrends - Analyzes real-time social media trends for specific products.
 * - AnalyzeSocialTrendsInput - The input type for the analyzeSocialTrends function.
 * - AnalyzeSocialTrendsOutput - The return type for the analyzeSocialTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  sentimentBreakdown: z
    .record(z.string(), z.number())
    .describe('Sentiment breakdown by platform (positive, negative, neutral).'),
});
export type AnalyzeSocialTrendsOutput = z.infer<
  typeof AnalyzeSocialTrendsOutputSchema
>;

export async function analyzeSocialTrends(
  input: AnalyzeSocialTrendsInput
): Promise<AnalyzeSocialTrendsOutput> {
  return analyzeSocialTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSocialTrendsPrompt',
  input: {schema: AnalyzeSocialTrendsInputSchema},
  output: {schema: AnalyzeSocialTrendsOutputSchema},
  prompt: `You are a social media analyst tasked with identifying trending products.

  Analyze real-time social media trends for {{productName}} on the following platforms: {{socialMediaPlatforms}} over the past {{timeframe}}.

  Identify the overall sentiment towards the product (positive, negative, or neutral).
  List the trending topics related to the product.
  Determine the volume of mentions of the product.
  Provide a sentiment breakdown by platform (positive, negative, neutral).

  Return the information in JSON format.
  `,
});

const analyzeSocialTrendsFlow = ai.defineFlow(
  {
    name: 'analyzeSocialTrendsFlow',
    inputSchema: AnalyzeSocialTrendsInputSchema,
    outputSchema: AnalyzeSocialTrendsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
