
'use client';

import Image from 'next/image';
import { MoreHorizontal, Instagram } from 'lucide-react';
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
import { AnalyzeSocialTrendsOutput } from '@/ai/flows/analyze-social-trends';
import { Separator } from '../ui/separator';

const platformIcons = {
    Instagram: <Instagram className="h-4 w-4 text-[#E1306C]" />,
}

export function ProductTable({ products }: { products: Product[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const handleDialogClose = () => {
    setSelectedProduct(null);
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
