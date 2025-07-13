
'use client';

import Image from 'next/image';
import { MoreHorizontal, Loader2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Product } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { analyzeSocialTrends, AnalyzeSocialTrendsOutput } from '@/ai/flows/analyze-social-trends';
import { Separator } from '../ui/separator';
import { fetchProducts } from '@/lib/data';

export function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSocialTrendsOutput | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);


  useEffect(() => {
    const getProducts = async () => {
      setIsLoading(true);
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch trending products:", error);
        // Optionally, set an error state here to show in the UI
      } finally {
        setIsLoading(false);
      }
    };
    getProducts();
  }, []);

  const handleAnalyzeTrends = async (productName: string) => {
    if (!productName) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);
    try {
      const result = await analyzeSocialTrends({
        productName,
        socialMediaPlatforms: ['TikTok', 'Instagram', 'X'],
      });
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisError('Failed to analyze trends. Please try again.');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDialogClose = () => {
    setSelectedProduct(null);
    setAnalysisResult(null);
    setAnalysisError(null);
  }

  const getStatusBadgeClass = (status: Product['inventoryStatus']) => {
    switch (status) {
      case 'Understock':
        return 'bg-red-500/20 text-red-700 border-red-500/30 dark:text-red-400';
      case 'Overstock':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400';
      case 'Optimal':
        return 'bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400';
      default:
        return '';
    }
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Trending Products</CardTitle>
        <CardDescription>
          Live product data from our inventory system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Inventory Status</TableHead>
              <TableHead className="hidden md:table-cell">
                Forecasted Demand
              </TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-16 w-16 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                     <Skeleton className="h-6 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt="Product image"
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.imageUrl}
                      width="64"
                      data-ai-hint={product.name.toLowerCase().split(' ').slice(0, 2).join(' ')}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusBadgeClass(product.inventoryStatus)}
                    >
                      {product.inventoryStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {product.forecastedDemand.toLocaleString()} units
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {product.category}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => setSelectedProduct(product)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Adjust Forecast</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{selectedProduct.name}</DialogTitle>
                    <DialogDescription>
                        Product ID: {selectedProduct.id}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex justify-center">
                        <Image
                            src={selectedProduct.imageUrl}
                            alt={selectedProduct.name}
                            width={128}
                            height={128}
                            className="rounded-lg border"
                            data-ai-hint={selectedProduct.name.toLowerCase().split(' ').slice(0, 2).join(' ')}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        <div className="font-semibold">Category</div>
                        <div>{selectedProduct.category}</div>
                        
                        <div className="font-semibold">Inventory Status</div>
                        <div>
                             <Badge
                                variant="outline"
                                className={getStatusBadgeClass(selectedProduct.inventoryStatus)}
                            >
                                {selectedProduct.inventoryStatus}
                            </Badge>
                        </div>

                        <div className="font-semibold">Forecasted Demand</div>
                        <div>{selectedProduct.forecastedDemand.toLocaleString()} units</div>

                        <div className="font-semibold">Last Updated</div>
                        <div>{selectedProduct.lastUpdated}</div>
                    </div>

                    <Separator className="my-2" />
                    
                    <div className="space-y-4">
                      <Button onClick={() => handleAnalyzeTrends(selectedProduct.name)} disabled={isAnalyzing} className="w-full">
                        {isAnalyzing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Zap className="mr-2 h-4 w-4" />
                        )}
                        Analyze Live Trends
                      </Button>

                      {isAnalyzing && (
                        <div className="text-center text-sm text-muted-foreground">
                          AI is analyzing social signals...
                        </div>
                      )}

                      {analysisError && <div className="text-sm text-destructive text-center">{analysisError}</div>}

                      {analysisResult && (
                        <div className="space-y-4 rounded-lg border bg-secondary/50 p-4">
                          <h4 className="font-semibold text-center">Live Trend Analysis</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="font-medium">Overall Sentiment</div>
                              <div className="text-lg font-bold capitalize">{analysisResult.overallSentiment}</div>
                            </div>
                            <div>
                              <div className="font-medium">Mention Volume</div>
                              <div className="text-lg font-bold">{analysisResult.volume.toLocaleString()}</div>
                            </div>
                            <div className="col-span-2">
                              <div className="font-medium">Trending Topics</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {analysisResult.trendingTopics.map((topic, i) => (
                                    <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground">{topic}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )}
    </>
  );
}
