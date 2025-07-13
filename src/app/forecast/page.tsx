'use client';

import { useState } from 'react';
import {
  generateProductDemandForecast,
  GenerateProductDemandForecastOutput,
} from '@/ai/flows/generate-product-demand-forecast';
import {
  estimateNewProductDemand,
  EstimateNewProductDemandOutput,
} from '@/ai/flows/estimate-new-product-demand';
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { BrainCircuit, Loader2 } from 'lucide-react';

export default function ForecastPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newProductResult, setNewProductResult] = useState<EstimateNewProductDemandOutput | null>(null);
  const [existingProductResult, setExistingProductResult] = useState<GenerateProductDemandForecastOutput | null>(null);

  const handleNewProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProductName = formData.get('newProductName') as string;
    const similarProductNames = (formData.get('similarProductNames') as string).split(',').map(s => s.trim());
    const socialMediaTrends = formData.get('socialMediaTrends') as string;

    setIsLoading(true);
    setError(null);
    setNewProductResult(null);

    try {
      const result = await estimateNewProductDemand({
        newProductName,
        similarProductNames,
        socialMediaTrends,
      });
      setNewProductResult(result);
    } catch (err) {
      setError('Failed to estimate demand. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExistingProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productName = formData.get('productName') as string;
    const socialMediaTrends = formData.get('socialMediaTrends') as string;
    const historicalSalesData = formData.get('historicalSalesData') as string;
    const weatherData = formData.get('weatherData') as string;
    const locationData = formData.get('locationData') as string;

    setIsLoading(true);
    setError(null);
    setExistingProductResult(null);
    
    try {
      const result = await generateProductDemandForecast({
        productName,
        socialMediaTrends,
        historicalSalesData,
        weatherData,
        locationData,
      });
      setExistingProductResult(result);
    } catch (err) {
      setError('Failed to generate forecast. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader
        title="AI Demand Forecaster"
        description="Generate demand forecasts using transfer learning and multi-source data integration."
      />
      <Tabs defaultValue="new-product" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new-product">New Product</TabsTrigger>
          <TabsTrigger value="existing-product">Existing Product</TabsTrigger>
        </TabsList>

        <TabsContent value="new-product">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>New Product Forecast</CardTitle>
                <CardDescription>Estimate demand for products with no sales history using transfer learning.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNewProductSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newProductName">New Product Name</Label>
                    <Input id="newProductName" name="newProductName" defaultValue="Smart Water Bottle" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="similarProductNames">Similar Products (comma-separated)</Label>
                    <Input id="similarProductNames" name="similarProductNames" defaultValue="Yeti Tumbler, Hydro Flask" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialMediaTrends">Social Media Trends</Label>
                    <Textarea id="socialMediaTrends" name="socialMediaTrends" placeholder="Paste summary of social trends..." defaultValue="Increased interest in hydration and tech gadgets on TikTok." />
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Estimate Demand
                  </Button>
                </form>
              </CardContent>
            </Card>
            <div className="flex items-center justify-center">
              {isLoading && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
              {error && !isLoading && <div className="text-destructive">{error}</div>}
              {newProductResult && !isLoading && (
                 <Card className="w-full">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                        <div className="rounded-full bg-primary/10 p-3">
                            <BrainCircuit className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle>AI Forecast Result</CardTitle>
                            <CardDescription>Demand estimate for {newProductResult.estimatedDemand.toLocaleString()} units</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-4xl font-bold">{newProductResult.estimatedDemand.toLocaleString()} units</div>
                        <p className="text-sm text-muted-foreground">{newProductResult.explanation}</p>
                    </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="existing-product">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Existing Product Forecast</CardTitle>
                <CardDescription>Generate a detailed forecast by integrating multiple data sources.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleExistingProductSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="productName">Product Name</Label>
                        <Input id="productName" name="productName" defaultValue="Organic Avocadoes (4-pack)" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="socialMediaTrends">Social Media Trends</Label>
                        <Textarea id="socialMediaTrends" name="socialMediaTrends" placeholder="e.g., #avocadotoast trending..." defaultValue="'Avocado toast' and 'healthy fats' are trending on Instagram."/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="historicalSalesData">Historical Sales Data</Label>
                        <Textarea id="historicalSalesData" name="historicalSalesData" placeholder="Paste historical sales data..." defaultValue="Average 800 units/week, with a 15% spike during summer."/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="weatherData">Weather Data</Label>
                        <Input id="weatherData" name="weatherData" placeholder="e.g., Sunny, 75°F" defaultValue="Forecast of sunny weather, average 75°F."/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="locationData">Location Data</Label>
                        <Input id="locationData" name="locationData" placeholder="e.g., Urban, high-income" defaultValue="Urban store near multiple gyms."/>
                    </div>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Forecast
                  </Button>
                </form>
              </CardContent>
            </Card>
            <div className="flex items-center justify-center">
              {isLoading && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
              {error && !isLoading && <div className="text-destructive">{error}</div>}
              {existingProductResult && !isLoading && (
                 <Card className="w-full">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                         <div className="rounded-full bg-primary/10 p-3">
                            <BrainCircuit className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle>AI Forecast Result</CardTitle>
                            <CardDescription>Generated demand forecast</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <p className="text-sm text-muted-foreground">{existingProductResult.demandForecast}</p>
                    </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
