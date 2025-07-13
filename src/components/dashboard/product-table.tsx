
'use client';

import Image from 'next/image';
import { MoreHorizontal, Loader2, Zap, MessageSquare, Twitter, Bot } from 'lucide-react';
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
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { analyzeSocialTrends, AnalyzeSocialTrendsOutput } from '@/ai/flows/analyze-social-trends';
import { Separator } from '../ui/separator';

function RedditIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
        >
        <path d="M12.12,2.48a2.53,2.53,0,0,0-1.28.39,11.33,11.33,0,0,0-3,1.48,21.52,21.52,0,0,0-4.43,5,2.49,2.49,0,0,0,.1,2.83,6.59,6.59,0,0,0,2.94,2.48c.15.06,1,.4,2.43.13a.14.14,0,0,0,.1-.13,1.26,1.26,0,0,0,0-.42c0-.2-.11-.42-.11-.63s0-.41.05-.62a1.3,1.3,0,0,1,.4-.71,3.46,3.46,0,0,1,2.15-.88,3.29,3.29,0,0,1,2.1.8,1.26,1.26,0,0,1,.45.75c0,.2,0,.41.05.62s-.1.42-.1.63a1.26,1.26,0,0,0,0,.42.14.14,0,0,0,.1.13c1.44.27,2.28-.07,2.43-.13a6.59,6.59,0,0,0,2.94-2.48,2.49,2.49,0,0,0,.1-2.83A21.52,21.52,0,0,0,16.27,4.35a11.33,11.33,0,0,0-3-1.48,2.53,2.53,0,0,0-1.12-.42Zm-5,10.63a1.44,1.44,0,1,1,1.44,1.44A1.44,1.44,0,0,1,7.08,13.11Zm7,0a1.44,1.44,0,1,1,1.44,1.44A1.44,1.44,0,0,1,14.05,13.11Zm3.19,3.52c-.22.22-.44.45-.66.66a1.69,1.69,0,0,1-2.38,0,1,1,0,0,0-1.37,0,3.58,3.58,0,0,1-5.06,0,1,1,0,0,0-1.37,0,1.69,1.69,0,0,1-2.38,0c-.22-.21-.44-.44-.66-.66a.75.75,0,0,1,1-1.1l.66.66a.2.2,0,0,0,.28,0c.1-.1.21-.21.31-.31a2.53,2.53,0,0,0,1.38,1.21,4.7,4.7,0,0,0,5.92,0,2.53,2.53,0,0,0,1.38-1.21c.1.1.21.21.31.31a.2.2,0,0,0,.28,0l.66-.66a.75.75,0,0,1,1,1.1Z" />
        </svg>
    );
}

const platformIcons = {
    X: <Twitter className="h-4 w-4 text-[#1DA1F2]" />,
    Reddit: <RedditIcon className="h-4 w-4 text-[#FF4500]" />,
}

export function ProductTable({ products }: { products: Product[] }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSocialTrendsOutput | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

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
          AI-generated list of trending products based on market analysis.
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
            {products.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No products match the current filter.
                    </TableCell>
                </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={product.name}
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
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{selectedProduct.name}</DialogTitle>
                    <DialogDescription>
                        Product ID: {selectedProduct.id}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex justify-center items-center">
                            <Image
                                src={selectedProduct.imageUrl}
                                alt={selectedProduct.name}
                                width={128}
                                height={128}
                                className="rounded-lg border"
                                data-ai-hint={selectedProduct.name.toLowerCase().split(' ').slice(0, 2).join(' ')}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div className="font-semibold text-muted-foreground">Category</div>
                            <div>{selectedProduct.category}</div>
                            
                            <div className="font-semibold text-muted-foreground">Inventory Status</div>
                            <div>
                                <Badge
                                    variant="outline"
                                    className={getStatusBadgeClass(selectedProduct.inventoryStatus)}
                                >
                                    {selectedProduct.inventoryStatus}
                                </Badge>
                            </div>

                            <div className="font-semibold text-muted-foreground">Forecasted Demand</div>
                            <div>{selectedProduct.forecastedDemand.toLocaleString()} units</div>

                            <div className="font-semibold text-muted-foreground">Last Updated</div>
                            <div>{selectedProduct.lastUpdated}</div>
                        </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Real-Time Social Signals</h4>
                        {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                           <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                                {selectedProduct.reviews.map((review, index) => (
                                    <a
                                        key={index}
                                        href={review.postUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block transition-all hover:bg-secondary/50 rounded-lg"
                                    >
                                        <Card className="bg-secondary/30 hover:border-primary/50">
                                            <CardContent className="p-3">
                                                <div className="flex items-start gap-3">
                                                    <span className="mt-1">{platformIcons[review.platform]}</span>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-foreground">{review.text}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">@{review.username}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-4">
                                No specific reviews were highlighted for this trend by the AI.
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
