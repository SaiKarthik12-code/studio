// src/ai/flows/estimate-new-product-demand.ts
'use server';
/**
 * @fileOverview Estimates the demand for a new product using transfer learning based on similar products and social media trends.
 *
 * - estimateNewProductDemand - A function that handles the estimation of demand for a new product.
 * - EstimateNewProductDemandInput - The input type for the estimateNewProductDemand function.
 * - EstimateNewProductDemandOutput - The return type for the estimateNewProductDemand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateNewProductDemandInputSchema = z.object({
  newProductName: z.string().describe('The name of the new product.'),
  similarProductNames: z.array(z.string()).describe('A list of names of similar products with existing sales history.'),
  socialMediaTrends: z.string().describe('A summary of current social media trends related to the product category.'),
  posData: z.string().optional().describe('Point of sale data for similar products, if available.'),
  weatherData: z.string().optional().describe('Weather data for the relevant locations, if available.'),
  locationData: z.string().optional().describe('Location data for the stores, if available.'),
});

export type EstimateNewProductDemandInput = z.infer<typeof EstimateNewProductDemandInputSchema>;

const EstimateNewProductDemandOutputSchema = z.object({
  estimatedDemand: z.number().describe('The estimated demand for the new product.'),
  explanation: z.string().describe('An explanation of how the demand was estimated.'),
});

export type EstimateNewProductDemandOutput = z.infer<typeof EstimateNewProductDemandOutputSchema>;

export async function estimateNewProductDemand(input: EstimateNewProductDemandInput): Promise<EstimateNewProductDemandOutput> {
  return await estimateNewProductDemandFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateNewProductDemandPrompt',
  input: {schema: EstimateNewProductDemandInputSchema},
  output: {schema: EstimateNewProductDemandOutputSchema},
  prompt: `You are an expert in demand forecasting, especially for new products with no prior sales history.

  You will use transfer learning, leveraging data from similar products and current social media trends, to estimate the demand for a new product.

  New Product Name: {{{newProductName}}}
  Similar Products: {{{similarProductNames}}}
  Social Media Trends: {{{socialMediaTrends}}}
  POS Data (if available): {{{posData}}}
  Weather Data (if available): {{{weatherData}}}
  Location Data (if available): {{{locationData}}}

  Based on this information, provide an estimate of the demand for the new product and explain your reasoning.
  Format your output as JSON according to the schema.  Make sure to include the units for estimatedDemand.
  Be conservative in your estimate.
  `, 
});

const estimateNewProductDemandFlow = ai.defineFlow(
  {
    name: 'estimateNewProductDemandFlow',
    inputSchema: EstimateNewProductDemandInputSchema,
    outputSchema: EstimateNewProductDemandOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);

if (!output) {
  console.error('Prompt returned undefined');
  throw new Error('Prompt execution failed');
}

return output;

  }
);
