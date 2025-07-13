'use client';

import { useState } from 'react';
import { analyzeSocialTrends, AnalyzeSocialTrendsOutput } from '@/ai/flows/analyze-social-trends';
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, TrendingUp, ThumbsUp, ThumbsDown, MessageCircle, BarChartBig, Instagram } from 'lucide-react';

function SentimentBar({ positive, negative, neutral }: { positive: number, negative: number, neutral: number}) {
    const total = positive + negative + neutral;
    if (total === 0) return <div className="h-2 w-full rounded-full bg-muted" />;
    
    const pPositive = (positive / total) * 100;
    const pNegative = (negative / total) * 100;

    return (
        <div className="flex w-full h-2 rounded-full overflow-hidden bg-muted">
            <div className="bg-green-500" style={{ width: `${pPositive}%` }} />
            <div className="bg-red-500" style={{ width: `${pNegative}%` }} />
        </div>
    )
}

const platformIcons: Record<string, React.ReactNode> = {
    Instagram: <Instagram className="h-4 w-4 text-pink-500" />,
    Twitter: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </svg>
    ),
    Reddit: (
         <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.78 12.65c-.55.55-1.44.55-1.99 0l-3.2-3.2c-.1-.1-.15-.24-.15-.38s.05-.28.15-.38l3.2-3.2c.55-.55 1.44-.55 1.99 0s.55 1.44 0 1.99L11.78 12l2.01 2.01c.55.55.55 1.44 0 1.99z"/>
        </svg>
    ),
    TikTok: (
         <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.83-1-6.7-2.9-1.25-1.25-2.07-2.82-2.34-4.51-.01-.01-.01-.02 0-.03v-2.52c.28 1.13.78 2.18 1.55 3.08 1.52 1.78 3.82 2.72 6.02 2.51 1.01-.1 1.96-.51 2.76-1.15.79-.64 1.32-1.5 1.58-2.48.01-3.32.01-6.64.01-9.97-.02-1.15-.49-2.25-1.22-3.1-.96-1.12-2.38-1.78-3.86-1.78-.01 0-.01 0 0 0-.42 0-.83.06-1.23.19v4.22c.44-.13.9-.19 1.38-.19.98 0 1.93.37 2.63 1.07.7.7 1.07 1.68 1.07 2.67 0 1.01-.39 1.99-1.1 2.71-.71.71-1.69 1.1-2.71 1.1-.98 0-1.95-.39-2.66-1.09-.7-.7-.99-1.61-1-2.58V.02z"/>
        </svg>
    )
}

export default function TrendMiningPage() {
  const [productName, setProductName] = useState('Stanley Quencher Tumbler');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeSocialTrendsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName) {
      setError('Please enter a product name.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const output = await analyzeSocialTrends({
        productName,
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
        description="Analyze social media trends for any product across multiple platforms."
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
                    <div className="p-2 rounded-md bg-muted text-sm text-muted-foreground">
                        Analyzing Instagram, Twitter/X, Reddit & TikTok (simulated).
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
                 <p className="text-sm text-muted-foreground">The AI is scraping data from social platforms. This may take a moment.</p>
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
                        {result.trendingTopics.length > 0 ? result.trendingTopics.map((topic, i) => (
                            <span key={i} className="px-3 py-1 text-sm rounded-full bg-secondary text-secondary-foreground">#{topic}</span>
                        )) : <p className="text-sm text-muted-foreground">No specific topics identified.</p>}
                    </CardContent>
                </Card>
                 <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Sentiment Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(result.sentimentBreakdown).map(([platform, scores]) => {
                           const total = scores.positive + scores.negative + scores.neutral;
                           if (total === 0) return null;
                           return (
                            <div key={platform} className="">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm flex items-center gap-2">
                                      {platformIcons[platform]}
                                      {platform}
                                    </span>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1 text-green-500"><ThumbsUp className="h-3 w-3" /> {scores.positive}</span>
                                        <span className="flex items-center gap-1 text-red-500"><ThumbsDown className="h-3 w-3" /> {scores.negative}</span>
                                        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {scores.neutral}</span>
                                    </div>
                                </div>
                                <SentimentBar {...scores} />
                            </div>
                           )
                        })}
                    </CardContent>
                </Card>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
