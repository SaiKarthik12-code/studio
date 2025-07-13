'use client';

import { useState } from 'react';
import { analyzeSocialTrends, AnalyzeSocialTrendsOutput } from '@/ai/flows/analyze-social-trends';
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, TrendingUp, ThumbsUp, ThumbsDown, MessageCircle, BarChartBig } from 'lucide-react';

const socialPlatforms = [
  { id: 'TikTok', label: 'TikTok' },
  { id: 'Instagram', label: 'Instagram' },
  { id: 'X', label: 'X (Twitter)' },
  { id: 'Reddit', label: 'Reddit' },
] as const;

type SocialPlatform = (typeof socialPlatforms)[number]['id'];

export default function TrendMiningPage() {
  const [productName, setProductName] = useState('Stanley Quencher Tumbler');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['TikTok', 'Instagram']);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeSocialTrendsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckboxChange = (platform: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || selectedPlatforms.length === 0) {
      setError('Please enter a product name and select at least one platform.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const output = await analyzeSocialTrends({
        productName,
        socialMediaPlatforms: selectedPlatforms,
      });
      setResult(output);
    } catch (err) {
      setError('Failed to analyze trends. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader
        title="Trend Mining"
        description="Analyze real-time social media trends for any product."
      />
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., Nintendo Switch"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Social Platforms</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {socialPlatforms.map((platform) => (
                      <div key={platform.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={platform.id}
                          checked={selectedPlatforms.includes(platform.id)}
                          onCheckedChange={() => handleCheckboxChange(platform.id)}
                        />
                        <Label htmlFor={platform.id} className="font-normal">
                          {platform.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Analyze Trends
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          {isLoading && (
            <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border border-dashed">
              <div className="flex flex-col items-center gap-2 text-center">
                 <Loader2 className="h-12 w-12 animate-spin text-primary" />
                 <h3 className="text-xl font-bold tracking-tight">Analyzing Social Signals...</h3>
                 <p className="text-sm text-muted-foreground">The AI is scraping data from social media. This may take a moment.</p>
              </div>
            </div>
          )}
          {error && <div className="text-destructive">{error}</div>}
          {result && (
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Overall Sentiment</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{result.overallSentiment}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Mention Volume</CardTitle>
                        <BarChartBig className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{result.volume.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Trending Topics</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {result.trendingTopics.map((topic, i) => (
                            <span key={i} className="px-3 py-1 text-sm rounded-full bg-secondary text-secondary-foreground">{topic}</span>
                        ))}
                    </CardContent>
                </Card>
                 <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Sentiment Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(result.sentimentBreakdown).map(([platform, score]) => (
                            <div key={platform} className="flex items-center justify-between">
                                <span className="font-medium">{platform}</span>
                                <div className="flex items-center gap-2">
                                    <div className="text-sm text-green-500 flex items-center gap-1"><ThumbsUp className="h-4 w-4" /> {Math.round(score * 100)}%</div>
                                    <div className="text-sm text-red-500 flex items-center gap-1"><ThumbsDown className="h-4 w-4" /> {Math.round((1-score) * 0.2 * 100)}%</div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {Math.round((1-score) * 0.8 * 100)}%</div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
