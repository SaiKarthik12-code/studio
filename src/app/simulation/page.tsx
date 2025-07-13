'use client';

import { useState } from 'react';
import {
  generateProductDemandForecast,
  GenerateProductDemandForecastOutput,
} from '@/ai/flows/generate-product-demand-forecast';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, TestTube2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const baseDemand = 1200;
const chartConfig = {
    baseline: { label: "Baseline", color: "hsl(var(--chart-1))" },
    simulated: { label: "Simulated", color: "hsl(var(--chart-2))" },
};

export default function SimulationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateProductDemandForecastOutput | null>(null);
  const [chartData, setChartData] = useState([
    { name: "Demand", baseline: baseDemand, simulated: baseDemand },
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productName = formData.get('productName') as string;
    const trendMagnitude = formData.get('trendMagnitude') as string;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setChartData([{ name: "Demand", baseline: baseDemand, simulated: baseDemand }]);

    const trendText = {
        'Low': 'A minor influencer mentioned the product.',
        'Medium': 'Product is featured in several popular videos.',
        'High': 'Product has gone viral on TikTok with a dedicated hashtag challenge.'
    }[trendMagnitude] || 'No significant trend.';

    try {
      const forecastResult = await generateProductDemandForecast({
        productName,
        socialMediaTrends: trendText,
        historicalSalesData: `Baseline weekly sales of ${baseDemand} units.`,
        weatherData: 'Standard conditions.',
        locationData: 'Average urban store.',
      });
      setResult(forecastResult);
      
      const demandMatch = forecastResult.demandForecast.match(/(\d{1,3}(,\d{3})*(\.\d+)?)/);
      const simulatedDemand = demandMatch ? parseFloat(demandMatch[0].replace(/,/g, '')) : baseDemand * 1.5;

      setChartData([{ name: "Demand", baseline: baseDemand, simulated: simulatedDemand }]);

    } catch (err) {
      setError('Failed to run simulation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader
        title="Trend Simulation"
        description="Simulate the impact of viral trends on product demand."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Simulation Setup</CardTitle>
            <CardDescription>
              Define parameters to see how social trends affect forecasts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  name="productName"
                  defaultValue="Stanley Quencher Tumbler"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trendMagnitude">Viral Trend Magnitude</Label>
                <Select name="trendMagnitude" defaultValue="Medium">
                  <SelectTrigger>
                    <SelectValue placeholder="Select trend magnitude" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Run Simulation
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-8">
            {isLoading && (
                <div className="flex h-full min-h-64 items-center justify-center rounded-lg border border-dashed">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            )}
            {error && !isLoading && <div className="text-destructive">{error}</div>}
            {result && !isLoading && (
                <>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                        <div className="rounded-full bg-primary/10 p-3">
                            <TestTube2 className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>Simulation Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {result.demandForecast}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Demand Comparison</CardTitle>
                        <CardDescription>Baseline vs. Simulated Demand</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={chartConfig} className="h-[200px] w-full">
                            <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid horizontal={false} />
                                <XAxis type="number" hide />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="baseline" fill="var(--color-baseline)" radius={4} name="Baseline" />
                                <Bar dataKey="simulated" fill="var(--color-simulated)" radius={4} name="Simulated" />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                </>
            )}
        </div>
      </div>
    </div>
  );
}
