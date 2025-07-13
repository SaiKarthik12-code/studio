// src/ai/flows/generate-product-demand-forecast.ts
'use server';
/**
 * @fileOverview Generates a demand forecast for a specific product, incorporating social media trends, historical sales data, weather data, and location data.
 *
 * - generateProductDemandForecast - A function that handles the demand forecasting process.
 * - GenerateProductDemandForecastInput - The input type for the generateProductDemandForecast function.
 * - GenerateProductDemandForecastOutput - The return type for the generateProductDemandForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDemandForecastInputSchema = z.object({
  productName: z.string().describe('The name of the product to forecast demand for.'),
  socialMediaTrends: z.string().describe('Social media trends related to the product.'),
  historicalSalesData: z.string().describe('Historical sales data for the product.'),
  weatherData: z.string().describe('Weather data for the location.'),
  locationData: z.string().describe('Location data for the product.'),
});
export type GenerateProductDemandForecastInput = z.infer<typeof GenerateProductDemandForecastInputSchema>;

const GenerateProductDemandForecastOutputSchema = z.object({
  demandForecast: z.string().describe('The demand forecast for the product.'),
});
export type GenerateProductDemandForecastOutput = z.infer<typeof GenerateProductDemandForecastOutputSchema>;

export async function generateProductDemandForecast(input: GenerateProductDemandForecastInput): Promise<GenerateProductDemandForecastOutput> {
  return generateProductDemandForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDemandForecastPrompt',
  input: {schema: GenerateProductDemandForecastInputSchema},
  output: {schema: GenerateProductDemandForecastOutputSchema},
  prompt: `You are an expert demand forecaster. Generate a demand forecast for the following product, incorporating the provided social media trends, historical sales data, weather data, and location data.\n\nProduct Name: {{{productName}}}\nSocial Media Trends: {{{socialMediaTrends}}}\nHistorical Sales Data: {{{historicalSalesData}}}\nWeather Data: {{{weatherData}}}\nLocation Data: {{{locationData}}}\n\nDemand Forecast:`, // Removed the code that might be interpretted as code.
});

const generateProductDemandForecastFlow = ai.defineFlow(
  {
    name: 'generateProductDemandForecastFlow',
    inputSchema: GenerateProductDemandForecastInputSchema,
    outputSchema: GenerateProductDemandForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
